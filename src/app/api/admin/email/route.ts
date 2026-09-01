
import { NextRequest, NextResponse } from 'next/server'
import { dbUser } from '@/lib/firebase'
import { verifyAuth, createToken } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function PUT(request: NextRequest) {
  const { authenticated, userId } = verifyAuth(request)
  if (!authenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newEmail } = body

    if (!currentPassword || !newEmail) {
      return NextResponse.json({ error: 'Password and new email are required' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Find current user by ID
    const user = await dbUser.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Check if new email is already taken by another user
    const existing = await dbUser.findUniqueEmail(userId, newEmail)
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
    }

    // Remove old user entry, create new one with new email key
    const oldEmailKey = user.email.replace(/\./g, ',')
    const newEmailKey = newEmail.replace(/\./g, ',')

    await dbUser.deleteUser(oldEmailKey)

    const updatedUser = {
      ...user,
      email: newEmail,
      updatedAt: new Date().toISOString(),
    }
    await dbUser.setUser(newEmailKey, updatedUser)

    // Generate new token with updated email so user doesn't get logged out
    const newToken = createToken({
      id: updatedUser.id,
      email: newEmail,
      name: updatedUser.name ?? 'Admin',
      role: updatedUser.role,
    })

    return NextResponse.json({
      message: 'Email updated successfully',
      newEmail,
      token: newToken,
      user: {
        id: updatedUser.id,
        email: newEmail,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error('Email change error:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
