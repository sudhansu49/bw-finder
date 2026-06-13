import Stripe from 'stripe'

// ─── Stripe Client Singleton ────────────────────────────────────────────────

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo'

// Check if we're in demo mode (no real Stripe keys)
export const isStripeDemoMode = !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('sk_test_') === false

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (isStripeDemoMode) return null
  if (!stripeInstance) {
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    })
  }
  return stripeInstance
}

export { STRIPE_WEBHOOK_SECRET }

// ─── Plan Configuration ─────────────────────────────────────────────────────

export interface PlanConfig {
  tier: 'starter' | 'agency' | 'enterprise'
  name: string
  description: string
  monthlyPrice: number  // in INR
  yearlyPrice: number   // in INR (discounted annual)
  monthlyCredits: number
  yearlyCredits: number
  features: string[]
  popular: boolean
  maxLeads: number
  maxSearches: number
  maxExports: number
  icon: string
  color: string
  gradient: string
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Perfect for freelancers and solopreneurs getting started with lead generation',
    monthlyPrice: 1499,
    yearlyPrice: 14990,  // ~₹1,249/mo - 2 months free
    monthlyCredits: 500,
    yearlyCredits: 6000,
    features: [
      '500 leads/month',
      '50 searches/month',
      '20 exports/month',
      'Basic lead scoring',
      'Email outreach templates',
      'WhatsApp script generator',
      '1 user seat',
      'Email support',
      'Basic CRM pipeline',
    ],
    popular: false,
    maxLeads: 500,
    maxSearches: 50,
    maxExports: 20,
    icon: '🚀',
    color: 'slate',
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    tier: 'agency',
    name: 'Agency',
    description: 'Ideal for growing agencies and teams that need more power and collaboration',
    monthlyPrice: 4999,
    yearlyPrice: 49990,  // ~₹4,165/mo - 2 months free
    monthlyCredits: 2500,
    yearlyCredits: 30000,
    features: [
      '2,500 leads/month',
      '200 searches/month',
      '100 exports/month',
      'Advanced lead scoring',
      'AI website audit',
      'Proposal generator',
      '5 user seats',
      'Priority support',
      'Full CRM pipeline',
      'Custom email templates',
      'Team collaboration',
      'Bulk outreach',
    ],
    popular: true,
    maxLeads: 2500,
    maxSearches: 200,
    maxExports: 100,
    icon: '⚡',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations needing unlimited access, custom integrations, and dedicated support',
    monthlyPrice: 14999,
    yearlyPrice: 149990,  // ~₹12,499/mo - 2 months free
    monthlyCredits: -1, // unlimited
    yearlyCredits: -1,
    features: [
      'Unlimited leads',
      'Unlimited searches',
      'Unlimited exports',
      'AI-powered insights',
      'Custom integrations & API',
      'White-label proposals',
      'Unlimited user seats',
      '24/7 dedicated support',
      'Advanced CRM + automation',
      'Custom reports & analytics',
      'SLA guarantee',
      'Onboarding & training',
    ],
    popular: false,
    maxLeads: -1,
    maxSearches: -1,
    maxExports: -1,
    icon: '👑',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-700',
  },
]

// ─── Helper Functions ───────────────────────────────────────────────────────

export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  // Convert INR to other currencies (approximate)
  const rates: Record<string, number> = {
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
  }
  const rate = rates[currency] || 1
  const converted = Math.round(amount * rate)
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' }
  const symbol = symbols[currency] || currency
  return `${symbol}${converted.toLocaleString()}`
}

export function getSavingsPercent(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyYearly = monthlyPrice * 12
  const savings = monthlyYearly - yearlyPrice
  return Math.round((savings / monthlyYearly) * 100)
}

export function getMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round(yearlyPrice / 12)
}

// ─── Demo Mode Simulations ─────────────────────────────────────────────────

export function simulateCheckout(planConfig: PlanConfig, interval: 'monthly' | 'yearly') {
  const price = interval === 'monthly' ? planConfig.monthlyPrice : planConfig.yearlyPrice
  const credits = interval === 'monthly' ? planConfig.monthlyCredits : planConfig.yearlyCredits

  return {
    sessionId: `cs_demo_${Date.now()}_${planConfig.tier}`,
    url: null, // In demo mode, no redirect
    amount: price,
    credits,
    interval,
    planName: planConfig.name,
    tier: planConfig.tier,
  }
}

export function simulatePortal() {
  return {
    url: null, // In demo mode, no redirect
    sessionId: `bps_demo_${Date.now()}`,
  }
}

export function simulateWebhook(eventType: string, data: Record<string, unknown>) {
  return {
    id: `evt_demo_${Date.now()}`,
    type: eventType,
    data,
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    object: 'event',
  }
}
