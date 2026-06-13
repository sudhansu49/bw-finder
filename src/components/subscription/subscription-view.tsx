'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
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
  Rocket,
  Sparkles,
  Loader2,
  Users,
  Building2,
  Infinity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/stripe'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PlanPricing {
  price: number
  credits: number
  maxLeads: number
  maxSearches: number
  maxExports: number
  planId: string | null
  stripePriceId: string | null
}

interface PlanData {
  tier: string
  name: string
  description: string
  icon: string
  color: string
  gradient: string
  popular: boolean
  monthly: PlanPricing
  yearly: PlanPricing & {
    monthlyEquivalent: number
    savingsPercent: number
  }
  features: string[]
}

interface SubscriptionInfo {
  id: string
  status: string
  interval: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    tier: string
    price: number
  }
}

// ─── Animation ──────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Plan Icon Mapping ──────────────────────────────────────────────────────

function getPlanIcon(tier: string, className?: string) {
  switch (tier) {
    case 'starter':
      return <Rocket className={className || 'h-6 w-6'} />
    case 'agency':
      return <Zap className={className || 'h-6 w-6'} />
    case 'enterprise':
      return <Crown className={className || 'h-6 w-6'} />
    default:
      return <Star className={className || 'h-6 w-6'} />
  }
}

function getPlanIconBg(tier: string) {
  switch (tier) {
    case 'starter':
      return 'bg-slate-100 text-slate-600'
    case 'agency':
      return 'bg-amber-100 text-amber-600'
    case 'enterprise':
      return 'bg-emerald-100 text-emerald-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getPlanCardBorder(tier: string, popular: boolean) {
  if (popular) return 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/10'
  switch (tier) {
    case 'starter':
      return 'border-slate-200'
    case 'agency':
      return 'border-amber-200'
    case 'enterprise':
      return 'border-emerald-200'
    default:
      return ''
  }
}

function getPlanButtonStyle(tier: string, popular: boolean, isCurrent: boolean) {
  if (isCurrent) return 'bg-slate-100 text-slate-500 cursor-default'
  if (popular) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25'
  switch (tier) {
    case 'starter':
      return 'bg-slate-800 text-white hover:bg-slate-900'
    case 'agency':
      return 'bg-amber-500 text-white hover:bg-amber-600'
    case 'enterprise':
      return 'bg-emerald-600 text-white hover:bg-emerald-700'
    default:
      return ''
  }
}

function formatCredits(credits: number): string {
  if (credits === -1 || credits >= 999999) return 'Unlimited'
  return credits.toLocaleString('en-IN')
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SubscriptionView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [plans, setPlans] = useState<PlanData[]>([])
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/stripe/plans'),
        fetch(`/api/user/subscription?userId=${user?.id}`),
      ])

      if (plansRes.ok) {
        const data = await plansRes.json()
        setPlans(data.plans || [])
      }

      if (subRes.ok) {
        const data = await subRes.json()
        if (data.subscription) {
          setSubscription({
            id: data.subscription.id,
            status: data.subscription.status,
            interval: data.subscription.interval || 'monthly',
            currentPeriodEnd: data.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd || false,
            plan: {
              id: data.currentPlan?.id || '',
              name: data.currentPlan?.name || 'Free',
              tier: data.currentPlan?.tier || 'free',
              price: data.currentPlan?.price || 0,
            },
          })
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user?.id, fetchData])

  const handleSubscribe = async (tier: string) => {
    if (!user?.id) return
    setSubscribing(tier)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier,
          interval: billingInterval,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.demo) {
          toast({
            title: 'Subscription Activated!',
            description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan (${billingInterval}) is now active. Credits have been added to your account.`,
          })
          // Refresh data
          fetchData()
        } else if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to start checkout',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubscribing(null)
    }
  }

  const handleCancel = async (immediately: boolean) => {
    if (!user?.id) return
    setCanceling(true)

    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, immediately }),
      })

      if (res.ok) {
        toast({
          title: immediately ? 'Subscription Canceled' : 'Scheduled Cancellation',
          description: immediately
            ? 'Your subscription has been canceled.'
            : 'Your subscription will be canceled at the end of the billing period.',
        })
        fetchData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel subscription', variant: 'destructive' })
    } finally {
      setCanceling(false)
      setCancelDialog(false)
    }
  }

  const isCurrentPlan = (tier: string) => {
    return subscription?.plan?.tier === tier
  }

  // ─── Loading State ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex justify-center py-4">
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[520px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Current Subscription Banner ─────────────────────────────────────

  const currentTier = subscription?.plan?.tier || 'free'
  const currentInterval = subscription?.interval || 'monthly'

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Choose Your Plan</h1>
            <p className="text-sm text-muted-foreground">Scale your lead generation with the right plan</p>
          </div>
        </div>
      </motion.div>

      {/* Current plan info */}
      {subscription && subscription.status === 'active' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className={`border-0 shadow-sm overflow-hidden ${subscription.cancelAtPeriodEnd ? 'ring-2 ring-red-200' : 'ring-1 ring-emerald-200'}`}>
            <div className={`h-1 ${subscription.cancelAtPeriodEnd ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} />
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getPlanIconBg(currentTier)}`}>
                    {getPlanIcon(currentTier, 'h-5 w-5')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {subscription.plan.name} Plan
                      </h3>
                      <Badge variant="outline" className={subscription.cancelAtPeriodEnd
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }>
                        {subscription.cancelAtPeriodEnd ? 'Canceling' : 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(subscription.plan.price)}/{currentInterval === 'yearly' ? 'yr' : 'mo'}
                      {' · '}
                      Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => setCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const res = await fetch('/api/stripe/portal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.id }),
                      })
                      const data = await res.json()
                      if (data.url) {
                        window.location.href = data.url
                      } else {
                        toast({
                          title: 'Portal Not Available',
                          description: data.message || 'Manage your subscription from the billing page.',
                        })
                      }
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Billing interval toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-3 bg-slate-100 rounded-full p-1.5">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              billingInterval === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              billingInterval === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Yearly
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 border-0 font-semibold">
              Save 17%
            </Badge>
          </button>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.tier)
          const pricing = billingInterval === 'monthly' ? plan.monthly : plan.yearly
          const isSubscribing = subscribing === plan.tier

          return (
            <motion.div key={plan.tier} variants={item}>
              <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${getPlanCardBorder(plan.tier, plan.popular)}`}>
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                      <Star className="h-3 w-3 inline mr-1" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <CardContent className="p-6 pt-7">
                  {/* Plan header */}
                  <div className="mb-5">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${getPlanIconBg(plan.tier)}`}>
                      {getPlanIcon(plan.tier, 'h-6 w-6')}
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(billingInterval === 'yearly' ? (pricing as PlanPricing & { monthlyEquivalent: number }).monthlyEquivalent : pricing.price)}
                      </span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {billingInterval === 'yearly' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(plan.monthly.price)}/mo
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 border-0">
                          Save {(pricing as PlanPricing & { savingsPercent: number }).savingsPercent}%
                        </Badge>
                      </div>
                    )}
                    {billingInterval === 'yearly' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed {formatPrice(pricing.price)} annually
                      </p>
                    )}
                  </div>

                  {/* Credits info */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">
                        {formatCredits(pricing.credits)} credits/{billingInterval === 'yearly' ? 'mo' : 'mo'}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {formatCredits(pricing.maxLeads)} leads
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {formatCredits(pricing.maxSearches)} searches
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {formatCredits(pricing.maxExports)} exports
                      </span>
                    </div>
                  </div>

                  {/* Subscribe button */}
                  <Button
                    className={`w-full h-11 text-sm font-semibold rounded-xl transition-all duration-300 ${getPlanButtonStyle(plan.tier, plan.popular, isCurrent)}`}
                    disabled={isCurrent || isSubscribing}
                    onClick={() => handleSubscribe(plan.tier)}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {plan.popular && <Sparkles className="h-4 w-4 mr-2" />}
                        {subscription ? 'Switch Plan' : 'Get Started'}
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Separator className="my-5" />

                  {/* Features */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      What&apos;s included
                    </p>
                    {(showAllFeatures === plan.tier ? plan.features : plan.features.slice(0, 6)).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                          plan.tier === 'enterprise' ? 'text-emerald-500' :
                          plan.tier === 'agency' ? 'text-amber-500' :
                          'text-slate-400'
                        }`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 6 && (
                      <button
                        onClick={() => setShowAllFeatures(showAllFeatures === plan.tier ? null : plan.tier)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        {showAllFeatures === plan.tier ? (
                          <>Show less <ChevronUp className="h-3 w-3" /></>
                        ) : (
                          <>+ {plan.features.length - 6} more features <ChevronDown className="h-3 w-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Need a custom solution?</h3>
                  <p className="text-sm text-slate-300">
                    Get tailored pricing, dedicated support, and custom integrations for your team
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                onClick={() => {
                  toast({
                    title: 'Contact Sales',
                    description: 'Our sales team will reach out to you shortly!',
                  })
                }}
              >
                Contact Sales
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-slate-500" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing period.',
              },
              {
                q: 'What happens when my credits run out?',
                a: 'Your account will still be active, but you\'ll need to purchase additional credits or wait for your next billing cycle when credits are refreshed.',
              },
              {
                q: 'Is there a free trial?',
                a: 'All new accounts get 50 free credits to explore the platform. No credit card required to start.',
              },
              {
                q: 'How does the yearly billing work?',
                a: 'With yearly billing, you pay for 12 months upfront and get 2 months free. That\'s a 17% savings compared to monthly billing.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Absolutely. You can cancel anytime from your billing settings. Your access continues until the end of the current billing period.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="pb-4 border-b last:border-b-0 last:pb-0">
                <h4 className="font-medium text-sm">{faq.q}</h4>
                <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to cancel your subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 text-left"
              onClick={() => handleCancel(false)}
              disabled={canceling}
            >
              <div>
                <p className="font-medium">Cancel at period end</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep access until {subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })
                    : 'end of billing period'}
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 text-left border-red-200 hover:bg-red-50 text-red-600"
              onClick={() => handleCancel(true)}
              disabled={canceling}
            >
              <div>
                <p className="font-medium">Cancel immediately</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lose access now. No refunds for remaining period.
                </p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelDialog(false)} disabled={canceling}>
              Keep Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
