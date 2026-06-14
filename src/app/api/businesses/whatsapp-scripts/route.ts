import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// ── Types ──────────────────────────────────────────────────────────

interface WhatsAppScript {
  id: string
  title: string
  subtitle: string
  message: string
  charCount: number
  tips: string[]
}

interface WhatsAppScriptsResponse {
  businessName: string
  category: string
  location: string
  generatedAt: string
  scripts: WhatsAppScript[]
  personalizationNotes: string
}

// ── Fallback: Local Script Generation ─────────────────────────────

function generateLocalScripts(
  businessName: string,
  category: string,
  location: string
): WhatsAppScriptsResponse {
  const categoryLabel = category || 'Business'
  const locationLabel = location || 'your area'

  const scripts: WhatsAppScript[] = [
    {
      id: 'cold_intro',
      title: 'Cold Introduction',
      subtitle: 'First message — break the ice',
      message: `Hi! 👋 I noticed ${businessName} doesn't have a website yet. I help local ${categoryLabel} businesses in ${locationLabel} get online and attract more customers.\n\nWould you be open to a quick 5-min chat about how a website could bring you 30-50% more inquiries? No pressure at all.\n\nJust reply "yes" and I'll share some ideas! 🚀`,
      charCount: 0,
      tips: [
        'Send during business hours (10am-12pm works best)',
        'Keep it casual and friendly',
        'End with a clear, low-commitment CTA',
      ],
    },
    {
      id: 'follow_up_1',
      title: 'Follow Up 1',
      subtitle: '2-3 days after cold intro — add value',
      message: `Hey! Just following up on my earlier message. 😊\n\nI did a quick analysis of ${businessName} and found that most ${categoryLabel} businesses in ${locationLabel} with a website get 3x more customer inquiries than those without one.\n\nI put together a free audit report for ${businessName} showing exactly where you're losing customers. Want me to send it over?\n\nNo strings attached — just valuable insights! 📊`,
      charCount: 0,
      tips: [
        'Reference the business name specifically',
        'Offer something free (audit, report, tips)',
        'Create urgency with data/numbers',
      ],
    },
    {
      id: 'follow_up_2',
      title: 'Follow Up 2',
      subtitle: '5-7 days after follow-up 1 — social proof',
      message: `Hi there! 👋 Just wanted to share a quick success story.\n\nWe recently helped a ${categoryLabel} business in ${locationLabel} go from zero online presence to getting 20+ new customers per month through their website + Google listing.\n\nTheir investment paid for itself in the first 2 weeks! 💪\n\nI'd love to show you what's possible for ${businessName}. Even a simple one-page site could make a huge difference.\n\nWorth a 5-min call this week? 📞`,
      charCount: 0,
      tips: [
        'Use social proof / case studies',
        'Mention ROI and time-to-results',
        'Suggest a specific next step (call/meeting)',
      ],
    },
    {
      id: 'follow_up_3',
      title: 'Follow Up 3',
      subtitle: '10-14 days after follow-up 2 — final nudge',
      message: `Hey! I know you're busy running ${businessName} — totally understand! 😅\n\nJust wanted to leave this here: I'm offering a FREE website mockup designed specifically for ${categoryLabel} businesses in ${locationLabel}.\n\nYou'll get to see exactly what your website could look like — no obligation, no cost.\n\nIf you're interested, just reply "mockup" and I'll get it to you within 48 hours! 🎨\n\nEither way, wishing ${businessName} continued success! 🙏`,
      charCount: 0,
      tips: [
        'Acknowledge they might be busy',
        'Offer something tangible and free',
        'Give an easy one-word reply option',
        'Leave the door open — no guilt trip',
      ],
    },
  ]

  // Calculate char counts
  for (const script of scripts) {
    script.charCount = script.message.length
  }

  return {
    businessName,
    category: categoryLabel,
    location: locationLabel,
    generatedAt: new Date().toISOString(),
    scripts,
    personalizationNotes: `These scripts are personalized for ${businessName}, a ${categoryLabel} business in ${locationLabel}. Customize further based on your conversation flow.`,
  }
}

