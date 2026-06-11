import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// ── Audit Item Interface ──────────────────────────────────────────
interface AuditItem {
  id: string
  title: string
  status: 'critical' | 'warning' | 'good' | 'opportunity'
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  estimatedValue: number // estimated project value in USD
}

interface AuditReport {
  businessName: string
  category: string
  city: string | null
  country: string | null
  auditDate: string
  overallScore: number // 0-100 (lower = more issues = better lead opportunity)
  items: AuditItem[]
  summary: string
  totalOpportunityValue: number
  servicesRecommended: string[]
}

// ── Local Audit Logic (no AI required) ──────────────────────────

function performLocalAudit(business: {
  id: string
  name: string
  category: string
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  hasWebsite: boolean
  websiteStatus: string | null
  googleRating: number | null
  googleReviews: number | null
  reviewCount: number | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  socialPresence: number
  leadScore: number | null
  opportunityScore: number | null
  estimatedMonthlyRevenue: number | null
}): AuditReport {
  const items: AuditItem[] = []
  let score = 100 // Start at 100, subtract for issues
  const servicesRecommended: string[] = []
  let totalOpportunityValue = 0

  // ── 1. Website Missing ────────────────────────────────────────
  if (!business.hasWebsite || business.websiteStatus === 'NO_WEBSITE' || business.websiteStatus === 'SOCIAL_ONLY') {
    const isSocialOnly = business.websiteStatus === 'SOCIAL_ONLY'
    items.push({
      id: 'website_missing',
      title: isSocialOnly ? 'No Professional Website' : 'Website Missing',
      status: 'critical',
      description: isSocialOnly
        ? `${business.name} only has social media pages but no dedicated website. They are losing credibility and online visibility.`
        : `${business.name} does not have a website. Potential customers cannot find them through search engines or learn about their services online.`,
      recommendation: isSocialOnly
        ? `Design and develop a professional website for ${business.name}. Migrate key content from their social media pages. Ensure mobile-responsive design with clear CTAs.`
        : `Build a professional website for ${business.name} with service pages, contact form, Google Maps integration, and mobile-responsive design. Include SEO fundamentals.`,
      impact: 'high',
      estimatedValue: getWebsiteValue(business.category),
    })
    score -= 30
    servicesRecommended.push('Website Design & Development')
    totalOpportunityValue += getWebsiteValue(business.category)
  } else {
    items.push({
      id: 'website_missing',
      title: 'Website Present',
      status: 'good',
      description: `${business.name} has a website at ${business.website}. However, it may still need improvements in SEO, speed, or design.`,
      recommendation: 'Conduct a detailed website audit to identify UX, SEO, and performance improvements.',
      impact: 'low',
      estimatedValue: 500,
    })
  }

  // ── 2. SEO Missing ────────────────────────────────────────────
  const hasSEOIndicators = business.hasWebsite && business.googleRating && business.googleReviews && business.googleReviews > 20
  if (!business.hasWebsite || !hasSEOIndicators) {
    items.push({
      id: 'seo_missing',
      title: 'SEO Missing',
      status: business.hasWebsite ? 'warning' : 'critical',
      description: business.hasWebsite
        ? `${business.name} has a website but shows no signs of SEO optimization. They are likely invisible on Google for local searches like "${business.category} in ${business.city || 'their area'}".`
        : `Without a website, ${business.name} has zero SEO presence. They cannot rank on Google for any search terms related to their business.`,
      recommendation: business.hasWebsite
        ? `Implement local SEO strategy: optimize title tags, meta descriptions, header tags, create location-specific pages, set up Google Business Profile, and build local citations.`
        : `First build a website, then implement comprehensive local SEO including on-page optimization, Google Business Profile setup, local citations, and content strategy.`,
      impact: 'high',
      estimatedValue: getSEOValue(business.category),
    })
    score -= business.hasWebsite ? 15 : 25
    servicesRecommended.push('Local SEO Optimization')
    totalOpportunityValue += getSEOValue(business.category)
  } else {
    items.push({
      id: 'seo_missing',
      title: 'Basic SEO Present',
      status: 'good',
      description: `${business.name} shows some SEO indicators with ${business.googleReviews} Google reviews and a ${business.googleRating} rating.`,
      recommendation: 'Continue building SEO authority with content marketing and link building.',
      impact: 'low',
      estimatedValue: 300,
    })
  }

  // ── 3. Booking Missing ────────────────────────────────────────
  const bookingCategories = ['salon', 'beauty parlour', 'spa', 'gym', 'clinic', 'dentist', 'hotel', 'restaurant', 'school']
  const categoryLower = business.category.toLowerCase()
  const needsBooking = bookingCategories.some(c => categoryLower.includes(c))

  if (needsBooking) {
    items.push({
      id: 'booking_missing',
      title: 'Online Booking Missing',
      status: 'critical',
      description: `${business.name} is a ${business.category} business without online booking. Customers must call or visit to make appointments, leading to lost bookings outside business hours and frustrated customers.`,
      recommendation: `Implement an online booking system for ${business.name} with features like: real-time availability, automated confirmations via SMS/email, calendar sync, and WhatsApp booking integration.`,
      impact: 'high',
      estimatedValue: getBookingValue(business.category),
    })
    score -= 20
    servicesRecommended.push('Online Booking System')
    totalOpportunityValue += getBookingValue(business.category)
  } else {
    items.push({
      id: 'booking_missing',
      title: 'Booking System',
      status: 'opportunity',
      description: `An online booking or scheduling system could streamline customer interactions and reduce phone calls for ${business.name}.`,
      recommendation: 'Consider adding a simple scheduling or inquiry form to capture leads 24/7.',
      impact: 'medium',
      estimatedValue: 800,
    })
    servicesRecommended.push('Lead Capture Forms')
    totalOpportunityValue += 800
  }

  // ── 4. Lead Capture Missing ────────────────────────────────────
  const hasLeadCapture = business.hasWebsite && business.email // Rough indicator
  if (!business.hasWebsite || !hasLeadCapture) {
    items.push({
      id: 'lead_capture_missing',
      title: 'Lead Capture Missing',
      status: business.hasWebsite ? 'warning' : 'critical',
      description: business.hasWebsite
        ? `${business.name} has a website but no visible lead capture mechanism. They are losing potential customers who visit but don't convert. Every visitor who leaves without action is a lost opportunity.`
        : `${business.name} has no way to capture leads online. Every potential customer who searches for "${business.category} in ${business.city || 'their area'}" finds competitors instead.`,
      recommendation: business.hasWebsite
        ? `Add strategic lead capture: contact forms, WhatsApp chat widget, email newsletter signup, free consultation offers, and exit-intent popups.`
        : `Build a website with integrated lead capture forms, WhatsApp chat button, and automated follow-up sequences.`,
      impact: 'high',
      estimatedValue: getLeadCaptureValue(business.category),
    })
    score -= business.hasWebsite ? 10 : 20
    servicesRecommended.push('Lead Capture & CRM')
    totalOpportunityValue += getLeadCaptureValue(business.category)
  } else {
    items.push({
      id: 'lead_capture_missing',
      title: 'Basic Lead Capture',
      status: 'good',
      description: `${business.name} has basic contact information available. However, a proper lead capture funnel with forms and automation would significantly improve conversions.`,
      recommendation: 'Add automated lead nurturing with email sequences and CRM integration.',
      impact: 'medium',
      estimatedValue: 600,
    })
  }

  // ── 5. Google Ranking Opportunity ──────────────────────────────
  const reviews = business.reviewCount || business.googleReviews || 0
  const rating = business.googleRating || 0
  const hasGooglePresence = reviews > 0 || rating > 0

  if (!business.hasWebsite || !hasGooglePresence) {
    items.push({
      id: 'google_ranking_opportunity',
      title: 'Google Ranking Opportunity',
      status: 'opportunity',
      description: `${business.name} ${!business.hasWebsite ? 'has no website to rank on Google' : 'has low Google visibility'}. ${!hasGooglePresence ? 'They have minimal Google Business Profile optimization.' : ''} Local searches like "${business.category} near me" or "${business.category} in ${business.city || 'their city'}" are going to competitors.`,
      recommendation: `Optimize Google Business Profile with photos, posts, and reviews. Build location-specific landing pages. Target keywords: "${business.category} ${business.city || 'near me'}", "best ${business.category} ${business.city || 'in area'}". Create a Google Ads campaign for immediate visibility.`,
      impact: 'high',
      estimatedValue: getGoogleRankingValue(business.category),
    })
    score -= 15
    servicesRecommended.push('Google Business Profile Optimization')
    totalOpportunityValue += getGoogleRankingValue(business.category)
  } else {
    items.push({
      id: 'google_ranking_opportunity',
      title: 'Google Presence Exists',
      status: 'good',
      description: `${business.name} has ${reviews} reviews and a ${rating} rating on Google. There is still room for improvement in local search rankings.`,
      recommendation: 'Boost rankings with content marketing, review generation campaigns, and local link building.',
      impact: 'medium',
      estimatedValue: 500,
    })
    totalOpportunityValue += 500
  }

  // ── 6. WhatsApp Opportunity ────────────────────────────────────
  const hasWhatsApp = business.phone && business.phone.includes('whatsapp') // unlikely but check
  if (!hasWhatsApp) {
    items.push({
      id: 'whatsapp_opportunity',
      title: 'WhatsApp Business Opportunity',
      status: 'opportunity',
      description: `${business.name} can leverage WhatsApp Business to engage customers directly. WhatsApp has 2+ billion users and 98% open rates vs 20% for email. In ${business.country || 'many markets'}, WhatsApp is the primary communication channel.`,
      recommendation: `Set up WhatsApp Business for ${business.name} with: automated greetings, quick replies, product/service catalog, WhatsApp chat button on website, broadcast lists for promotions, and WhatsApp API integration for automated notifications and booking confirmations.`,
      impact: 'medium',
      estimatedValue: getWhatsAppValue(business.category),
    })
    servicesRecommended.push('WhatsApp Business Setup')
    totalOpportunityValue += getWhatsAppValue(business.category)
    // Don't subtract score - this is an opportunity, not a deficiency
  } else {
    items.push({
      id: 'whatsapp_opportunity',
      title: 'WhatsApp Present',
      status: 'good',
      description: `${business.name} is using WhatsApp for business communication. Consider upgrading to WhatsApp Business API for automation.`,
      recommendation: 'Explore WhatsApp Business API for automated messages, chatbots, and CRM integration.',
      impact: 'low',
      estimatedValue: 300,
    })
    totalOpportunityValue += 300
  }

  const overallScore = Math.max(0, Math.min(100, score))

  // Generate summary
  const criticalCount = items.filter(i => i.status === 'critical').length
  const warningCount = items.filter(i => i.status === 'warning').length
  const opportunityCount = items.filter(i => i.status === 'opportunity').length

  let summary: string
  if (criticalCount >= 3) {
    summary = `${business.name} has a significant digital presence gap with ${criticalCount} critical issues identified. They urgently need website development, SEO, and online booking systems. This represents a high-value opportunity for a comprehensive digital transformation package worth $${totalOpportunityValue.toLocaleString()}+.`
  } else if (criticalCount >= 1) {
    summary = `${business.name} has ${criticalCount} critical issue(s) and ${opportunityCount} opportunity(ies). A targeted digital services package addressing their key gaps could be worth $${totalOpportunityValue.toLocaleString()}. Focus on the critical items first for maximum impact.`
  } else {
    summary = `${business.name} has a basic digital presence but ${opportunityCount} growth opportunities. Potential project value: $${totalOpportunityValue.toLocaleString()}. Recommend a consultation to explore optimization and expansion.`
  }

  return {
    businessName: business.name,
    category: business.category,
    city: business.city,
    country: business.country,
    auditDate: new Date().toISOString(),
    overallScore,
    items,
    summary,
    totalOpportunityValue,
    servicesRecommended,
  }
}

