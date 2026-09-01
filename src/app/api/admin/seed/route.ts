
import { NextResponse } from 'next/server'
import { dbUser, dbPortfolio } from '@/lib/firebase'

/**
 * POST /api/admin/seed — Smart admin seed
 *
 * Only creates a default admin user if ZERO admin users exist in Firebase.
 * This prevents the seed from overwriting the user's custom email/password.
 * The seed is called on every login screen load as a safety net.
 */
export const runtime = 'edge'

export async function POST() {
  try {
    // Step 1: Clean up corrupted user entries (missing required fields)
    const cleanedCount = await dbUser.cleanupInvalid()

    // Step 2: Check if ANY admin user already exists
    const allUsers = await dbUser.findAll()

    const hasAdmin = allUsers.some(
      (u: any) => u.role === 'admin' && u.email && u.password && u.id && u.name
    )

    if (hasAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists — skipping seed',
        adminCount: allUsers.filter((u: any) => u.role === 'admin').length,
        cleanedInvalid: cleanedCount,
      }, { status: 200 })
    }

    // No admin exists — create the default one
    const user = await dbUser.create({
      email: 'admin@mubarok.com',
      name: 'Admin',
      password: 'admin123',
      role: 'admin',
    })

    return NextResponse.json({
      message: 'Default admin user created',
      user: { id: user.id, email: user.email, name: user.name },
      warning: 'Please change the default email and password in Settings!',
    }, { status: 201 })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}

/**
 * GET /api/admin/seed — Seed portfolio data from static JSON
 */
export async function GET() {
  try {
    const defaultData = (await import('@/data/portfolio.json')).default

    let count = 0

    for (const [section, value] of Object.entries(defaultData)) {
      const dataJson = JSON.stringify(value)
      await dbPortfolio.upsert(section, dataJson)
      count++
    }

    return NextResponse.json({
      message: `Successfully seeded ${count} portfolio sections`,
      count,
      sections: Object.keys(defaultData),
    })
  } catch (error) {
    console.error('Portfolio seed error:', error)
    return NextResponse.json({ error: 'Failed to seed portfolio data', details: String(error) }, { status: 500 })
  }
}
