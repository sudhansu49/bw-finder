'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import {
  Coins,
  Activity,
  DollarSign,
  TrendingUp,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreditTransaction {
  id: string
  userId: string
  userName: string
  amount: number
  type: string
  description: string
  date: string
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'purchase':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'usage':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'bonus':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'refund':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'plan_credits':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminCredits() {
  const [credits, setCredits] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  // Add credits dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addUserId, setAddUserId] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [addType, setAddType] = useState<'bonus' | 'purchase' | 'refund'>('bonus')
  const [addDesc, setAddDesc] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)

  const fetchCredits = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      const res = await fetch(`/api/admin/credits?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.transactions || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          userId: t.userId as string,
          userName: (t.user as Record<string, string>)?.name || 'Unknown',
          amount: t.amount as number,
          type: t.type as string,
          description: t.description as string,
          date: t.createdAt as string,
        }))
        setCredits(mapped)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const handleAddCredits = async () => {
    if (!addUserId || !addAmount) return
    setAddSubmitting(true)
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: addUserId,
          amount: Number(addAmount),
          type: addType,
          description: addDesc || `Admin added ${addAmount} credits`,
        }),
      })
      if (res.ok) {
        setAddOpen(false)
        setAddUserId('')
        setAddAmount('')
        setAddDesc('')
        fetchCredits()
      }
    } catch {
      // Silently handle
    } finally {
      setAddSubmitting(false)
    }
  }

  // Computed
  const totalIssued = credits.filter((c) => c.amount > 0).reduce((sum, c) => sum + c.amount, 0)
  const totalUsed = credits.filter((c) => c.amount < 0).reduce((sum, c) => sum + Math.abs(c.amount), 0)
  const balance = totalIssued - totalUsed
  const revenueFromCredits = credits
    .filter((c) => c.type === 'purchase')
    .reduce((sum, c) => sum + c.amount * 0.1, 0)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Coins className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Credits Management</h1>
              <p className="text-sm text-muted-foreground">Monitor credits transactions and balances</p>
            </div>
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Issued</p>
                  <p className="text-2xl font-bold">{totalIssued.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                Credits added to accounts
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
                  <p className="text-sm text-muted-foreground">Total Used</p>
                  <p className="text-2xl font-bold">{totalUsed.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">{balance.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue from Credits</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueFromCredits)}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
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
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="plan_credits">Plan Credits</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" size="icon" onClick={fetchCredits} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions table */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Credit Transactions
            </CardTitle>
            <CardDescription>{credits.length} transactions found</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No credit transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      credits.map((credit) => (
                        <TableRow key={credit.id}>
                          <TableCell>
                            <span className="text-sm font-medium">{credit.userName}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-bold ${credit.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {credit.amount > 0 ? '+' : ''}{credit.amount}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className={typeBadgeClass(credit.type)}>
                              {credit.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
                              {credit.description}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">{formatDate(credit.date)}</span>
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

      {/* Add Credits Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>Add credits to a user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={addUserId} onChange={(e) => setAddUserId(e.target.value)} placeholder="Enter user ID" />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="100"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={addType} onValueChange={(v) => setAddType(v as 'bonus' | 'purchase' | 'refund')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleAddCredits}
              disabled={addSubmitting}
            >
              {addSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
