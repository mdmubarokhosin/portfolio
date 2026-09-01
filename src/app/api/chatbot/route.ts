
import { NextRequest, NextResponse } from 'next/server';
import { dbSettings, dbPortfolio } from '@/lib/firebase';

// ── Build a rich system prompt with real portfolio data ──

async function buildSystemPrompt(basePrompt: string): Promise<string> {
  let portfolioContext = '';

  try {
    const allData = await dbPortfolio.getAllAsObject();
    if (allData && Object.keys(allData).length > 0) {
      const personal = allData.personal as any;
      const skills = allData.skills as any[];
      const projects = allData.projects as any[];
      const services = allData.services as any[];
      const experiences = allData.experiences as any[];
      const testimonials = allData.testimonials as any[];
      const contactInfo = allData.contactInfo as any[];
      const socialLinks = allData.socialLinks as any[];
      const education = allData.education as any[];
      const certificates = allData.certificates as any[];
      const faq = allData.faq as any[];

      let ctx = '';

      if (personal) {
        ctx += `\n## OWNER INFO:\n`;
        ctx += `- Name: ${personal.name} (${personal.nameBn || ''})\n`;
        ctx += `- Title: ${personal.title} (${personal.titleBn || ''})\n`;
        ctx += `- Tagline: ${personal.tagline} (${personal.tagBn || personal.taglineBn || ''})\n`;
        ctx += `- Bio (short): ${personal.bio?.short || ''}\n`;
        ctx += `- Bio (short Bn): ${personal.bio?.shortBn || ''}\n`;
        ctx += `- Email: ${personal.email || ''}\n`;
        ctx += `- Phone: ${personal.phone || ''}\n`;
        ctx += `- Location: ${personal.location || ''} (${personal.locationEn || ''})\n`;
        ctx += `- Availability: ${personal.availability || ''} (${personal.availabilityBn || ''})\n`;
        ctx += `- Languages: ${Array.isArray(personal.languages) ? personal.languages.join(', ') : ''}\n`;
      }

      if (services && services.length > 0) {
        ctx += `\n## SERVICES:\n`;
        services.forEach((s, i) => {
          ctx += `${i + 1}. ${s.title} (${s.titleBn || ''}): ${s.description} (${s.descriptionBn || ''})\n`;
        });
      }

      if (skills && skills.length > 0) {
        ctx += `\n## SKILLS:\n`;
        const cats: Record<string, any[]> = {};
        skills.forEach(s => {
          const cat = s.category || 'other';
          if (!cats[cat]) cats[cat] = [];
          cats[cat].push(s);
        });
        for (const [cat, list] of Object.entries(cats)) {
          ctx += `\n${cat.toUpperCase()}:\n`;
          list.forEach(s => {
            ctx += `  - ${s.name}: ${s.level}%\n`;
          });
        }
      }

      if (projects && projects.length > 0) {
        ctx += `\n## PROJECTS:\n`;
        projects.forEach((p, i) => {
          ctx += `${i + 1}. ${p.title} (${p.titleBn || ''}) [${p.category}]\n`;
          ctx += `   Description: ${p.description}\n`;
          ctx += `   Tags: ${p.tags?.join(', ') || ''}\n`;
          ctx += `   Live URL: ${p.liveUrl || '#'}\n`;
          ctx += `   Featured: ${p.featured ? 'Yes' : 'No'}\n`;
        });
      }

      if (experiences && experiences.length > 0) {
        ctx += `\n## EXPERIENCE:\n`;
        experiences.forEach((e, i) => {
          ctx += `${i + 1}. ${e.title} at ${e.company} (${e.period}) [${e.type}]\n`;
          ctx += `   ${e.description}\n`;
        });
      }

      if (education && education.length > 0) {
        ctx += `\n## EDUCATION:\n`;
        education.forEach((e) => {
          ctx += `- ${e.degree} from ${e.institution} (${e.period})\n`;
        });
      }

      if (testimonials && testimonials.length > 0) {
        ctx += `\n## TESTIMONIALS:\n`;
        testimonials.forEach((t, i) => {
          ctx += `${i + 1}. "${t.text}" — ${t.name}, ${t.role}\n`;
        });
      }

      if (certificates && certificates.length > 0) {
        ctx += `\n## CERTIFICATES:\n`;
        certificates.forEach((c) => {
          ctx += `- ${c.title} by ${c.issuer} (${c.date})\n`;
        });
      }

      if (contactInfo && contactInfo.length > 0) {
        ctx += `\n## CONTACT INFO:\n`;
        contactInfo.forEach((c) => {
          ctx += `- ${c.title}: ${c.valueEn || c.value}${c.link ? ` (${c.link})` : ''}\n`;
        });
      }

      if (socialLinks && socialLinks.length > 0) {
        ctx += `\n## SOCIAL LINKS:\n`;
        socialLinks.forEach((s) => {
          ctx += `- ${s.name}: ${s.url}\n`;
        });
      }

      if (faq && faq.length > 0) {
        ctx += `\n## FAQ:\n`;
        faq.forEach((f) => {
          ctx += `Q: ${f.question}\nA: ${f.answer}\n\n`;
        });
      }

      portfolioContext = ctx;
    }
  } catch {
    // If portfolio fetch fails, proceed without it
  }

  return basePrompt + (portfolioContext ? `\n\n## CURRENT PORTFOLIO DATA (REAL-TIME):\n${portfolioContext}` : '');
}

