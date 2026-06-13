import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PLAN_CONFIGS } from '@/lib/stripe'

export async function GET() {
  try {
    // Get all plans from database
    const dbPlans = await db.plan.findMany({
      orderBy: [{ tier: 'asc' }, { interval: 'asc' }],
    })

    // Merge with config for complete data
    const plans = PLAN_CONFIGS.map((config) => {
      const monthlyDb = dbPlans.find((p) => p.tier === config.tier && p.interval === 'monthly')
      const yearlyDb = dbPlans.find((p) => p.tier === config.tier && p.interval === 'yearly')

      return {
        tier: config.tier,
        name: config.name,
        description: config.description,
        icon: config.icon,
        color: config.color,
        gradient: config.gradient,
        popular: config.popular,
        monthly: {
          price: config.monthlyPrice,
          credits: config.monthlyCredits,
          maxLeads: config.maxLeads,
          maxSearches: config.maxSearches,
          maxExports: config.maxExports,
          planId: monthlyDb?.id || null,
          stripePriceId: monthlyDb?.stripePriceId || null,
        },
        yearly: {
          price: config.yearlyPrice,
          credits: config.yearlyCredits,
          monthlyEquivalent: Math.round(config.yearlyPrice / 12),
          savingsPercent: Math.round(((config.monthlyPrice * 12 - config.yearlyPrice) / (config.monthlyPrice * 12)) * 100),
          maxLeads: config.maxLeads,
          maxSearches: config.maxSearches,
          maxExports: config.maxExports,
          planId: yearlyDb?.id || null,
          stripePriceId: yearlyDb?.stripePriceId || null,
        },
        features: config.features,
      }
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
