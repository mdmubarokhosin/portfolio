
import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRemove } from '@/lib/firebase'
import { verifyAuth } from '@/lib/admin-auth'

// ── Known / Valid top-level Firebase keys ───────────────────────────────
// These are the ONLY paths the website actually reads from.

const KNOWN_TOP_KEYS = ['users', 'settings', 'portfolio', 'contactMessages'] as const

// Known portfolio sections (keys from portfolio.json)
const KNOWN_PORTFOLIO_SECTIONS = [
  'personal', 'stats', 'pages', 'socialLinks', 'services',
  'skills', 'skillCategories', 'additionalTools', 'projects',
  'projectCategories', 'experiences', 'education', 'testimonials',
  'certificates', 'faq', 'contactInfo',
] as const

// Known setting keys (actually read by the app)
const KNOWN_SETTING_KEYS = [
  'chatbot_provider', 'chatbot_model', 'chatbot_apiKey', 'chatbot_systemPrompt',
  'chatbot_welcomeMessage', 'chatbot_welcomeMessageBn', 'chatbot_placeholder', 'chatbot_placeholderBn',
  'chatbot_maxTokens', 'chatbot_temperature', 'chatbot_enabled',
  'theme_primaryColor', 'theme_accentColor', 'theme_fontFamily',
  'site_name', 'site_description',
  'telegram_bot_token', 'telegram_chat_id',
] as const

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ── GET /api/admin/cleanup — Scan for dead data ─────────────────────────

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const root = await dbGet<Record<string, unknown>>('')
    if (!root) {
      return NextResponse.json({
        deadTopKeys: [],
        orphanedPortfolioSections: [],
        orphanedSettingKeys: [],
        totalWaste: '0 B',
        totalWasteBytes: 0,
        scanTime: new Date().toISOString(),
      })
    }

    // 1. Dead top-level keys
    const deadTopKeys: Array<{ key: string; size: string; sizeBytes: number }> = []
    let totalBytes = 0

    for (const [key, value] of Object.entries(root)) {
      if (!(KNOWN_TOP_KEYS as readonly string[]).includes(key)) {
        const bytes = new TextEncoder().encode(JSON.stringify(value)).length
        totalBytes += bytes
        deadTopKeys.push({ key, size: formatBytes(bytes), sizeBytes: bytes })
      }
    }

    // 2. Orphaned portfolio sections (sections in DB not in default JSON)
    const orphanedPortfolioSections: Array<{ key: string; size: string; sizeBytes: number }> = []
    const portfolioData = root.portfolio as Record<string, unknown> | undefined
    if (portfolioData && typeof portfolioData === 'object') {
      for (const [key, value] of Object.entries(portfolioData)) {
        if (!(KNOWN_PORTFOLIO_SECTIONS as readonly string[]).includes(key)) {
          const bytes = new TextEncoder().encode(JSON.stringify(value)).length
          totalBytes += bytes
          orphanedPortfolioSections.push({ key, size: formatBytes(bytes), sizeBytes: bytes })
        }
      }
    }

    // 3. Orphaned setting keys
    const orphanedSettingKeys: Array<{ key: string; size: string; sizeBytes: number }> = []
    const settingsData = root.settings as Record<string, unknown> | undefined
    if (settingsData && typeof settingsData === 'object') {
      for (const [key, value] of Object.entries(settingsData)) {
        if (!(KNOWN_SETTING_KEYS as readonly string[]).includes(key)) {
          const bytes = new TextEncoder().encode(JSON.stringify(value)).length
          totalBytes += bytes
          orphanedSettingKeys.push({ key, size: formatBytes(bytes), sizeBytes: bytes })
        }
      }
    }

    return NextResponse.json({
      deadTopKeys,
      orphanedPortfolioSections,
      orphanedSettingKeys,
      totalWaste: formatBytes(totalBytes),
      totalWasteBytes: totalBytes,
      scanTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cleanup scan error:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}

// ── POST /api/admin/cleanup — Delete detected dead data ─────────────────

export async function POST(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { deadTopKeys, orphanedPortfolioSections, orphanedSettingKeys } = body as {
      deadTopKeys?: string[]
      orphanedPortfolioSections?: string[]
      orphanedSettingKeys?: string[]
    }

    const deleted: Array<{ path: string; success: boolean }> = []

    // Delete dead top-level keys
    if (Array.isArray(deadTopKeys)) {
      for (const key of deadTopKeys) {
        if ((KNOWN_TOP_KEYS as readonly string[]).includes(key)) continue // Safety: never delete known keys
        const ok = await dbRemove(key)
        deleted.push({ path: key, success: ok })
      }
    }

    // Delete orphaned portfolio sections
    if (Array.isArray(orphanedPortfolioSections)) {
      for (const key of orphanedPortfolioSections) {
        if ((KNOWN_PORTFOLIO_SECTIONS as readonly string[]).includes(key)) continue // Safety
        const ok = await dbRemove(`portfolio/${key}`)
        deleted.push({ path: `portfolio/${key}`, success: ok })
      }
    }

    // Delete orphaned setting keys
    if (Array.isArray(orphanedSettingKeys)) {
      for (const key of orphanedSettingKeys) {
        if ((KNOWN_SETTING_KEYS as readonly string[]).includes(key)) continue // Safety
        const ok = await dbRemove(`settings/${key}`)
        deleted.push({ path: `settings/${key}`, success: ok })
      }
    }

    const succeeded = deleted.filter(d => d.success).length
    const failed = deleted.filter(d => !d.success).length

    return NextResponse.json({
      message: `Cleanup complete: ${succeeded} deleted, ${failed} failed`,
      deleted,
      totalDeleted: succeeded,
      totalFailed: failed,
    })
  } catch (error) {
    console.error('Cleanup POST error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
