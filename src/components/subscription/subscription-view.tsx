'use client'

import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
} from 'lucide-react'

// ─── Plan Data ─────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string
  included: boolean
}

interface Plan {
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

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: '/mo',
    description: 'Perfect for exploring lead generation and getting started.',
    icon: <Zap className="h-5 w-5" />,
    features: [
      { label: '50 leads per month', included: true },
      { label: '10 searches per month', included: true },
      { label: 'Basic reports', included: true },
      { label: 'Email support', included: true },
      { label: 'AI lead scoring', included: false },
      { label: 'CRM access', included: false },
      { label: 'Proposal generator', included: false },
      { label: 'Priority support', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: '/mo',
    description: 'For professionals who need powerful lead intelligence.',
    icon: <Crown className="h-5 w-5" />,
    highlight: true,
    current: true,
    features: [
      { label: '500 leads per month', included: true },
      { label: '100 searches per month', included: true },
      { label: 'AI lead scoring', included: true },
      { label: 'Priority support', included: true },
      { label: 'CRM access', included: true },
      { label: 'Proposal generator', included: true },
      { label: 'White-label reports', included: false },
      { label: 'API access', included: false },
      { label: 'Custom integrations', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: '/mo',
    description: 'For teams and agencies that need unlimited power.',
    icon: <Globe className="h-5 w-5" />,
    enterprise: true,
    features: [
      { label: 'Unlimited leads', included: true },
      { label: 'Unlimited searches', included: true },
      { label: 'White-label reports', included: true },
      { label: 'API access', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'AI lead scoring', included: true },
      { label: 'CRM access', included: true },
      { label: 'Proposal generator', included: true },
    ],
  },
]

// ─── Usage Data ────────────────────────────────────────────────────────────────

interface UsageItem {
  label: string
  used: number
  total: number
  unit?: string
  icon: React.ReactNode
  color: string
}

const usageData: UsageItem[] = [
  {
    label: 'Leads',
    used: 350,
    total: 500,
    icon: <Target className="h-4 w-4" />,
    color: 'text-amber-600',
  },
  {
    label: 'Searches',
    used: 67,
    total: 100,
    icon: <BarChart3 className="h-4 w-4" />,
    color: 'text-emerald-600',
  },
  {
    label: 'Credits',
    used: 280,
    total: 500,
    icon: <Zap className="h-4 w-4" />,
    color: 'text-orange-600',
  },
  {
    label: 'API Calls',
    used: 1200,
    total: 5000,
    unit: '',
    icon: <Code className="h-4 w-4" />,
    color: 'text-violet-600',
  },
]

// ─── Billing History ───────────────────────────────────────────────────────────

interface BillingRecord {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
}

const billingHistory: BillingRecord[] = [
  { id: 'INV-2026-012', date: 'Jun 1, 2026', description: 'Pro Plan — Monthly', amount: 29.00, status: 'paid' },
  { id: 'INV-2026-011', date: 'May 1, 2026', description: 'Pro Plan — Monthly', amount: 29.00, status: 'paid' },
  { id: 'INV-2026-010', date: 'Apr 1, 2026', description: 'Pro Plan — Monthly', amount: 29.00, status: 'paid' },
  { id: 'INV-2026-009', date: 'Mar 1, 2026', description: 'Pro Plan — Monthly', amount: 29.00, status: 'paid' },
  { id: 'INV-2026-008', date: 'Feb 1, 2026', description: 'Starter → Pro Upgrade', amount: 29.00, status: 'paid' },
]

// ─── FAQ Data ──────────────────────────────────────────────────────────────────

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

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function getUsagePercentage(used: number, total: number): number {
  return Math.min(Math.round((used / total) * 100), 100)
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getStatusBadge(status: BillingRecord['status']) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-xs">Paid</Badge>
    case 'pending':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-0 text-xs">Pending</Badge>
    case 'failed':
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0 text-xs">Failed</Badge>
  }
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

// ─── Component ─────────────────────────────────────────────────────────────────

export function SubscriptionView() {
  const { user } = useAppStore()
  const currentPlan = plans.find((p) => p.current)!

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
                      {currentPlan.name} Plan
                    </h2>
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-0 text-xs font-medium">
                      Current Plan
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      Renews Jul 1, 2026
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      ${currentPlan.price}.00/month
                    </span>
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
          {plans.map((plan) => {
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
              Your resource consumption since Jun 1, 2026. Resets on Jul 1, 2026.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {usageData.map((u) => {
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Invoice</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Amount</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3">
                        <span className="text-sm font-medium text-slate-700">{record.id}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-muted-foreground">{record.date}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-slate-700">{record.description}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          ${record.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {getStatusBadge(record.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing last {billingHistory.length} invoices
              </p>
              <Button variant="ghost" size="sm" className="text-amber-600 text-xs">
                View All Invoices
              </Button>
            </div>
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
  plan: Plan
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
        {plan.features.map((feature) => (
          <div key={feature.label} className="flex items-start gap-2.5">
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
