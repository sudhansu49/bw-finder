'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import {
  Crown,
  Check,
  X,
  Zap,
  Target,
  BarChart3,
  Shield,
  Headphones,
  Globe,
  Code,
  ArrowUpRight,
  Star,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string
  included: boolean
}

interface ApiPlan {
  id: string
  name: string
  description: string
  price: number
  credits: number
  features: string // JSON string
  popular: boolean
  maxLeads: number
  maxSearches: number
  maxExports: number
}

interface DisplayPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  icon: React.ReactNode
  features: PlanFeature[]
  highlight?: boolean
  current?: boolean
  enterprise?: boolean
}

interface SubscriptionInfo {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  createdAt: string
}

interface UsageData {
  leads: { used: number; limit: number }
  searches: { used: number; limit: number }
  exports: { used: number; limit: number }
  credits: { remaining: number; total: number }
}

interface BillingRecord {
  id: string
  amount: number
  balance: number
  type: string
  description: string
  referenceId: string | null
  createdAt: string
}

interface SubscriptionApiData {
  currentPlan: ApiPlan | null
  subscription: SubscriptionInfo | null
  usage: UsageData
  allPlans: ApiPlan[]
  billingHistory: BillingRecord[]
}

// ─── FAQ Data (static) ──────────────────────────────────────────────────────────

