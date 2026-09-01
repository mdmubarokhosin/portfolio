
import { NextRequest, NextResponse } from 'next/server'
import { dbPortfolio } from '@/lib/firebase'
import { verifyAuth } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (section) {
      const data = await dbPortfolio.findUnique(section)
      return NextResponse.json(data ?? { section, dataJson: '{}' })
    }

    const allData = await dbPortfolio.getAllAsObject()
    return NextResponse.json(allData)
  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { section, data } = body

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    const dataJson = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

    const result = await dbPortfolio.upsert(section, dataJson)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Portfolio PUT error:', error)
    return NextResponse.json({ error: 'Failed to update portfolio data' }, { status: 500 })
  }
}
