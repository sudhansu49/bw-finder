import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// City population estimates for scoring context
const CITY_POPULATIONS: Record<string, number> = {
  // India
  'mumbai': 12400000, 'delhi': 11000000, 'bengaluru': 8400000, 'bangalore': 8400000,
  'hyderabad': 6800000, 'chennai': 4600000, 'pune': 3100000, 'kolkata': 4500000,
  'jaipur': 3100000, 'lucknow': 2800000, 'ahmedabad': 5600000, 'surat': 4500000,
  'goa': 400000, 'chandigarh': 1100000, 'indore': 2000000, 'nagpur': 2400000,
  'kochi': 600000, 'coimbatore': 1600000, 'bhopal': 1800000, 'vizag': 1700000,
  // USA
  'new york': 8300000, 'los angeles': 3900000, 'chicago': 2700000,
  'houston': 2300000, 'austin': 960000, 'dallas': 1300000,
  'san francisco': 870000, 'seattle': 750000, 'miami': 470000,
  // UK
  'london': 8900000, 'manchester': 550000, 'birmingham': 1100000,
  // General
  'toronto': 2700000, 'sydney': 5300000, 'dubai': 3300000,
  'singapore': 5700000, 'berlin': 3600000, 'paris': 2100000,
  'são paulo': 12300000, 'mexico city': 9200000,
  'johannesburg': 5600000, 'lagos': 15400000, 'nairobi': 4400000,
}

function getCityPopulation(city: string | null): number {
  if (!city) return 500000 // default mid-size city
  const normalized = city.toLowerCase().trim()
  for (const [key, pop] of Object.entries(CITY_POPULATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) return pop
  }
  return 500000 // default
}

// Category-based revenue multipliers (monthly revenue estimates by category)
const CATEGORY_REVENUE_MULTIPLIERS: Record<string, { base: number; perReview: number }> = {
  'restaurant': { base: 15000, perReview: 50 },
  'hotel': { base: 40000, perReview: 200 },
  'salon': { base: 8000, perReview: 30 },
  'beauty parlour': { base: 7000, perReview: 25 },
  'spa': { base: 12000, perReview: 40 },
  'gym': { base: 10000, perReview: 35 },
  'clinic': { base: 25000, perReview: 100 },
  'dentist': { base: 20000, perReview: 80 },
  'lawyer': { base: 30000, perReview: 150 },
  'real estate': { base: 50000, perReview: 200 },
  'school': { base: 35000, perReview: 100 },
  'mechanic': { base: 8000, perReview: 20 },
  'plumber': { base: 6000, perReview: 15 },
  'electrician': { base: 7000, perReview: 15 },
  'bakery': { base: 8000, perReview: 25 },
  'accountant': { base: 15000, perReview: 50 },
  'other': { base: 10000, perReview: 30 },
}

