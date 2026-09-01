
import { NextRequest, NextResponse } from 'next/server'
import { dbSettings } from '@/lib/firebase'
import { verifyAuth } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await dbSettings.findMany()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { settings } = body as { settings: Array<{ key: string; value: string }> }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
    }

    const results = await Promise.all(
      settings.map((item) =>
        dbSettings.upsert(item.key, item.value)
      )
    )

    return NextResponse.json({ message: 'Settings updated', count: results.length })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