// ── Value Estimators ──────────────────────────────────────────────

function getWebsiteValue(category: string): number {
  const values: Record<string, number> = {
    'hotel': 5000, 'real estate': 4500, 'school': 4000, 'lawyer': 4000,
    'clinic': 3500, 'dentist': 3500, 'restaurant': 2500, 'gym': 2500,
    'spa': 2500, 'salon': 2000, 'beauty parlour': 2000, 'accountant': 3000,
    'bakery': 2000, 'mechanic': 1500, 'plumber': 1500, 'electrician': 1500,
  }
  const key = category.toLowerCase()
  for (const [k, v] of Object.entries(values)) {
    if (key.includes(k)) return v
  }
  return 2500
}

function getSEOValue(category: string): number {
  return Math.round(getWebsiteValue(category) * 0.6)
}

function getBookingValue(category: string): number {
  const values: Record<string, number> = {
    'hotel': 3000, 'salon': 1500, 'beauty parlour': 1500, 'spa': 2000,
    'gym': 1500, 'clinic': 2500, 'dentist': 2500, 'restaurant': 1500,
    'school': 2000,
  }
  const key = category.toLowerCase()
  for (const [k, v] of Object.entries(values)) {
    if (key.includes(k)) return v
  }
  return 1200
}

function getLeadCaptureValue(category: string): number {
  return Math.round(getWebsiteValue(category) * 0.4)
}

