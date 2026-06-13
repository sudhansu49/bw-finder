'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Shield,
  Crown,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  IndianRupee,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrency, useTranslation } from '@/lib/i18n/hooks'
import { formatPrice } from '@/lib/stripe'

// ─── API Response Types ──────────────────────────────────────────────────────────

interface CreditTransaction {
  id: string
  userId: string
  amount: number
  balance: number
  type: string
  description: string
  referenceId: string | null
  createdAt: string
}

interface SubscriptionData {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    price: number
    credits: number
  }
}

interface BillingData {
  currentBalance: number
  creditTransactions: CreditTransaction[]
  subscription: SubscriptionData | null
  paymentMethod: {
    type: string
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
  }
  paymentSummary: {
    totalSpent: number
    totalPurchased: number
    thisMonthSpent: number
    planPrice: number
  }
  invoices: Array<{
    id: string
    amount: number
    description: string
    date: string
    status: 'paid' | 'pending' | 'failed'
  }>
}

// ─── Animation ──────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
    case 'canceled':
      return <Badge className="bg-red-50 text-red-600 border-red-200 border"><XCircle className="h-3 w-3 mr-1" />Canceled</Badge>
    case 'past_due':
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 border"><Clock className="h-3 w-3 mr-1" />Past Due</Badge>
    case 'trialing':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 border"><Clock className="h-3 w-3 mr-1" />Trial</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function BillingView() {
  const { user, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const { currency } = useCurrency()
  const { t } = useTranslation()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const fetchBilling = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/user/billing?userId=${user?.id}`)
      if (res.ok) {
        const billingData = await res.json()
        setData(billingData)
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchBilling()
  }, [user?.id, fetchBilling])

  const handlePortalAccess = async () => {
    if (!user?.id) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const portalData = await res.json()
      if (portalData.url) {
        window.location.href = portalData.url
      } else {
        toast({
          title: 'Billing Portal',
          description: portalData.message || 'Manage your subscription from the subscription page.',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to open billing portal', variant: 'destructive' })
    } finally {
      setPortalLoading(false)
    }
  }

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-40 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const subscription = data.subscription
  const currentPlan = subscription?.plan
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null
  const daysRemaining = periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Billing & Payments</h1>
              <p className="text-sm text-muted-foreground">Manage your subscription, credits, and payment methods</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBilling}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold">{currentPlan?.name || 'Free'}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              {currentPlan && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPrice(currentPlan.price, currency)}/mo
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Balance</p>
                  <p className="text-xl font-bold">{data.currentBalance.toLocaleString('en-IN')}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              {currentPlan && (
                <p className="text-xs text-muted-foreground mt-1">
                  of {currentPlan.credits >= 999999 ? '∞' : currentPlan.credits.toLocaleString('en-IN')} monthly
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month Spent</p>
                  <p className="text-xl font-bold">{data.paymentSummary.thisMonthSpent.toLocaleString('en-IN')} credits</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Until Renewal</p>
                  <p className="text-xl font-bold">{daysRemaining}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
              </div>
              {periodEnd && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews {formatDate(periodEnd.toISOString())}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Current Subscription & Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Details */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {statusBadge(subscription.status)}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <span className="text-sm font-medium">{currentPlan?.name || 'Free'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">{formatPrice(currentPlan?.price || 0, currency)}/mo</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Period Start</span>
                    <span className="text-sm font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Period End</span>
                    <span className="text-sm font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <>
                      <Separator />
                      <div className="bg-red-50 rounded-lg p-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-xs text-red-700">
                          Subscription will be canceled at the end of the billing period
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setCurrentView('user-subscription')}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handlePortalAccess}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Manage Portal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Crown className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No active subscription</p>
                  <Button size="sm" onClick={() => setCurrentView('user-subscription')}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Card display */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div className="h-8 w-12 rounded bg-amber-400/80 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-slate-900" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase">{data.paymentMethod.brand}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-mono tracking-widest">
                      •••• •••• •••• {data.paymentMethod.last4}
                    </p>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>Expires {data.paymentMethod.expiryMonth}/{data.paymentMethod.expiryYear}</span>
                      <span>{user?.name || 'Card Holder'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handlePortalAccess} disabled={portalLoading}>
                    Update Card
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Add Payment Method
                  </Button>
                </div>

                <Separator />

                {/* Payment Summary */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Credits Purchased</span>
                    <span className="font-medium">{data.paymentSummary.totalPurchased.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Credits Used</span>
                    <span className="font-medium">{data.paymentSummary.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Plan Price</span>
                    <span className="font-medium">{formatPrice(data.paymentSummary.planPrice, currency)}/mo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Credit Usage Progress */}
      {currentPlan && currentPlan.credits > 0 && currentPlan.credits < 999999 && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Credit Usage This Period</h3>
                  <span className="text-sm text-muted-foreground">
                    {data.currentBalance} / {currentPlan.credits.toLocaleString('en-IN')} remaining
                  </span>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, ((currentPlan.credits - data.currentBalance) / currentPlan.credits) * 100))}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(((currentPlan.credits - data.currentBalance) / currentPlan.credits) * 100)}% used</span>
                  <span>{data.currentBalance.toLocaleString('en-IN')} credits left</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Billing History / Invoices */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-slate-500" />
              Billing History
            </CardTitle>
            <CardDescription>Recent transactions and invoices</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.creditTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.creditTransactions.slice(0, 20).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {tx.balance.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
