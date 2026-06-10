import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// ── Types ──────────────────────────────────────────────────────────

interface PackageFeature {
  name: string
  included: boolean
  highlight?: boolean
}

interface ProposalPackage {
  name: string
  tier: 'basic' | 'professional' | 'premium'
  price: number
  originalPrice?: number
  timeline: string
  deliveryWeeks: number
  features: PackageFeature[]
  description: string
  recommended?: boolean
}

interface ProposalData {
  businessName: string
  category: string
  city: string | null
  country: string | null
  generatedAt: string
  packages: ProposalPackage[]
  auditSummary: string
  auditScore: number | null
  totalOpportunityValue: number
  servicesFromAudit: string[]
  customMessage: string
  validUntil: string
  companyName: string
  contactEmail: string
  contactPhone: string
}

// ── Category-based Package Templates ──────────────────────────────

const CATEGORY_MULTIPLIERS: Record<string, { base: number; label: string }> = {
  'hotel': { base: 1.5, label: 'Hospitality' },
  'real estate': { base: 1.4, label: 'Real Estate' },
  'school': { base: 1.3, label: 'Education' },
  'lawyer': { base: 1.4, label: 'Legal' },
  'clinic': { base: 1.3, label: 'Healthcare' },
  'dentist': { base: 1.3, label: 'Dental' },
  'restaurant': { base: 1.0, label: 'Restaurant' },
  'gym': { base: 1.0, label: 'Fitness' },
  'spa': { base: 1.1, label: 'Wellness' },
  'salon': { base: 0.9, label: 'Salon' },
  'beauty parlour': { base: 0.9, label: 'Beauty' },
  'accountant': { base: 1.2, label: 'Accounting' },
  'bakery': { base: 0.8, label: 'Bakery' },
  'mechanic': { base: 0.7, label: 'Automotive' },
  'plumber': { base: 0.7, label: 'Plumbing' },
  'electrician': { base: 0.7, label: 'Electrical' },
}

function getCategoryMultiplier(category: string): { base: number; label: string } {
  const key = category.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_MULTIPLIERS)) {
    if (key.includes(k)) return v
  }
  return { base: 1.0, label: category }
}

