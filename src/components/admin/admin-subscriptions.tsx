'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  RefreshCw,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Ban,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminSubscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  plan: string
  status: 'active' | 'canceled' | 'expired' | 'past_due'
  periodStart: string
  periodEnd: string
  cancelAtEnd: boolean
  amount: number
}

// ─── Animation ────────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'canceled':
      return 'bg-red-50 text-red-600 border-red-200'
    case 'expired':
      return 'bg-slate-50 text-slate-600 border-slate-200'
    case 'past_due':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function planBadgeClass(plan: string): string {
  switch (plan?.toLowerCase()) {
    case 'pro':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'starter':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'enterprise':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.subscriptions || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          userId: s.userId as string,
          userName: (s.user as Record<string, string>)?.name || 'Unknown',
          userEmail: (s.user as Record<string, string>)?.email || '',
          plan: (s.plan as Record<string, unknown>)?.name as string || 'Free',
          status: s.status as AdminSubscription['status'],
          periodStart: s.currentPeriodStart as string,
          periodEnd: s.currentPeriodEnd as string,
          cancelAtEnd: s.cancelAtPeriodEnd as boolean,
          amount: (s.plan as Record<string, number>)?.price || 0,
        }))
        setSubscriptions(mapped)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchSubs()
  }, [fetchSubs])

  const updateSubscription = async (subscriptionId: string, updates: { status?: string; cancelAtPeriodEnd?: boolean; planId?: string }) => {
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, ...updates }),
      })
      if (res.ok) {
        fetchSubs()
      }
    } catch {
      // Silently handle
    }
  }

  // Computed
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length
  const mrr = subscriptions.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)
  const canceledThisMonth = subscriptions.filter((s) => {
    if (s.status !== 'canceled') return false
    const d = new Date(s.periodEnd)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const churnRate = activeSubs > 0 ? ((canceledThisMonth / (activeSubs + canceledThisMonth)) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className="text-sm text-muted-foreground">Manage user subscriptions and billing plans</p>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{activeSubs}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                8.2% growth
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(mrr)}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Canceled This Month</p>
                  <p className="text-2xl font-bold">{canceledThisMonth}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">{churnRate}%</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" size="icon" onClick={fetchSubs} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscriptions table */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              All Subscriptions
            </CardTitle>
            <CardDescription>{subscriptions.length} subscriptions total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Period Start</TableHead>
                      <TableHead className="hidden md:table-cell">Period End</TableHead>
                      <TableHead className="hidden lg:table-cell">Cancel at End</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{sub.userName}</p>
                              <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={planBadgeClass(sub.plan)}>
                              {sub.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadgeClass(sub.status)}>
                              {sub.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">{formatDate(sub.periodStart)}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{formatDate(sub.periodEnd)}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {sub.cancelAtEnd ? (
                              <XCircle className="h-4 w-4 text-red-400" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">${sub.amount}/mo</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateSubscription(sub.id, { planId: 'pro' })}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Upgrade to Pro
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateSubscription(sub.id, { planId: 'enterprise' })}>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Upgrade to Enterprise
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {sub.status === 'active' && !sub.cancelAtEnd && (
                                  <DropdownMenuItem variant="destructive" onClick={() => updateSubscription(sub.id, { cancelAtPeriodEnd: true })}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Cancel at Period End
                                  </DropdownMenuItem>
                                )}
                                {(sub.status === 'canceled' || sub.status === 'expired') && (
                                  <DropdownMenuItem onClick={() => updateSubscription(sub.id, { status: 'active', cancelAtPeriodEnd: false })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
