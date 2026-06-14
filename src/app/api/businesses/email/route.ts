import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// ── Types ──────────────────────────────────────────────────────────

interface SubjectLine {
  id: string
  subject: string
  style: string
  previewText: string
}

interface EmailContent {
  id: string
  type: string
  title: string
  subtitle: string
  subject: string
  previewText: string
  body: string
  wordCount: number
  tips: string[]
}

interface EmailGeneratorResponse {
  businessName: string
  category: string
  location: string
  generatedAt: string
  subjectLines: SubjectLine[]
  emails: EmailContent[]
  personalizationNotes: string
}

// ── Fallback: Local Email Generation ─────────────────────────────

function generateLocalEmails(
  businessName: string,
  category: string,
  location: string
): EmailGeneratorResponse {
  const categoryLabel = category || 'Business'
  const locationLabel = location || 'your area'

  const subjectLines: SubjectLine[] = [
    {
      id: 'sl_1',
      subject: `${businessName} — Your online presence is missing`,
      style: 'Direct',
      previewText: `Helping ${categoryLabel} businesses in ${locationLabel} get found online`,
    },
    {
      id: 'sl_2',
      subject: `${businessName} customers are searching for you online`,
      style: 'Curiosity',
      previewText: `Are they finding you or your competitors?`,
    },
    {
      id: 'sl_3',
      subject: `Quick question about ${businessName}'s website`,
      style: 'Casual',
      previewText: `It'll only take 30 seconds to read`,
    },
    {
      id: 'sl_4',
      subject: `${categoryLabel} businesses in ${locationLabel} are getting 3x more leads`,
      style: 'Data-driven',
      previewText: `Here's how ${businessName} can do the same`,
    },
    {
      id: 'sl_5',
      subject: `I found ${businessName} online — but something's missing`,
      style: 'Personal',
      previewText: `A quick idea that could bring you more customers`,
    },
    {
      id: 'sl_6',
      subject: `Free website audit for ${businessName}`,
      style: 'Value-offer',
      previewText: `No strings attached — just actionable insights`,
    },
  ]

  const emails: EmailContent[] = [
    {
      id: 'cold_email',
      type: 'cold_email',
      title: 'Cold Email',
      subtitle: 'First outreach — spark curiosity & offer value',
      subject: `I found ${businessName} online — but something's missing`,
      previewText: `Helping ${categoryLabel} businesses in ${locationLabel} get found online`,
      body: `Hi there,

I was searching for ${categoryLabel.toLowerCase()} services in ${locationLabel} and came across ${businessName}. Your business looks great, but I noticed you don't have a website — and that means potential customers are finding your competitors instead.

Here's the thing: 97% of consumers search online for local businesses before making a decision. Without a website, ${businessName} is invisible to all of them.

I help businesses like yours get online quickly and affordably. A simple, professional website can:

• Appear in Google searches when people look for "${categoryLabel} in ${locationLabel}"
• Showcase your services, hours, and contact info 24/7
• Capture leads even while you're busy with customers

I've put together a free audit for ${businessName} showing exactly where you're losing customers and how to fix it.

Would you like me to send it over? No strings attached.

Best regards,
[Your Name]
[Your Company]

P.S. — Most of our clients see a 30-50% increase in inquiries within the first month. Happy to share some case studies if you're curious.`,
      wordCount: 0,
      tips: [
        'Personalize the opening — show you actually researched their business',
        'Lead with the problem, not the solution',
        'Use specific numbers to build credibility',
        'Keep the CTA low-friction (just "want me to send it?")',
        'The P.S. line increases reply rates by 10-15%',
      ],
    },
    {
      id: 'follow_up_email',
      type: 'follow_up_email',
      title: 'Follow-up Email',
      subtitle: '3-5 days after cold email — add value & social proof',
      subject: `Re: ${businessName} — your competitors are getting your customers`,
      previewText: `Just wanted to make sure this didn't get lost in your inbox`,
      body: `Hi again,

I reached out a few days ago about helping ${businessName} get online. I know you're busy running a ${categoryLabel.toLowerCase()} business, so I'll keep this brief.

I wanted to share a quick story: We recently worked with a ${categoryLabel.toLowerCase()} business in ${locationLabel} that was in the exact same position — no website, relying only on walk-ins and word of mouth.

Within 60 days of launching their website:
• Google search traffic: 200+ visitors/month
• New customer inquiries: 18 per month
• Revenue increase: ₹45,000/month additional

The best part? Their website paid for itself in the first 2 weeks.

I've prepared a free competitive analysis for ${businessName} that shows:
1. How many people are searching for ${categoryLabel.toLowerCase()} services in ${locationLabel}
2. Which competitors are capturing those searches
3. A simple 3-step plan to start getting those customers instead

Want me to send it? Just reply "yes" and it's yours.

Best,
[Your Name]

P.S. — Even a single-page website can make a massive difference. I can show you examples if you'd like.`,
      wordCount: 0,
      tips: [
        'Reference your previous email — don\'t pretend it never happened',
        'Use a real (or realistic) case study with specific numbers',
        'Create urgency by showing competitor advantage',
        'Make the ask even simpler — just reply "yes"',
        'Short paragraphs = higher read rate',
      ],
    },
    {
      id: 'proposal_email',
      type: 'proposal_email',
      title: 'Proposal Email',
      subtitle: 'After positive response — present your offer professionally',
      subject: `Website proposal for ${businessName} — 3 options inside`,
      previewText: `Tailored packages for ${categoryLabel} businesses in ${locationLabel}`,
      body: `Hi there,

Thank you for your interest! Based on our conversation, I've put together a tailored proposal for ${businessName}'s online presence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SITUATION ANALYSIS

Currently, ${businessName} has:
✗ No website — invisible to online searchers
✗ No Google Business optimization — missing local search traffic
✗ No lead capture system — losing potential customers daily
✗ No SEO strategy — competitors rank instead of you

With a professional website, ${businessName} can:
✓ Appear in Google's "near me" searches
✓ Capture leads 24/7 with contact forms & WhatsApp integration
✓ Build credibility with customer reviews & testimonials
✓ Compete with larger ${categoryLabel.toLowerCase()} businesses in ${locationLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 OUR PACKAGES

🔹 STARTER — "Get Online" (₹9,999)
• 1-page responsive website
• Google Business Profile setup
• WhatsApp chat integration
• Mobile-optimized design
• 1 revision round
• Delivery: 7 days

🔹 PROFESSIONAL — "Grow Online" (₹24,999) ⭐ MOST POPULAR
• 5-page responsive website
• SEO optimization for local searches
• Google Business Profile + Maps integration
• WhatsApp & contact form integration
• Social media links & feed
• Review management setup
• 3 revision rounds
• Delivery: 14 days

🔹 PREMIUM — "Dominate Online" (₹49,999)
• 10+ page responsive website
• Full SEO strategy & implementation
• Google Ads setup (₹5,000 credit included)
• Booking/appointment system
• CRM integration for lead tracking
• WhatsApp Business API setup
• Monthly analytics reports (3 months)
• Unlimited revisions
• Delivery: 21 days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 WHY CHOOSE US

• 50+ websites launched for ${categoryLabel.toLowerCase()} businesses
• Average client sees ROI within 30 days
• Dedicated support for 6 months
• No hidden fees — transparent pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 NEXT STEPS

1. Choose your package (or we can customize one)
2. We'll schedule a 15-min kickoff call
3. Your website goes live within 7-21 days

Just reply with your preferred package, or let me know if you'd like to discuss customization.

Looking forward to helping ${businessName} grow! 🚀

Best regards,
[Your Name]
[Your Company]
[Phone] | [Email]

P.S. — If you sign up this week, I'll include a free social media setup worth ₹4,999.`,
      wordCount: 0,
      tips: [
        'Always include 3 pricing tiers — the middle one usually wins',
        'Mark one as "Most Popular" to guide their choice',
        'Show the problem before presenting the solution',
        'Include specific delivery timelines to build confidence',
        'Add a time-limited bonus to create urgency',
        'Make every line skimmable — use bullets & bold headers',
        'End with a clear, simple next step',
      ],
    },
  ]

  // Calculate word counts
  for (const email of emails) {
    email.wordCount = email.body.split(/\s+/).filter(Boolean).length
  }

  return {
    businessName,
    category: categoryLabel,
    location: locationLabel,
    generatedAt: new Date().toISOString(),
    subjectLines,
    emails,
    personalizationNotes: `These emails are personalized for ${businessName}, a ${categoryLabel} business in ${locationLabel}. Customize the sender details, pricing, and case studies based on your actual offerings.`,
  }
}