function getGoogleRankingValue(category: string): number {
  return Math.round(getWebsiteValue(category) * 0.5)
}

function getWhatsAppValue(category: string): number {
  const values: Record<string, number> = {
    'restaurant': 1200, 'salon': 800, 'beauty parlour': 800, 'spa': 1000,
    'gym': 800, 'clinic': 1000, 'dentist': 1000, 'hotel': 1500,
    'real estate': 1500, 'school': 800,
  }
  const key = category.toLowerCase()
  for (const [k, v] of Object.entries(values)) {
    if (key.includes(k)) return v
  }
  return 800
}

// ── POST: Generate Audit ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessIds, auditAll, useAI } = body

    let businesses
    if (auditAll) {
      businesses = await db.business.findMany()
    } else if (businessIds && Array.isArray(businessIds)) {
      businesses = await db.business.findMany({
        where: { id: { in: businessIds } },
      })
    } else {
      return NextResponse.json(
        { error: 'Provide businessIds array or set auditAll to true' },
        { status: 400 }
      )
    }

    const results = {
      total: businesses.length,
      audited: 0,
      avgAuditScore: 0,
      totalOpportunityValue: 0,
    }

    let totalAuditScore = 0
    let totalOppValue = 0

    for (const business of businesses) {
      // Step 1: Run local audit
      const localReport = performLocalAudit(business)

      let finalReport = localReport

      // Step 2: Enhance with AI if requested (limit to avoid rate limits)
      if (useAI && businesses.length <= 10) {
        try {
          const zai = await ZAI.create()
          const aiResponse = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are a professional business auditor working for a digital services agency. You analyze businesses and generate detailed, actionable audit reports. Return ONLY a valid JSON object with this exact structure:
{
  "summary": "Professional 2-3 sentence executive summary of the audit findings and opportunity",
  "items": [
    {
      "id": "website_missing",
      "professionalInsight": "1-2 sentence professional analysis specific to this business",
      "competitiveAnalysis": "1 sentence about how competitors in their category typically handle this"
    }
  ]
}

Make insights specific to the business name, category, and location. Be professional and persuasive - this will be used to sell services.`,
              },
              {
                role: 'user',
                content: `Generate professional insights for this business audit:
Name: ${business.name}
Category: ${business.category}
City: ${business.city || 'Unknown'}, Country: ${business.country || 'Unknown'}
Phone: ${business.phone || 'Not available'}
Email: ${business.email || 'Not available'}
Website: ${business.website || 'No website'}
Website Status: ${business.websiteStatus || 'Not detected'}
Google Rating: ${business.googleRating || 'N/A'} (${business.googleReviews || business.reviewCount || 0} reviews)
Social: Facebook=${business.facebookUrl ? 'Yes' : 'No'}, Instagram=${business.instagramUrl ? 'Yes' : 'No'}, LinkedIn=${business.linkedinUrl ? 'Yes' : 'No'}
Lead Score: ${business.leadScore || 'N/A'}, Opportunity Score: ${business.opportunityScore || 'N/A'}

Local audit found these issues:
${localReport.items.map(item => `- ${item.title} (${item.status}): ${item.description}`).join('\n')}

Generate professional insights:`,
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

          const aiInsights = JSON.parse(cleaned)

          // Merge AI insights into report
          if (aiInsights.summary) {
            finalReport = { ...finalReport, summary: aiInsights.summary }
          }
          if (aiInsights.items && Array.isArray(aiInsights.items)) {
            for (const aiItem of aiInsights.items) {
              const existingItem = finalReport.items.find(i => i.id === aiItem.id)
              if (existingItem && aiItem.professionalInsight) {
                existingItem.description = aiItem.professionalInsight
              }
              if (existingItem && aiItem.competitiveAnalysis) {
                existingItem.recommendation = `${existingItem.recommendation} ${aiItem.competitiveAnalysis}`
              }
            }
          }
        } catch (aiError) {
          console.error('AI audit enhancement failed, using local report:', aiError)
        }
      }

      // Save audit to database
      await db.business.update({
        where: { id: business.id },
        data: {
          auditReport: JSON.stringify(finalReport),
          auditScore: finalReport.overallScore,
          auditDate: new Date(),
        },
      })

      totalAuditScore += finalReport.overallScore
      totalOppValue += finalReport.totalOpportunityValue
      results.audited++
    }

    results.avgAuditScore = results.audited > 0 ? Math.round(totalAuditScore / results.audited) : 0
    results.totalOpportunityValue = totalOppValue

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Business audit error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audit report' },
      { status: 500 }
    )
  }
}

// ── GET: Retrieve Audit for a Business ────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId query parameter is required' },
        { status: 400 }
      )
    }

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // If audit exists, return it
    if (business.auditReport) {
      const report = JSON.parse(business.auditReport)
      return NextResponse.json({
        business: {
          id: business.id,
          name: business.name,
          category: business.category,
          city: business.city,
          country: business.country,
          phone: business.phone,
          email: business.email,
          website: business.website,
          hasWebsite: business.hasWebsite,
          websiteStatus: business.websiteStatus,
          googleRating: business.googleRating,
          googleReviews: business.googleReviews,
          reviewCount: business.reviewCount,
          facebookUrl: business.facebookUrl,
          instagramUrl: business.instagramUrl,
          linkedinUrl: business.linkedinUrl,
          socialPresence: business.socialPresence,
          leadScore: business.leadScore,
          opportunityScore: business.opportunityScore,
          estimatedMonthlyRevenue: business.estimatedMonthlyRevenue,
          auditScore: business.auditScore,
          auditDate: business.auditDate,
        },
        report,
      })
    }

    // Otherwise, generate audit on the fly
    const report = performLocalAudit(business)

    // Save to database
    await db.business.update({
      where: { id: business.id },
      data: {
        auditReport: JSON.stringify(report),
        auditScore: report.overallScore,
        auditDate: new Date(),
      },
    })

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        city: business.city,
        country: business.country,
        phone: business.phone,
        email: business.email,
        website: business.website,
        hasWebsite: business.hasWebsite,
        websiteStatus: business.websiteStatus,
        googleRating: business.googleRating,
        googleReviews: business.googleReviews,
        reviewCount: business.reviewCount,
        facebookUrl: business.facebookUrl,
        instagramUrl: business.instagramUrl,
        linkedinUrl: business.linkedinUrl,
        socialPresence: business.socialPresence,
        leadScore: business.leadScore,
        opportunityScore: business.opportunityScore,
        estimatedMonthlyRevenue: business.estimatedMonthlyRevenue,
        auditScore: report.overallScore,
        auditDate: new Date().toISOString(),
      },
      report,
    })
  } catch (error) {
    console.error('Business audit GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit report' },
      { status: 500 }
    )
  }
}
