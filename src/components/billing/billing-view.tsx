'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Settings,
  Zap,
  Search,
  Globe,
  Edit,
  Trash2,
  Shield,
  Mail,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface PaymentMethod {
  type: string
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
}

interface BillingData {
  currentBalance: number
  creditTransactions: CreditTransaction[]
  subscription: SubscriptionData | null
  paymentMethod: PaymentMethod
  paymentSummary: {
    totalSpent: number
    totalPurchased: number
    thisMonthSpent: number
    planPrice: number
  }
  invoices: {
    id: string
    amount: number
    description: string
    date: string
    status: 'paid' | 'pending' | 'failed'
  }[]
}

// ─── Status Badge Helper ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'paid' | 'pending' | 'failed' }) {
  switch (status) {
    case 'paid':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 font-medium">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 font-medium">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatExpiry(month: number, year: number): string {
  return `${String(month).padStart(2, '0')}/${year}`
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function BillingView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [billingLoading, setBillingLoading] = useState(true)
  const [autoRecharge, setAutoRecharge] = useState(true)
  const [billingEmail, setBillingEmail] = useState(user?.email || '')
  const [taxId, setTaxId] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  // ── Fetch billing data on mount ──
  useEffect(() => {
    const fetchBilling = async () => {
      const userId = user?.id
      if (!userId) {
        setBillingLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/user/billing?userId=${userId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch billing data')
        }
        const data: BillingData = await res.json()
        setBillingData(data)
        if (data.paymentMethod) {
          // Update billing email to user's email if not already set
          setBillingEmail(user?.email || '')
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load billing data. Please refresh the page.',
          variant: 'destructive',
        })
      } finally {
        setBillingLoading(false)
      }
    }

    fetchBilling()
  }, [user?.id, toast])

  // ── Derived values ──
  const currentBalance = billingData?.currentBalance ?? 0
  const transactions = billingData?.creditTransactions ?? []
  const subscription = billingData?.subscription
  const paymentMethod = billingData?.paymentMethod
  const summary = billingData?.paymentSummary
  const invoices = billingData?.invoices ?? []

  // Next payment date from subscription
  const nextPaymentDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : 'N/A'
  const planPrice = subscription?.plan?.price ?? summary?.planPrice ?? 0
  const planName = subscription?.plan?.name || user?.planName || ''

  // ── Handlers ──

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSavingSettings(false)
    toast({
      title: 'Settings Saved',
      description: 'Your billing settings have been updated.',
    })
  }

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast({
      title: 'Downloading Invoice',
      description: `${invoiceNumber}.pdf is being prepared for download.`,
    })
  }

  const handleAddPaymentMethod = () => {
    toast({
      title: 'Add Payment Method',
      description: 'Payment method form will open shortly.',
    })
  }

  const handleEditCard = () => {
    toast({
      title: 'Edit Card',
      description: 'Card editing form will open shortly.',
    })
  }

  const handleRemoveCard = () => {
    toast({
      title: 'Remove Card',
      description: 'Are you sure? This action cannot be undone.',
      variant: 'destructive',
    })
  }

  // ── Loading skeleton ──
  if (billingLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing</h1>
          <p className="text-muted-foreground">Manage your payments, invoices, and usage</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing</h1>
        <p className="text-muted-foreground">Manage your payments, invoices, and usage</p>
      </div>

      {/* ─── Billing Overview Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(currentBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Credit balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Next Payment</span>
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{nextPaymentDate !== 'N/A' ? nextPaymentDate.split(',')[0] : 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {planName} renewal — {formatCurrency(planPrice)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {paymentMethod?.brand || 'Visa'} •••• {paymentMethod?.last4 || '4242'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Expires {paymentMethod ? formatExpiry(paymentMethod.expiryMonth, paymentMethod.expiryYear) : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Monthly Spend</span>
                <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary?.thisMonthSpent ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This month • Total: {formatCurrency(summary?.totalSpent ?? 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Main Content Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Billing History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Payment Method</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPaymentMethod}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add New
                  </Button>
                </div>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {paymentMethod?.brand || 'Visa'} •••• {paymentMethod?.last4 || '4242'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {paymentMethod ? formatExpiry(paymentMethod.expiryMonth, paymentMethod.expiryYear) : 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 text-xs">
                      Default
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCard}
                      className="text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCard}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Billing History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Billing History</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {transactions.length} transactions
                  </Badge>
                </div>
                <CardDescription>View and download your past invoices</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">No transactions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your billing history will appear here</p>
                  </div>
                ) : (
                  <div className="max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <TableHead className="pl-6">Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="pr-6 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => {
                          const isCredit = tx.amount > 0
                          const typeLabel = tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
                          return (
                            <TableRow key={tx.id} className="group">
                              <TableCell className="pl-6 text-sm text-muted-foreground">
                                {formatDate(tx.createdAt)}
                              </TableCell>
                              <TableCell className="text-sm font-medium text-slate-900 dark:text-white max-w-[220px] truncate">
                                {tx.description}
                              </TableCell>
                              <TableCell className={`text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                {isCredit ? '+' : ''}{tx.amount}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {tx.balance}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    tx.type === 'purchase'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                      : tx.type === 'usage'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                                        : tx.type === 'refund'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
                                  }`}
                                >
                                  {typeLabel}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-6 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(`TXN-${tx.id.slice(-6).toUpperCase()}`)}
                                  className="text-xs text-muted-foreground hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity h-8"
                                >
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  PDF
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column — Usage & Settings */}
        <div className="space-y-6">
          {/* Usage This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Usage This Month</CardTitle>
                </div>
                <CardDescription>Your resource consumption this billing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Credits Used */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Credits Used</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {Math.abs(summary?.thisMonthSpent ?? 0).toLocaleString()}
                      </span>{' '}
                      credits
                    </span>
                  </div>
                  <Progress
                    value={subscription?.plan?.credits ? Math.min((Math.abs(summary?.thisMonthSpent ?? 0) / subscription.plan.credits) * 100, 100) : 0}
                    className="h-2 [&>div]:bg-amber-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    {currentBalance.toLocaleString()} credits remaining
                  </p>
                </div>

                <Separator />

                {/* API Calls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">API Calls</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {transactions.filter((t) => t.type === 'usage' && t.description?.toLowerCase().includes('api')).length.toLocaleString()}
                      </span>{' '}
                      calls
                    </span>
                  </div>
                  <Progress
                    value={Math.min((transactions.filter((t) => t.type === 'usage' && t.description?.toLowerCase().includes('api')).length / 5000) * 100, 100)}
                    className="h-2 [&>div]:bg-amber-500"
                  />
                  <p className="text-xs text-muted-foreground">API usage this period</p>
                </div>

                <Separator />

                {/* Searches Performed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Searches Performed</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {transactions.filter((t) => t.type === 'usage' && t.description?.toLowerCase().includes('search')).length.toLocaleString()}
                      </span>{' '}
                      searches
                    </span>
                  </div>
                  <Progress
                    value={Math.min((transactions.filter((t) => t.type === 'usage' && t.description?.toLowerCase().includes('search')).length / 500) * 100, 100)}
                    className="h-2 [&>div]:bg-amber-500"
                  />
                  <p className="text-xs text-muted-foreground">Search usage this period</p>
                </div>

                <Separator />

                {/* Usage Warning */}
                {currentBalance < 500 && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Credits running low</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        You have {currentBalance} credits remaining. Consider upgrading your plan or
                        purchasing additional credits.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Payment Settings</CardTitle>
                </div>
                <CardDescription>Configure your billing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Auto-recharge */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Auto-recharge</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically buy 1,000 credits when balance drops below 500
                    </p>
                  </div>
                  <Switch
                    checked={autoRecharge}
                    onCheckedChange={setAutoRecharge}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                <Separator />

                {/* Billing Email */}
                <div className="space-y-2">
                  <Label htmlFor="billing-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Billing Email
                  </Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="billing@company.com"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Invoices and receipts will be sent here
                  </p>
                </div>

                <Separator />

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="tax-id" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Tax ID / VAT Number
                  </Label>
                  <Input
                    id="tax-id"
                    placeholder="e.g. US123456789"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Added to your invoices for tax purposes
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