// ── POST: Generate Emails ───────────────────────────────────────

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

    // Generate base emails locally
    const localEmails = generateLocalEmails(bizName, bizCategory, bizLocation)

    // If AI enhancement requested, enhance with LLM
    if (useAI) {
      try {
        const zai = await ZAI.create()
        const aiResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `You are a world-class cold email copywriter specializing in B2B outreach for digital agencies. You write personalized, persuasive, professional emails that get replies and close deals. You understand Indian/Asian business culture and email communication norms.

Return ONLY a valid JSON object with this exact structure:
{
  "subjectLines": [
    { "id": "sl_1", "subject": "Subject line text", "style": "Direct|Curiosity|Casual|Data-driven|Personal|Value-offer", "previewText": "Preview text shown in email client" },
    { "id": "sl_2", "subject": "...", "style": "...", "previewText": "..." },
    { "id": "sl_3", "subject": "...", "style": "...", "previewText": "..." },
    { "id": "sl_4", "subject": "...", "style": "...", "previewText": "..." },
    { "id": "sl_5", "subject": "...", "style": "...", "previewText": "..." },
    { "id": "sl_6", "subject": "...", "style": "...", "previewText": "..." }
  ],
  "emails": [
    {
      "id": "cold_email",
      "subject": "Subject line for cold email",
      "previewText": "Preview text for cold email",
      "body": "Full email body with proper formatting, paragraphs, and line breaks. Professional but warm tone. Max 300 words.",
      "tips": ["tip1", "tip2", "tip3"]
    },
    {
      "id": "follow_up_email",
      "subject": "Subject line for follow-up",
      "previewText": "Preview text for follow-up",
      "body": "Full follow-up email body. Reference previous email. Include social proof and data. Max 250 words.",
      "tips": ["tip1", "tip2", "tip3"]
    },
    {
      "id": "proposal_email",
      "subject": "Subject line for proposal email",
      "previewText": "Preview text for proposal email",
      "body": "Full proposal email body. Include 3 pricing tiers (Starter/Professional/Premium). Professional formatting. Max 500 words.",
      "tips": ["tip1", "tip2", "tip3", "tip4"]
    }
  ],
  "personalizationNotes": "A note about how these emails were personalized for this specific business"
}

RULES:
- Subject lines should be 30-60 characters when possible for mobile optimization
- Cold email should feel like it's from a real person who researched this business
- Follow-up should reference the cold email and add new value (social proof, data)
- Proposal email should include 3 pricing tiers with specific features and pricing in INR
- Use the business name, category, and location naturally throughout
- Include specific numbers, percentages, and data points for credibility
- Every email should have a clear, low-friction CTA
- Preview text should complement the subject line, not repeat it
- Tips should be actionable advice for the sender`,
            },
            {
              role: 'user',
              content: `Generate personalized cold outreach emails for:

Business Name: ${bizName}
Category: ${bizCategory || 'General Business'}
Location: ${bizLocation || 'Unknown area'}

These emails are for a digital agency reaching out to sell website design, SEO, and WhatsApp Business services. The business likely has NO website currently.

Generate the emails now:`,
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

        // Merge AI-generated subject lines
        if (aiData.subjectLines && Array.isArray(aiData.subjectLines)) {
          localEmails.subjectLines = aiData.subjectLines.map((sl: any, idx: number) => ({
            id: sl.id || `sl_${idx + 1}`,
            subject: sl.subject || localEmails.subjectLines[idx]?.subject || '',
            style: sl.style || localEmails.subjectLines[idx]?.style || 'Direct',
            previewText: sl.previewText || '',
          }))
        }

        // Merge AI-generated emails
        if (aiData.emails && Array.isArray(aiData.emails)) {
          for (const aiEmail of aiData.emails) {
            const existingEmail = localEmails.emails.find(e => e.id === aiEmail.id)
            if (existingEmail) {
              if (aiEmail.subject) existingEmail.subject = aiEmail.subject
              if (aiEmail.previewText) existingEmail.previewText = aiEmail.previewText
              if (aiEmail.body) {
                existingEmail.body = aiEmail.body
                existingEmail.wordCount = aiEmail.body.split(/\s+/).filter(Boolean).length
              }
              if (aiEmail.tips && Array.isArray(aiEmail.tips)) {
                existingEmail.tips = aiEmail.tips
              }
            }
          }
        }

        if (aiData.personalizationNotes) {
          localEmails.personalizationNotes = aiData.personalizationNotes
        }
      } catch (aiError) {
        console.error('AI email enhancement failed, using local emails:', aiError)
        // Continue with local emails
      }
    }

    return NextResponse.json(localEmails)
  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate emails' },
      { status: 500 }
    )
  }
}