const faqItems = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference immediately. When downgrading, the new rate takes effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens when I reach my plan limits?',
    answer:
      'You\'ll receive a notification when you reach 80% and 100% of your plan limits. Once you hit the limit, additional leads and searches will be paused until the next billing cycle or until you upgrade your plan.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Absolutely. You can cancel your subscription at any time from this page. Your access will continue until the end of the current billing period. No cancellation fees apply.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a full refund within 14 days of your first payment if you\'re not satisfied. After that, we don\'t provide refunds for partial billing periods, but you can cancel anytime and use the service until the end of your billing cycle.',
  },
  {
    question: 'What\'s included in API access for Enterprise?',
    answer:
      'The Enterprise plan includes full REST API access with up to 5,000 requests per day. You get endpoints for lead search, business data, scoring, and export. Detailed API documentation and SDKs are available.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes! We offer a 20% discount when you choose annual billing. That brings the Pro plan to $23/mo and Enterprise to $79/mo, billed annually. Contact our sales team for custom enterprise agreements.',
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseFeatures(featuresJson: string): PlanFeature[] {
  try {
    const parsed = JSON.parse(featuresJson)
    if (Array.isArray(parsed)) {
      return parsed.map((f: string | PlanFeature) => {
        if (typeof f === 'string') {
          return { label: f, included: true }
        }
        return f as PlanFeature
      })
    }
    return []
  } catch {
    return []
  }
}

function getPlanIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase()
  if (lower.includes('enterprise') || lower.includes('team') || lower.includes('agency')) {
    return <Globe className="h-5 w-5" />
  }
  if (lower.includes('pro') || lower.includes('professional')) {
    return <Crown className="h-5 w-5" />
  }
  return <Zap className="h-5 w-5" />
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function getUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.round((used / total) * 100), 100)
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`
}

function getBillingStatusBadge(type: string, amount: number) {
  if (type === 'refund') {
    return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-xs">Refund</Badge>
  }
  if (type === 'purchase') {
    return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 text-xs">Purchase</Badge>
  }
  if (type === 'subscription') {
    return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-0 text-xs">Subscription</Badge>
  }
  return <Badge className="bg-slate-50 text-slate-700 hover:bg-slate-50 border-0 text-xs">{type}</Badge>
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function SubscriptionSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card className="border-2 border-amber-500 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-amber-100" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-20" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SubscriptionView() {
  const { user } = useAppStore()
  const { toast } = useToast()

  const [data, setData] = useState<SubscriptionApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/user/subscription?userId=${user.id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to fetch subscription data')
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err)
      setError(err.message || 'Failed to load subscription data')
      toast({
        title: 'Error',
        description: 'Failed to load subscription data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  if (loading) return <SubscriptionSkeleton />

  if (error && !data) {
    return (
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
          <p className="text-muted-foreground">Manage your plan, usage, and billing</p>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Failed to load subscription data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchSubscription} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  // Build display plans from API data
  const currentPlanId = data.currentPlan?.id ?? user?.planId ?? ''
  const displayPlans: DisplayPlan[] = (data.allPlans ?? []).map((plan) => {
    const isCurrent = plan.id === currentPlanId
    const nameLower = plan.name.toLowerCase()
    const isEnterprise = nameLower.includes('enterprise') || nameLower.includes('team') || nameLower.includes('agency')

    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      period: '/mo',
      description: plan.description,
      icon: getPlanIcon(plan.name),
      features: parseFeatures(plan.features),
      highlight: isCurrent || plan.popular,
      current: isCurrent,
      enterprise: isEnterprise,
    }
  })

  // Build usage items from API data
  const usageItems = [
    {
      label: 'Leads',
      used: data.usage.leads.used,
      total: data.usage.leads.limit,
      icon: <Target className="h-4 w-4" />,
      color: 'text-amber-600',
    },
    {
      label: 'Searches',
      used: data.usage.searches.used,
      total: data.usage.searches.limit,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-emerald-600',
    },
    {
      label: 'Exports',
      used: data.usage.exports.used,
      total: data.usage.exports.limit,
      icon: <Code className="h-4 w-4" />,
      color: 'text-violet-600',
    },
    {
      label: 'Credits',
      used: data.usage.credits.total - data.usage.credits.remaining,
      total: data.usage.credits.total,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-orange-600',
    },
  ]

  const currentPlan = data.currentPlan
  const subscription = data.subscription

  // Format period dates
  const periodStart = subscription?.currentPeriodStart
    ? formatDate(subscription.currentPeriodStart)
    : null
  const periodEnd = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, usage, and billing</p>
      </div>

      {/* ── Current Plan Banner ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-amber-500 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Crown className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">
                      {currentPlan?.name ?? 'No Plan'} Plan
                    </h2>
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-0 text-xs font-medium">
                      Current Plan
                    </Badge>
                    {subscription?.status === 'active' && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-xs font-medium">
                        Active
                      </Badge>
                    )}
                    {subscription?.cancelAtPeriodEnd && (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0 text-xs font-medium">
                        Cancels at Period End
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {periodEnd && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {subscription?.cancelAtPeriodEnd ? 'Expires' : 'Renews'} {periodEnd}
                      </span>
                    )}
                    {currentPlan && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        ${currentPlan.price.toFixed(2)}/month
                      </span>
                    )}
                    <span>
                      {user?.name || 'User'} &middot; {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="shrink-0">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Plan Comparison Cards ────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-amber-500" />
          Compare Plans
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {displayPlans.map((plan) => {
            const isCurrent = plan.current
            const isEnterprise = plan.enterprise

            return (
              <motion.div key={plan.id} variants={item} className="relative">
                {/* Enterprise gradient border wrapper */}
                {isEnterprise ? (
                  <div className="rounded-xl p-[2px] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 h-full">
                    <div className="bg-white rounded-[10px] h-full">
                      <PlanCard plan={plan} isCurrent={isCurrent} isEnterprise={isEnterprise} />
                    </div>
                  </div>
                ) : (
                  <Card
                    className={`h-full ${
                      isCurrent
                        ? 'border-2 border-amber-500 shadow-md'
                        : 'border-0 shadow-sm'
                    }`}
                  >
                    <PlanCard plan={plan} isCurrent={isCurrent} isEnterprise={isEnterprise} />
                  </Card>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── Usage This Billing Period ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Usage This Billing Period</CardTitle>
            </div>
            <CardDescription>
              Your resource consumption{periodStart ? ` since ${periodStart}` : ''}.{periodEnd ? ` Resets on ${periodEnd}.` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {usageItems.map((u) => {
                const pct = getUsagePercentage(u.used, u.total)
                const barColor = getUsageColor(pct)
                return (
                  <div key={u.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={u.color}>{u.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{u.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(u.used)} / {formatNumber(u.total)}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={pct} className="h-3" />
                      {/* Colorful overlay on the progress bar */}
                      <div
                        className={`absolute top-0 left-0 h-3 rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%`, opacity: 0.85 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pct >= 90 ? (
                        <span className="text-red-600 font-medium">
                          Almost at your limit — consider upgrading
                        </span>
                      ) : pct >= 70 ? (
                        <span className="text-amber-600">
                          {formatNumber(u.total - u.used)} remaining
                        </span>
                      ) : (
                        <span>
                          {formatNumber(u.total - u.used)} remaining
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Billing History ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Billing History</CardTitle>
            </div>
            <CardDescription>
              Recent subscription charges and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.billingHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">No billing history yet</h3>
                <p className="text-xs text-muted-foreground">Your billing transactions will appear here.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Amount</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Balance</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.billingHistory.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">{formatDate(record.createdAt)}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-slate-700">{record.description}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`text-sm font-medium ${record.amount < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {record.amount < 0 ? '-' : ''}{formatCurrency(record.amount)}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm text-muted-foreground">{record.balance}</span>
                          </td>
                          <td className="py-3 text-right">
                            {getBillingStatusBadge(record.type, record.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing last {data.billingHistory.length} transactions
                  </p>
                  <Button variant="ghost" size="sm" className="text-amber-600 text-xs">
                    View All Transactions
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── FAQ Section ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </div>
            <CardDescription>
              Common questions about plans, billing, and account management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="text-sm font-medium text-slate-700 hover:no-underline hover:text-amber-600 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Plan Card Sub-component ───────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrent,
  isEnterprise,
}: {
  plan: DisplayPlan
  isCurrent: boolean
  isEnterprise: boolean
}) {
  return (
    <div className="p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isCurrent
                ? 'bg-amber-50 text-amber-600'
                : isEnterprise
                ? 'bg-purple-50 text-purple-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {plan.icon}
          </div>
          {isCurrent && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-0 text-xs">
              Current Plan
            </Badge>
          )}
          {isEnterprise && !isCurrent && (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-xs">
              Popular
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-slate-900">
            ${plan.price}
          </span>
          <span className="text-sm text-muted-foreground">{plan.period}</span>
        </div>
        {plan.price === 0 && (
          <p className="text-xs text-muted-foreground mt-1">Free forever</p>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Features */}
      <div className="space-y-3 flex-1 mb-6">
        {plan.features.map((feature, idx) => (
          <div key={`${feature.label}-${idx}`} className="flex items-start gap-2.5">
            {feature.included ? (
              <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-4 w-4 mt-0.5 text-slate-300 shrink-0" />
            )}
            <span
              className={`text-sm ${
                feature.included ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {isCurrent ? (
        <Button
          className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 border-0"
          disabled
        >
          <Crown className="h-4 w-4 mr-2" />
          Current Plan
        </Button>
      ) : plan.price === 0 ? (
        <Button
          variant="outline"
          className="w-full"
        >
          Downgrade
        </Button>
      ) : (
        <Button
          className={`w-full ${
            isEnterprise
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Upgrade to {plan.name}
        </Button>
      )}
    </div>
  )
}
