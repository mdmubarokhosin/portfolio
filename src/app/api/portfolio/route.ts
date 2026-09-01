
import { NextResponse } from 'next/server'
import { dbPortfolio } from '@/lib/firebase'
import defaultData from '@/data/portfolio.json'

export const runtime = 'edge'

export async function GET() {
  try {
    // Read all data from Firebase
    const dbOverlay = await dbPortfolio.getAllAsObject()

    // Merge: start with the full JSON file, then overwrite any sections
    // that exist in the database (DB takes precedence)
    const merged = { ...defaultData } as Record<string, unknown>
    for (const [section, value] of Object.entries(dbOverlay)) {
      merged[section] = value
    }

    return NextResponse.json(merged)
  } catch (error) {
    console.error('Public portfolio API error:', error)
    // If the database is completely unreachable, return the static JSON
    return NextResponse.json(defaultData)
  }
}