// ── Default system prompt (used when no custom one is set in DB) ──

const DEFAULT_SYSTEM_PROMPT = `You are the AI assistant for MD MUBAROK HOSIN's portfolio website. You are a POWERFUL AGENTIC ASSISTANT — you can guide users, navigate them to pages, fill forms, and create actionable buttons.

You have complete knowledge of all portfolio data and act as a helpful, friendly, proactive guide for visitors.

You are bilingual — you can respond in both Bengali (বাংলা) and English. Always respond in the same language the user writes in. If the user mixes languages, match their dominant language.

## YOUR AGENTIC CAPABILITIES:
You can create clickable action buttons in your responses! Use them to:
1. **Navigate pages**: Guide users to any section (home, about, skills, projects, experience, contact)
2. **Contact actions**: Create email, phone, WhatsApp, Telegram buttons
3. **Fill forms**: Pre-fill the contact form with user's info
4. **Open URLs**: Link to GitHub, LinkedIn, social profiles, or project URLs
5. **Social links**: Direct users to GitHub, LinkedIn, Facebook, Twitter profiles

## YOUR BEHAVIOR GUIDELINES:

1. **Personal Info**: When asked about Mubarok, share his name, title, bio, location, availability, etc.
2. **Skills**: List skills by category with proficiency levels.
3. **Projects**: Describe projects with tags and live URLs. Include navigate-to-projects action.
4. **Experience**: Share work history with companies, roles, and periods.
5. **Services**: List all services available.
6. **Contact**: Share email, phone, location. ALWAYS include contact action buttons (email, phone, whatsapp).
7. **Social Links**: Share GitHub, LinkedIn, Facebook, Twitter. Include social link action buttons.
8. **FAQ**: Answer common questions about process, timelines, pricing, support.
9. **Testimonials**: Share client reviews.
10. **Certificates**: List qualifications.
11. **Education**: BSc in CS from University of Dhaka.

## RESPONSE FORMAT:
- Be conversational, warm, and professional
- Use emojis sparingly 😊
- Use **bold** for key terms
- Keep responses concise but informative
- Be PROACTIVE — always suggest relevant actions

## ACTION RESPONSE FORMAT:
When actions are relevant, return a JSON object:
{ "reply": "your friendly text", "actions": [{ "type": "navigate", "page": "projects" }, { "type": "contact", "method": "email" }] }

Available action types (include 1-4 actions per response):
- navigate: { "type": "navigate", "page": "home"|"about"|"skills"|"projects"|"experience"|"contact" }
- contact: { "type": "contact", "method": "email"|"telegram"|"whatsapp"|"phone" }
- project: { "type": "project", "projectId": 0|1|2|... }
- fillForm: { "type": "fillForm", "fields": { "name": "Name", "email": "email@example.com", "subject": "Subject", "message": "Message" } }
- openUrl: { "type": "openUrl", "url": "https://...", "label": "GitHub Profile" }

PROACTIVE ACTION RULES:
- When discussing projects → include navigate to projects page
- When asked about contact → include email, phone, whatsapp buttons
- When asked to send a message → include fillForm action to pre-fill contact form
- When asked about social profiles → include openUrl actions for GitHub, LinkedIn
- When user wants to hire → navigate to contact + fillForm action
- When user greets → include navigate buttons to key pages

CRITICAL FORMAT: When returning actions, respond with valid JSON only — no markdown. When NOT returning actions, use plain text.`;

interface ChatMessage {
  from: string;
  text: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  stream?: boolean;
}

