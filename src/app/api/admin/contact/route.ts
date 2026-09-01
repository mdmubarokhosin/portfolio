
import { NextRequest, NextResponse } from 'next/server'
import { dbContact, dbSettings } from '@/lib/firebase'
import { verifyAuth } from '@/lib/admin-auth'

// ── Telegram Helper ──────────────────────────────────────────────────────

async function sendTelegramNotification(data: {
  name: string;
  email: string;
  subject: string;
  budget?: string | null;
  message: string;
}): Promise<boolean> {
  try {
    // Fetch Telegram settings from Firebase
    const [tokenResult, chatIdResult] = await Promise.all([
      dbSettings.findUnique('telegram_bot_token'),
      dbSettings.findUnique('telegram_chat_id'),
    ]);

    const botToken = tokenResult?.value;
    const chatId = chatIdResult?.value;

    if (!botToken || !chatId) {
      console.log('Telegram not configured: missing bot_token or chat_id');
      return false;
    }

    // Format the message for Telegram
    const budgetText = data.budget ? `\n💰 Budget: ${data.budget}` : '';
    const escapedName = data.name.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    const escapedSubject = data.subject.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    const escapedEmail = data.email.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    const escapedBudget = data.budget ? data.budget.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1') : '';
    const escapedMessage = data.message.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');

    const text = [
      '📬 <b>New Contact Message</b>',
      '━━━━━━━━━━━━━━━━━━━',
      `<b>👤 Name:</b> ${escapedName}`,
      `<b>📧 Email:</b> ${escapedEmail}`,
      `<b>📋 Subject:</b> ${escapedSubject}`,
      escapedBudget ? `<b>💰 Budget:</b> ${escapedBudget}` : '',
      '',
      `<b>💬 Message:</b>`,
      `${escapedMessage}`,
      '━━━━━━━━━━━━━━━━━━━',
      `⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`,
    ].filter(Boolean).join('\n');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (res.ok) {
      console.log('Telegram notification sent successfully');
      return true;
    } else {
      const errorData = await res.text();
      console.error('Telegram API error:', res.status, errorData);
      return false;
    }
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

// ── Public POST — Contact Form Submission ────────────────────────────────

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, budget, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Save to Firebase
    const newMessage = await dbContact.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      budget: budget?.trim() || null,
      message: message.trim(),
    })

    // Send Telegram notification (must await — Cloudflare Edge kills fire-and-forget promises)
    const telegramOk = await sendTelegramNotification({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      budget: budget?.trim() || null,
      message: message.trim(),
    });

    console.log('Telegram notification result:', telegramOk ? 'sent' : 'failed');

    return NextResponse.json({ success: true, telegramSent: telegramOk, message: newMessage })
  } catch (error) {
    console.error('Contact POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// ── GET — Fetch messages (auth required) ───────────────────────────────

export async function GET(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const [messages, total, unreadCount] = await Promise.all([
      dbContact.findMany({ skip, take: limit }),
      dbContact.count(),
      dbContact.countUnread(),
    ])

    return NextResponse.json({
      messages,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Contact GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// ── PATCH — Mark message as read (auth required) ─────────────────────────

export async function PATCH(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, read } = body

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const message = await dbContact.update(id, { read: read !== undefined ? read : true })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Contact PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// ── DELETE — Delete message (auth required) ────────────────────────────

export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request).authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const result = await dbContact.delete(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Contact DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