function generateLocalProposal(business: {
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
  auditReport: string | null
  auditScore: number | null
}): ProposalData {
  const mult = getCategoryMultiplier(business.category)
  const hasWebsite = business.hasWebsite && business.websiteStatus === 'HAS_WEBSITE'

  // Parse audit report for services and opportunity value
  let auditSummary = `${business.name} needs a comprehensive digital presence strategy.`
  let totalOpportunityValue = 0
  let servicesFromAudit: string[] = []
  if (business.auditReport) {
    try {
      const report = JSON.parse(business.auditReport)
      auditSummary = report.summary || auditSummary
      totalOpportunityValue = report.totalOpportunityValue || 0
      servicesFromAudit = report.servicesRecommended || []
    } catch { /* use defaults */ }
  }

  // Base pricing adjusted by category multiplier
  const basePrice = Math.round(499 * mult.base)
  const proPrice = Math.round(999 * mult.base)
  const premiumPrice = Math.round(1999 * mult.base)

  // Determine features based on audit findings
  const needsWebsite = !hasWebsite
  const needsSEO = servicesFromAudit.some(s => s.toLowerCase().includes('seo'))
  const needsBooking = servicesFromAudit.some(s => s.toLowerCase().includes('booking'))
  const needsLeadCapture = servicesFromAudit.some(s => s.toLowerCase().includes('lead') || s.toLowerCase().includes('crm'))
  const needsGoogleProfile = servicesFromAudit.some(s => s.toLowerCase().includes('google'))
  const needsWhatsApp = servicesFromAudit.some(s => s.toLowerCase().includes('whatsapp'))

  // ── BASIC PACKAGE ───────────────────────────────────────────────
  const basicFeatures: PackageFeature[] = [
    { name: needsWebsite ? 'Professional Website Design' : 'Website Redesign', included: true, highlight: true },
    { name: 'Mobile Responsive Layout', included: true },
    { name: 'Up to 5 Pages', included: true },
    { name: 'Contact Form Integration', included: true },
    { name: 'Social Media Links', included: true },
    { name: 'Google Maps Integration', included: true },
    { name: 'Basic SEO Setup', included: true },
    { name: 'SSL Certificate', included: true },
    { name: '1 Year Hosting Included', included: true },
    { name: 'WhatsApp Chat Button', included: needsWhatsApp },
    { name: 'Online Booking System', included: false },
    { name: 'CRM Integration', included: false },
    { name: 'Google Business Profile', included: false },
    { name: 'Monthly SEO Reports', included: false },
    { name: 'Content Marketing', included: false },
    { name: 'Email Automation', included: false },
    { name: 'Review Management', included: false },
    { name: 'Analytics Dashboard', included: false },
    { name: 'Priority Support', included: false },
    { name: 'Dedicated Account Manager', included: false },
  ]

  // ── PROFESSIONAL PACKAGE ───────────────────────────────────────
  const proFeatures: PackageFeature[] = [
    { name: needsWebsite ? 'Professional Website Design' : 'Website Redesign', included: true, highlight: true },
    { name: 'Mobile Responsive Layout', included: true },
    { name: 'Up to 15 Pages', included: true, highlight: true },
    { name: 'Contact Form Integration', included: true },
    { name: 'Social Media Integration', included: true },
    { name: 'Google Maps Integration', included: true },
    { name: 'Comprehensive SEO Optimization', included: true, highlight: true },
    { name: 'SSL Certificate', included: true },
    { name: '1 Year Hosting Included', included: true },
    { name: 'WhatsApp Business Setup', included: true, highlight: needsWhatsApp },
    { name: 'Online Booking System', included: needsBooking, highlight: needsBooking },
    { name: 'Lead Capture & CRM', included: true, highlight: true },
    { name: 'Google Business Profile Setup', included: true, highlight: needsGoogleProfile },
    { name: 'Monthly SEO Reports', included: true },
    { name: 'Blog Setup & 4 Articles', included: true },
    { name: 'Email Newsletter Setup', included: true },
    { name: 'Review Management Tool', included: false },
    { name: 'Analytics Dashboard', included: false },
    { name: 'Priority Support', included: false },
    { name: 'Dedicated Account Manager', included: false },
  ]

  // ── PREMIUM PACKAGE ────────────────────────────────────────────
  const premiumFeatures: PackageFeature[] = [
    { name: needsWebsite ? 'Custom Premium Website' : 'Complete Website Overhaul', included: true, highlight: true },
    { name: 'Mobile Responsive Layout', included: true },
    { name: 'Unlimited Pages', included: true, highlight: true },
    { name: 'Advanced Contact Forms', included: true },
    { name: 'Full Social Media Integration', included: true },
    { name: 'Google Maps + Street View', included: true },
    { name: 'Advanced SEO + Local SEO', included: true, highlight: true },
    { name: 'SSL + Security Hardening', included: true },
    { name: '1 Year Premium Hosting', included: true },
    { name: 'WhatsApp Business API', included: true, highlight: true },
    { name: 'Online Booking + Scheduling', included: true, highlight: true },
    { name: 'CRM + Lead Automation', included: true, highlight: true },
    { name: 'Google Business Profile + Ads Setup', included: true, highlight: true },
    { name: 'Weekly SEO Reports + Strategy', included: true },
    { name: 'Content Marketing (8 Articles)', included: true, highlight: true },
    { name: 'Email Automation Sequences', included: true },
    { name: 'Review Generation & Management', included: true, highlight: true },
    { name: 'Analytics Dashboard + Insights', included: true },
    { name: 'Priority 24/7 Support', included: true },
    { name: 'Dedicated Account Manager', included: true, highlight: true },
  ]

  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)

  const customMessage = `Dear ${business.name} team,\n\nAfter analyzing your digital presence, we've identified significant opportunities to help you grow your ${business.category.toLowerCase()} business${business.city ? ` in ${business.city}` : ''}. Our proposal outlines three tailored packages designed to establish and enhance your online visibility, attract more customers, and streamline your operations.\n\nWe look forward to partnering with you on this digital transformation journey.`

  return {
    businessName: business.name,
    category: business.category,
    city: business.city,
    country: business.country,
    generatedAt: new Date().toISOString(),
    packages: [
      {
        name: 'Basic',
        tier: 'basic',
        price: basePrice,
        timeline: '2-3 weeks',
        deliveryWeeks: 3,
        features: basicFeatures,
        description: `Essential web presence for ${business.name}. Get a professional website that establishes credibility and makes it easy for customers to find you online.`,
        recommended: false,
      },
      {
        name: 'Professional',
        tier: 'professional',
        price: proPrice,
        originalPrice: Math.round(proPrice * 1.2),
        timeline: '4-6 weeks',
        deliveryWeeks: 6,
        features: proFeatures,
        description: `Complete digital solution for ${business.name}. Includes website, SEO, CRM, and marketing tools to attract and convert more customers.`,
        recommended: true,
      },
      {
        name: 'Premium',
        tier: 'premium',
        price: premiumPrice,
        originalPrice: Math.round(premiumPrice * 1.15),
        timeline: '6-8 weeks',
        deliveryWeeks: 8,
        features: premiumFeatures,
        description: `Full-scale digital transformation for ${business.name}. Everything you need to dominate your local market with premium tools and dedicated support.`,
        recommended: false,
      },
    ],
    auditSummary,
    auditScore: business.auditScore,
    totalOpportunityValue,
    servicesFromAudit,
    customMessage,
    validUntil: validUntil.toISOString(),
    companyName: 'BW Finder Digital Agency',
    contactEmail: 'hello@bwfinder.com',
    contactPhone: '+1 (555) 123-4567',
  }
}

