
import { NextRequest, NextResponse } from 'next/server'
import { dbUser } from '@/lib/firebase'
import { createToken } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email in Firebase
    const user = await dbUser.findByEmail(email)

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password against Firebase stored password
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Create auth token
    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