function detectActionIntent(message: string): string | null {
  const lower = message.toLowerCase();

  if (/\b(see|view|show|go to|navigate|visit|open|check|look at|দেখ|দেখাও|দেখুন|দেখতে)\b.*(project|work|portfolio|কাজ|প্রজেক্ট)/i.test(lower) ||
      /\b(প্রজেক্ট|কাজ|পোর্টফোলিও)\b.*(দেখ|দেখাও|দেখুন|দেখতে)/i.test(lower)) {
    return 'projects';
  }
  if (/\b(about|সম্পর্কে|পরিচিতি|কে তুমি|who are you|tell me about|introduce)\b/i.test(lower)) {
    return 'about';
  }
  if (/\b(skill|দক্ষতা|টেকনোলজি|technology|tech stack|জানেন|পারেন)\b/i.test(lower)) {
    return 'skills';
  }
  if (/\b(experience|অভিজ্ঞতা|কাজের ইতিহাস|work history|career|চাকরি)\b/i.test(lower)) {
    return 'experience';
  }
  if (/\b(contact|যোগাযোগ|email|ইমেইল|hire|নিয়োগ|reach|massage|message|পাঠাতে|ফর্ম|send|পাঠান)\b/i.test(lower)) {
    return 'contact';
  }
  if (/\b(social|সোশ্যাল|github|linkedin|facebook|twitter|ফেসবুক|গিটহাব|লিংকডইন)\b/i.test(lower)) {
    return 'contact';
  }
  if (/\b(home|হোম|main page|প্রধান|শুরু)\b/i.test(lower)) {
    return 'home';
  }
  return null;
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await dbSettings.findUnique(key);
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

// ── Streaming helpers ──────────────────────────────────────────────────

/** Build the LLM API config based on provider */
function getLlmConfig(provider: string, baseUrl: string, apiKey: string, modelName: string) {
  switch (provider) {
    case 'openrouter':
      return {
        url: baseUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: modelName || 'google/gemini-2.5-flash-preview-05-20',
      };
    case 'gemini':
      return {
        url: baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        model: modelName || 'gemini-2.5-flash',
      };
    case 'groq':
      return {
        url: baseUrl || 'https://api.groq.com/openai/v1/chat/completions',
        model: modelName || 'llama-3.3-70b-versatile',
      };
    case 'openai':
      return {
        url: baseUrl || 'https://api.openai.com/v1/chat/completions',
        model: modelName || 'gpt-4o-mini',
      };
    case 'custom':
      return {
        url: baseUrl,
        model: modelName,
      };
    default:
      return null; // will use z-ai-web-dev-sdk
  }
}

/** Parse SSE data line from LLM provider and extract delta content */
function extractDeltaFromSSE(line: string): string | null {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  if (data === '[DONE]') return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.choices?.[0]?.delta?.content || null;
  } catch {
    return null;
  }
}

