
import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbSet, dbRemove } from '@/lib/firebase'
import { verifyAuth } from '@/lib/admin-auth'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ── GET /api/admin/backup — Full Database Backup ──────────────────────────

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    // Export full database or specific section
    const data = section ? await dbGet<any>(section) : await dbGet<Record<string, any>>('')

    if (data === null) {
      return NextResponse.json(
        { error: section ? `Section "${section}" not found` : 'Database is empty' },
        { status: 404 }
      )
    }

    // Calculate size for metadata
    const dataSize = new TextEncoder().encode(JSON.stringify(data)).length

    // Build backup metadata
    const backup = {
      _meta: {
        type: section ? 'partial' : 'full',
        section: section || null,
        exportedAt: new Date().toISOString(),
        exportedBy: 'Admin Panel',
        version: '2.0',
        totalSize: formatBytes(dataSize),
        totalBytes: dataSize,
        sectionCount: data ? Object.keys(data).length : 0,
      },
      data,
    }

    return NextResponse.json(backup)
  } catch (error) {
    console.error('Backup GET error:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

// ── POST /api/admin/backup — Preview Backup File Before Restoring ────────

export async function POST(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data } = body as { data: unknown }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 })
    }

    const backupData = data as Record<string, unknown>
    const sections = Object.keys(backupData)
    const sizeBytes = new TextEncoder().encode(JSON.stringify(backupData)).length
    
    // Check for recognized sections
    const knownSections = ['users', 'settings', 'contactMessages', 'portfolio']
    const foundKnown = sections.filter(s => knownSections.includes(s))
    const unknownSections = sections.filter(s => !knownSections.includes(s))

    return NextResponse.json({
      valid: true,
      sections,
      sectionCount: sections.length,
      totalSize: formatBytes(sizeBytes),
      totalBytes: sizeBytes,
      knownSections: foundKnown,
      unknownSections,
      hasUsers: sections.includes('users'),
      hasSettings: sections.includes('settings'),
      hasMessages: sections.includes('contactMessages'),
      hasPortfolio: sections.includes('portfolio'),
    })
  } catch (error) {
    console.error('Backup POST preview error:', error)
    return NextResponse.json({ error: 'Failed to preview backup' }, { status: 500 })
  }
}

// ── PUT /api/admin/backup — Full Database Restore ────────────────────────

export async function PUT(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, mode } = body as {
      data: Record<string, unknown>
      mode: 'replace' | 'merge' // replace = full overwrite, merge = merge with existing
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid backup data — must be a JSON object' }, { status: 400 })
    }

    if (mode !== 'replace' && mode !== 'merge') {
      return NextResponse.json({ error: 'Mode must be "replace" or "merge"' }, { status: 400 })
    }

    if (mode === 'merge') {
      // Merge: iterate top-level keys and use PATCH
      for (const [key, value] of Object.entries(data)) {
        const base = process.env.FIREBASE_DATABASE_URL?.replace(/\/$/, '') ||
          'https://md-mubarok-hossain-default-rtdb.firebaseio.com'
        const res = await fetch(`${base}/${key}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
        if (!res.ok) {
          console.error(`Failed to merge section: ${key}`)
        }
      }
    } else {
      // Replace: write entire database
      await dbSet('', data)
    }

    return NextResponse.json({
      message: `Database restored successfully (${mode} mode)`,
      sectionsRestored: Object.keys(data).length,
      mode,
    })
  } catch (error) {
    console.error('Backup PUT (restore) error:', error)
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 })
  }
}

// ── DELETE /api/admin/backup — Clear a section ──────────────────────────

export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (!section) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 })
    }

    const result = await dbRemove(section)

    return NextResponse.json({ message: `Section "${section}" cleared`, success: result })
  } catch (error) {
    console.error('Backup DELETE error:', error)
    return NextResponse.json({ error: 'Failed to clear section' }, { status: 500 })
  }
}
