
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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find user by ID (not email, since email might have been changed)
    const user = await dbUser.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password from Firebase
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Update password in Firebase
    await dbUser.update(user.email, { password: newPassword })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