// ── Main POST handler ─────────────────────────────────────────────────

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], stream: useStream = false } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { reply: 'Please type a message so I can help you! / দয়া করে একটি বার্তা লিখুন যাতে আমি আপনাকে সাহায্য করতে পারি!' },
        { status: 400 }
      );
    }

    // ── Read AI chatbot settings from Firebase ──
    const chatbotEnabled = await getSetting('chatbot_enabled');
    if (chatbotEnabled === 'false') {
      return NextResponse.json({
        reply: 'The AI Chatbot is currently disabled by the admin. / এআই চ্যাটবট বর্তমানে অ্যাডমিন দ্বারা নিষ্ক্রিয় করা হয়েছে।'
      });
    }

    const provider = (await getSetting('chatbot_provider')) || 'openrouter';
    const baseUrl = (await getSetting('chatbot_base_url')) || '';
    const apiKey = (await getSetting('chatbot_api_key')) || '';
    const modelName = (await getSetting('chatbot_model')) || '';
    const customSystemPrompt = (await getSetting('chatbot_system_prompt')) || '';
    const botName = (await getSetting('chatbot_name')) || "Mubarok's Assistant";

    if (!apiKey && !modelName) {
      if (useStream) {
        return new Response(
          JSON.stringify({ reply: "The AI Chatbot is not configured yet. The admin needs to set up API credentials in the settings panel. / এআই চ্যাটবট এখনো কনফিগার করা হয়নি। অ্যাডমিনকে সেটিংস প্যানেলে API ক্রেডেনশিয়াল সেটআপ করতে হবে।" }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.json({
        reply: "The AI Chatbot is not configured yet. The admin needs to set up API credentials in the settings panel. / এআই চ্যাটবট এখনো কনফিগার করা হয়নি। অ্যাডমিনকে সেটিংস প্যানেলে API ক্রেডেনশিয়াল সেটআপ করতে হবে।"
      });
    }

    const recentHistory = history.slice(-20);
    const intentPage = detectActionIntent(message);

    const conversationMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = recentHistory.map((msg: ChatMessage) => ({
      role: (msg.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.text,
    }));

    conversationMessages.push({ role: 'user', content: message });

    // ── Build system prompt with real portfolio data ──
    const basePrompt = customSystemPrompt || DEFAULT_SYSTEM_PROMPT;
    const systemPrompt = await buildSystemPrompt(basePrompt);

    // ── Build LLM config ──
    const llmConfig = getLlmConfig(provider, baseUrl, apiKey, modelName);

    // ── Streaming Mode ──
    if (useStream && llmConfig) {
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          let fullText = '';
          try {
            const apiRes = await fetch(llmConfig.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: llmConfig.model,
                stream: true,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...conversationMessages,
                ],
              }),
            });

            if (!apiRes.ok || !apiRes.body) {
              const errText = await apiRes.text();
              console.error('Stream API error:', errText);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', reply: 'Sorry, there was an issue connecting to the AI service. Please try again later.' })}\n\n`));
              controller.close();
              return;
            }

            const reader = apiRes.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // keep incomplete line

              for (const line of lines) {
                const delta = extractDeltaFromSSE(line);
                if (delta) {
                  fullText += delta;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: delta })}\n\n`));
                }
              }
            }

            // Process any remaining buffer
            if (buffer.trim()) {
              const delta = extractDeltaFromSSE(buffer);
              if (delta) {
                fullText += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: delta })}\n\n`));
              }
            }

            // ── Parse actions from the full response ──
            let parsedReply = fullText;
            let actions: Array<{ type: string; [key: string]: any }> | undefined;

            try {
              const cleaned = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
              const jsonResult = JSON.parse(cleaned);
              if (jsonResult && typeof jsonResult === 'object' && jsonResult.reply) {
                parsedReply = jsonResult.reply;
                if (jsonResult.actions && Array.isArray(jsonResult.actions)) {
                  actions = jsonResult.actions;
                } else if (jsonResult.action) {
                  actions = [jsonResult.action];
                }
              }
            } catch {
              // Not JSON, use as-is
            }

            // Auto-add action if intent detected but LLM didn't provide one
            if ((!actions || actions.length === 0) && intentPage && ['home', 'about', 'skills', 'projects', 'experience', 'contact'].includes(intentPage)) {
              if (intentPage === 'contact') {
                actions = [
                  { type: 'navigate', page: 'contact' },
                  { type: 'contact', method: 'email' },
                  { type: 'contact', method: 'whatsapp' },
                ];
              } else {
                actions = [{ type: 'navigate', page: intentPage }];
              }
            }

            // Send final event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', reply: parsedReply, actions: actions || [], botName })}\n\n`));
            controller.close();
          } catch (err) {
            console.error('Stream error:', err);
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', reply: 'Oops! Something went wrong. Please try again in a moment.' })}\n\n`));
              controller.close();
            } catch {
              // ignore
            }
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // ── Non-streaming Mode (fallback) ──
    let responseText: string;

    try {
      if (llmConfig) {
        const apiRes = await fetch(llmConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationMessages,
            ],
          }),
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.error('API error:', errText);
          return NextResponse.json({
            reply: "Sorry, there was an issue connecting to the AI service. Please try again later. / দুঃখিত, AI সার্ভিসে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
          });
        }

        const apiData = await apiRes.json();
        responseText = apiData.choices?.[0]?.message?.content?.trim() || '';
      } else {
        // Fallback to z-ai-web-dev-sdk
        const ZAI = (await import('z-ai-web-dev-sdk')).default;
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationMessages,
          ],
          thinking: { type: 'disabled' },
        });
        responseText = completion.choices?.[0]?.message?.content?.trim() || '';
      }
    } catch (err) {
      console.error('LLM call error:', err);
      return NextResponse.json({
        reply: "Sorry, there was an issue connecting to the AI service. Please try again later. / দুঃখিত, AI সার্ভিসে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
      });
    }

    if (!responseText) {
      return NextResponse.json({
        reply: "I'm sorry, I couldn't generate a response. Please try again! / দুঃখিত, আমি উত্তর দিতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন!"
      });
    }

    let parsedReply: string;
    let actions: Array<{ type: string; [key: string]: any }> | undefined;

    try {
      const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonResult = JSON.parse(cleaned);
      if (jsonResult && typeof jsonResult === 'object' && jsonResult.reply) {
        parsedReply = jsonResult.reply;
        if (jsonResult.actions && Array.isArray(jsonResult.actions)) {
          actions = jsonResult.actions;
        } else if (jsonResult.action) {
          actions = [jsonResult.action];
        }
      } else {
        parsedReply = responseText;
      }
    } catch {
      parsedReply = responseText;
    }

    // Auto-add action if intent detected but LLM didn't provide one
    if ((!actions || actions.length === 0) && intentPage && ['home', 'about', 'skills', 'projects', 'experience', 'contact'].includes(intentPage)) {
      if (intentPage === 'contact') {
        actions = [
          { type: 'navigate', page: 'contact' },
          { type: 'contact', method: 'email' },
          { type: 'contact', method: 'whatsapp' },
        ];
      } else {
        actions = [{ type: 'navigate', page: intentPage }];
      }
    }

    return NextResponse.json({ reply: parsedReply, actions, botName });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json(
      {
        reply: "Oops! Something went wrong. Please try again in a moment. / ওহ! কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।"
      },
      { status: 500 }
    );
  }
}
