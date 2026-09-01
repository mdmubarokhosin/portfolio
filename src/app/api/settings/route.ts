
import { NextResponse } from 'next/server'
import { dbSettings } from '@/lib/firebase'

export const runtime = 'edge'

export async function GET() {
  try {
    const settingsMap = await dbSettings.getAllAsMap()
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({})
  }
}