// ── POST: Generate WhatsApp Scripts ───────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, businessName, category, location, useAI } = body

    let bizName = businessName || ''
    let bizCategory = category || ''
    let bizLocation = location || ''

    // If businessId provided, fetch from database
    if (businessId) {
      const business = await db.business.findUnique({ where: { id: businessId } })
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }
      bizName = business.name
      bizCategory = business.category
      bizLocation = [business.city, business.state, business.country].filter(Boolean).join(', ') || ''
    }

    if (!bizName) {
      return NextResponse.json(
        { error: 'Business name is required (provide businessId or businessName)' },
        { status: 400 }
      )
    }

    // Generate base scripts locally
    const localScripts = generateLocalScripts(bizName, bizCategory, bizLocation)

    // If AI enhancement requested, enhance with LLM
    if (useAI) {
      try {
        const zai = await ZAI.create()
        const aiResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `You are a world-class cold outreach copywriter specializing in WhatsApp sales messages for digital agencies. You write concise, personalized, persuasive messages that get replies. You understand Indian/Asian business culture and WhatsApp communication norms.

Return ONLY a valid JSON object with this exact structure:
{
  "scripts": [
    {
      "id": "cold_intro",
      "message": "The full WhatsApp message text here. Use natural language, emojis sparingly, and line breaks. Max 1000 chars.",
      "tips": ["tip1", "tip2", "tip3"]
    },
    {
      "id": "follow_up_1",
      "message": "...",
      "tips": ["tip1", "tip2"]
    },
    {
      "id": "follow_up_2",
      "message": "...",
      "tips": ["tip1", "tip2"]
    },
    {
      "id": "follow_up_3",
      "message": "...",
      "tips": ["tip1", "tip2", "tip3"]
    }
  ],
  "personalizationNotes": "A note about how these scripts were personalized for this specific business"
}

RULES:
- Each message MUST be under 1000 characters
- Use the business name, category, and location naturally in the message
- Messages should feel human, not robotic or salesy
- Use 1-3 emojis max per message, placed naturally
- Include line breaks for readability on mobile
- End each message with a clear, low-friction CTA
- Make follow-ups progressively more value-driven
- Follow Up 3 should be the "last attempt" with a free offer
- Tips should be actionable advice for the sender`,
            },
            {
              role: 'user',
              content: `Generate 4 personalized WhatsApp outreach scripts for:

Business Name: ${bizName}
Category: ${bizCategory || 'General Business'}
Location: ${bizLocation || 'Unknown area'}

These scripts are for a digital agency reaching out to sell website design, SEO, and WhatsApp Business services. The business likely has NO website currently.

Generate the scripts now:`,
            },
          ],
          thinking: { type: 'disabled' },
        })

        const aiContent = aiResponse.choices?.[0]?.message?.content || '{}'
        let cleaned = aiContent.trim()
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
        cleaned = cleaned.trim()

        const aiData = JSON.parse(cleaned)

        if (aiData.scripts && Array.isArray(aiData.scripts)) {
          // Merge AI-generated scripts with our structure
          for (const aiScript of aiData.scripts) {
            const existingScript = localScripts.scripts.find(s => s.id === aiScript.id)
            if (existingScript) {
              existingScript.message = aiScript.message || existingScript.message
              existingScript.charCount = existingScript.message.length
              if (aiScript.tips && Array.isArray(aiScript.tips)) {
                existingScript.tips = aiScript.tips
              }
            }
          }
        }

        if (aiData.personalizationNotes) {
          localScripts.personalizationNotes = aiData.personalizationNotes
        }
      } catch (aiError) {
        console.error('AI script enhancement failed, using local scripts:', aiError)
        // Continue with local scripts
      }
    }

    return NextResponse.json(localScripts)
  } catch (error) {
    console.error('WhatsApp scripts generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp scripts' },
      { status: 500 }
    )
  }
}