function calculateLocalScore(business: {
  reviewCount: number | null
  googleReviews: number | null
  googleRating: number | null
  city: string | null
  category: string
  socialPresence: number
  hasWebsite: boolean
  websiteStatus: string | null
}): {
  leadScore: number
  opportunityScore: number
  estimatedMonthlyRevenue: number
  factors: {
    reviewScore: number
    ratingScore: number
    populationScore: number
    categoryScore: number
    socialScore: number
    websitePenalty: number
  }
} {
  const reviews = business.reviewCount || business.googleReviews || 0
  const rating = business.googleRating || 0
  const cityPop = getCityPopulation(business.city)
  const category = business.category.toLowerCase()
  const revenueMultiplier = CATEGORY_REVENUE_MULTIPLIERS[category] || CATEGORY_REVENUE_MULTIPLIERS['other']

  // Factor 1: Review Count Score (0-20)
  // More reviews = more established = higher lead quality
  let reviewScore = 0
  if (reviews >= 500) reviewScore = 20
  else if (reviews >= 200) reviewScore = 16
  else if (reviews >= 100) reviewScore = 12
  else if (reviews >= 50) reviewScore = 8
  else if (reviews >= 20) reviewScore = 5
  else if (reviews >= 5) reviewScore = 3
  else reviewScore = 1

  // Factor 2: Rating Score (0-20)
  // Higher rating = better business = more likely to invest
  let ratingScore = 0
  if (rating >= 4.5) ratingScore = 20
  else if (rating >= 4.0) ratingScore = 16
  else if (rating >= 3.5) ratingScore = 12
  else if (rating >= 3.0) ratingScore = 8
  else if (rating > 0) ratingScore = 4
  else ratingScore = 0

  // Factor 3: City Population Score (0-20)
  // Bigger city = more potential customers = more revenue potential
  let populationScore = 0
  if (cityPop >= 5000000) populationScore = 20
  else if (cityPop >= 1000000) populationScore = 16
  else if (cityPop >= 500000) populationScore = 12
  else if (cityPop >= 200000) populationScore = 8
  else if (cityPop >= 50000) populationScore = 5
  else populationScore = 3

  // Factor 4: Category Score (0-20)
  // Some categories have higher average deal values
  const categoryScores: Record<string, number> = {
    'hotel': 20, 'real estate': 19, 'school': 18, 'lawyer': 17,
    'clinic': 16, 'dentist': 16, 'restaurant': 14, 'gym': 13,
    'spa': 12, 'salon': 11, 'beauty parlour': 11, 'accountant': 15,
    'bakery': 10, 'mechanic': 9, 'plumber': 8, 'electrician': 8,
    'other': 10,
  }
  const categoryScore = categoryScores[category] || 10

  // Factor 5: Social Presence Score (0-20)
  // More social presence = more digitally aware = easier to sell
  let socialScore = 0
  if (business.socialPresence >= 3) socialScore = 18
  else if (business.socialPresence === 2) socialScore = 12
  else if (business.socialPresence === 1) socialScore = 6
  else socialScore = 2

  // Website penalty for lead score (businesses without websites are better leads)
  let websitePenalty = 0
  if (business.websiteStatus === 'HAS_WEBSITE') websitePenalty = -15
  else if (business.websiteStatus === 'SOCIAL_ONLY') websitePenalty = -5
  else websitePenalty = 5 // No website = better lead opportunity

  // Lead Score: Higher for businesses that NEED your services
  const rawLeadScore = reviewScore + ratingScore + populationScore + categoryScore + socialScore + websitePenalty
  const leadScore = Math.max(0, Math.min(100, rawLeadScore))

  // Opportunity Score: How much revenue potential this lead represents
  // Combines market size, business size, and digital gap
  const opportunityRaw = (populationScore * 0.3) + (categoryScore * 0.3) + (reviewScore * 0.2) + (socialScore * 0.1) + (Math.max(0, websitePenalty) * 0.1) * 100 / 20
  const opportunityScore = Math.max(0, Math.min(100, Math.round(opportunityRaw * 5)))

  // Estimated Monthly Revenue
  const estimatedMonthlyRevenue = Math.round(revenueMultiplier.base + (reviews * revenueMultiplier.perReview))

  return {
    leadScore,
    opportunityScore,
    estimatedMonthlyRevenue,
    factors: {
      reviewScore,
      ratingScore,
      populationScore,
      categoryScore,
      socialScore,
      websitePenalty,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessIds, scoreAll, useAI } = body

    let businesses
    if (scoreAll) {
      businesses = await db.business.findMany()
    } else if (businessIds && Array.isArray(businessIds)) {
      businesses = await db.business.findMany({
        where: { id: { in: businessIds } },
      })
    } else {
      return NextResponse.json(
        { error: 'Provide businessIds array or set scoreAll to true' },
        { status: 400 }
      )
    }

    const results = {
      total: businesses.length,
      scored: 0,
      avgLeadScore: 0,
      avgOpportunityScore: 0,
    }

    let totalLeadScore = 0
    let totalOppScore = 0

    for (const business of businesses) {
      const scoring = calculateLocalScore(business)

      // If useAI is true, enhance with AI analysis
      if (useAI && businesses.length <= 20) {
        try {
          const zai = await ZAI.create()
          const aiResponse = await zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are a business analyst that scores leads for a digital services agency. Analyze the business data and provide adjusted scores. Return ONLY a JSON object with these fields:
- leadScore: integer 0-100 (how good a lead this is for selling website/SEO/marketing services)
- opportunityScore: integer 0-100 (revenue potential of this client)
- estimatedMonthlyRevenue: integer (estimated monthly business revenue in INR)
- reasoning: brief 1-sentence explanation

Consider: businesses WITHOUT websites are BETTER leads. More reviews and higher ratings indicate established businesses that can afford services. Larger cities mean more potential customers. Some categories naturally have higher revenue.`,
              },
              {
                role: 'user',
                content: `Score this business lead:
Name: ${business.name}
Category: ${business.category}
City: ${business.city || 'Unknown'}, State: ${business.state || ''}, Country: ${business.country || ''}
Reviews: ${business.reviewCount || business.googleReviews || 0}
Rating: ${business.googleRating || 'N/A'}
Social Media: ${business.socialPresence} platforms (FB: ${business.facebookUrl ? 'Yes' : 'No'}, IG: ${business.instagramUrl ? 'Yes' : 'No'}, LI: ${business.linkedinUrl ? 'Yes' : 'No'})
Website Status: ${business.websiteStatus || (business.hasWebsite ? 'HAS_WEBSITE' : 'NO_WEBSITE')}
Website: ${business.website || 'None'}

Current algorithmic scores: Lead=${scoring.leadScore}, Opportunity=${scoring.opportunityScore}, Revenue=$${scoring.estimatedMonthlyRevenue}

Provide your adjusted scores:`,
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

          const aiScores = JSON.parse(cleaned)
          if (typeof aiScores.leadScore === 'number') scoring.leadScore = Math.max(0, Math.min(100, aiScores.leadScore))
          if (typeof aiScores.opportunityScore === 'number') scoring.opportunityScore = Math.max(0, Math.min(100, aiScores.opportunityScore))
          if (typeof aiScores.estimatedMonthlyRevenue === 'number') scoring.estimatedMonthlyRevenue = Math.max(0, aiScores.estimatedMonthlyRevenue)
        } catch (aiError) {
          console.error('AI scoring failed, using local scores:', aiError)
        }
      }

      totalLeadScore += scoring.leadScore
      totalOppScore += scoring.opportunityScore

      await db.business.update({
        where: { id: business.id },
        data: {
          leadScore: scoring.leadScore,
          opportunityScore: scoring.opportunityScore,
          estimatedMonthlyRevenue: scoring.estimatedMonthlyRevenue,
          scoreFactors: JSON.stringify(scoring.factors),
        },
      })

      results.scored++
    }

    results.avgLeadScore = results.scored > 0 ? Math.round(totalLeadScore / results.scored) : 0
    results.avgOpportunityScore = results.scored > 0 ? Math.round(totalOppScore / results.scored) : 0

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Lead scoring error:', error)
    return NextResponse.json(
      { error: 'Failed to score leads' },
      { status: 500 }
    )
  }
}