// ── POST: Generate Proposal ────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, useAI } = body

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Generate audit first if not done
    if (!business.auditReport) {
      const auditRes = await fetch('http://localhost:3000/api/businesses/audit?businessId=' + businessId)
      if (auditRes.ok) {
        const auditData = await auditRes.json()
        business.auditReport = JSON.stringify(auditData.report)
        business.auditScore = auditData.report?.overallScore ?? null
      }
    }

    let proposal = generateLocalProposal(business)

    // Enhance with AI if requested
    if (useAI) {
      try {
        const zai = await ZAI.create()
        const aiResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `You are a professional business proposal writer for a digital services agency. Enhance the proposal with more specific, persuasive descriptions for each package tier. Return ONLY a JSON object with this structure:
{
  "customMessage": "A professional, personalized cover letter (3-4 paragraphs)",
  "packages": [
    {
      "tier": "basic",
      "description": "Enhanced description specific to this business and category",
      "features": [
        { "name": "Feature Name", "included": true, "highlight": false }
      ]
    },
    {
      "tier": "professional",
      "description": "Enhanced description",
      "features": [{ "name": "Feature Name", "included": true, "highlight": true }]
    },
    {
      "tier": "premium",
      "description": "Enhanced description",
      "features": [{ "name": "Feature Name", "included": true, "highlight": true }]
    }
  ]
}

Make features specific to the business category. Add 2-3 category-specific features. Keep pricing and timeline unchanged. Be professional and persuasive.`,
            },
            {
              role: 'user',
              content: `Generate proposal enhancements for:
Business: ${business.name}
Category: ${business.category}
City: ${business.city || 'Unknown'}, Country: ${business.country || 'Unknown'}
Has Website: ${business.hasWebsite}
Google Rating: ${business.googleRating || 'N/A'} (${business.googleReviews || 0} reviews)
Social Presence: FB=${business.facebookUrl ? 'Yes' : 'No'}, IG=${business.instagramUrl ? 'Yes' : 'No'}, LI=${business.linkedinUrl ? 'Yes' : 'No'}
Audit Score: ${business.auditScore || 'N/A'}
Services Needed: ${proposal.servicesFromAudit.join(', ')}

Current Basic price: $${proposal.packages[0].price}
Current Professional price: $${proposal.packages[1].price}
Current Premium price: $${proposal.packages[2].price}

Enhance this proposal:`,
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

        const aiEnhancements = JSON.parse(cleaned)
        if (aiEnhancements.customMessage) proposal.customMessage = aiEnhancements.customMessage
        if (aiEnhancements.packages && Array.isArray(aiEnhancements.packages)) {
          for (const aiPkg of aiEnhancements.packages) {
            const pkg = proposal.packages.find(p => p.tier === aiPkg.tier)
            if (pkg) {
              if (aiPkg.description) pkg.description = aiPkg.description
              if (aiPkg.features) {
                // Merge AI features with local features
                const aiFeatureNames = new Set(aiPkg.features.map((f: PackageFeature) => f.name))
                // Add new AI features that don't exist locally
                for (const aiFeat of aiPkg.features) {
                  if (!pkg.features.some(f => f.name === aiFeat.name)) {
                    pkg.features.push(aiFeat)
                  }
                }
              }
            }
          }
        }
      } catch (aiError) {
        console.error('AI proposal enhancement failed, using local proposal:', aiError)
      }
    }

    // Save proposal to database
    await db.business.update({
      where: { id: businessId },
      data: {
        proposalData: JSON.stringify(proposal),
        proposalDate: new Date(),
      },
    })

    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    console.error('Proposal generation error:', error)
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 })
  }
}

// ── GET: Retrieve Proposal ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (business.proposalData) {
      const proposal = JSON.parse(business.proposalData)
      return NextResponse.json({ proposal, proposalDate: business.proposalDate })
    }

    // Generate on-the-fly
    const proposal = generateLocalProposal(business)
    await db.business.update({
      where: { id: businessId },
      data: { proposalData: JSON.stringify(proposal), proposalDate: new Date() },
    })

    return NextResponse.json({ proposal, proposalDate: new Date().toISOString() })
  } catch (error) {
    console.error('Proposal GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve proposal' }, { status: 500 })
  }
}
