'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, Pie, PieChart } from 'recharts'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  AlertCircle,
} from 'lucide-react'

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

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
}

// ─── Date Range Types ──────────────────────────────────────────────────────────

type DateRange = '7D' | '30D' | '90D' | 'All'

// ─── API Response Types ────────────────────────────────────────────────────────

interface KPIData {
  totalLeads: number
  conversionRate: number
  revenueGenerated: number
  outreachSent: number
  leadsTrend: number
  conversionTrend: number
  revenueTrend: number
  outreachTrend: number
}

interface LeadTrendPoint {
  date: string
  leads: number
  qualified: number
}

interface OutreachPerformanceItem {
  channel: string
  sent: number
  opened: number
  replied: number
  bounced: number
}

interface RevenueByCategoryItem {
  category: string
  revenue: number
  count: number
}

interface LeadScoreDistItem {
  range: string
  count: number
  label: string
}

interface RecentLead {
  id: string
  business: { name: string; category: string }
  leadScore: number
  status: string
  estimatedValue: number
  createdAt: string
  outreachType: string | null
}

interface ReportData {
  range: string
  kpi: KPIData
  leadTrend: LeadTrendPoint[]
  outreachPerformance: OutreachPerformanceItem[]
  revenueByCategory: RevenueByCategoryItem[]
  leadScoreDistribution: LeadScoreDistItem[]
  recentLeads: RecentLead[]
  priorityDistribution: { priority: string; count: number }[]
  monthlyTrend: { month: string; leads: number; converted: number }[]
}

// ─── Color Constants ───────────────────────────────────────────────────────────

const PIE_COLORS = ['#f59e0b', '#f97316', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const SCORE_COLORS: Record<string, string> = {
  Cold: '#94a3b8',
  Cool: '#06b6d4',
  Warm: '#f59e0b',
  Hot: '#f97316',
  Prime: '#ef4444',
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  'new_lead': 'bg-slate-100 text-slate-700',
  'contacted': 'bg-amber-100 text-amber-700',
  'interested': 'bg-blue-100 text-blue-700',
  'qualified': 'bg-emerald-100 text-emerald-700',
  'proposal': 'bg-pink-100 text-pink-700',
  'negotiation': 'bg-violet-100 text-violet-700',
  'won': 'bg-emerald-100 text-emerald-800',
  'lost': 'bg-red-100 text-red-700',
  'New': 'bg-slate-100 text-slate-700',
  'Contacted': 'bg-amber-100 text-amber-700',
  'Interested': 'bg-blue-100 text-blue-700',
  'Qualified': 'bg-emerald-100 text-emerald-700',
  'Meeting': 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-pink-100 text-pink-700',
  'Negotiation': 'bg-violet-100 text-violet-700',
  'Won': 'bg-emerald-100 text-emerald-800',
  'Lost': 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  'new_lead': 'New',
  'contacted': 'Contacted',
  'interested': 'Interested',
  'qualified': 'Qualified',
  'proposal': 'Proposal',
  'negotiation': 'Negotiation',
  'won': 'Won',
  'lost': 'Lost',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toLocaleString()}`
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 70) return { bg: 'bg-emerald-50', text: 'text-emerald-600' }
  if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-600' }
  return { bg: 'bg-red-50', text: 'text-red-500' }
}

function formatStatus(status: string): string {
  return STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function getChannelIcon(channel: string | null): string {
  if (!channel) return 'N/A'
  const lower = channel.toLowerCase()
  if (lower === 'email') return 'Email'
  if (lower === 'phone') return 'Call'
  if (lower === 'whatsapp') return 'WhatsApp'
  if (lower === 'linkedin') return 'LinkedIn'
  return channel
}

// ─── Skeleton Components ───────────────────────────────────────────────────────

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-slate-100" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-14 w-14 rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ReportsView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState<DateRange>('30D')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async (range: DateRange) => {
    const userId = user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/user/reports?userId=${userId}&range=${range}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to fetch reports')
      }
      const json = await res.json()
      setData(json as ReportData)
    } catch (err: any) {
      console.error('Failed to fetch reports:', err)
      setError(err.message || 'Failed to load report data')
      toast({
        title: 'Error',
        description: 'Failed to load report data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    fetchReports(dateRange)
  }, [dateRange, fetchReports])

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range)
  }

  // ── Derived Data ────────────────────────────────────────────────────

  const kpi = data?.kpi
  const leadTrend = data?.leadTrend || []
  const outreachPerformance = data?.outreachPerformance || []
  const revenueByCategory = data?.revenueByCategory || []
  const leadScoreDist = data?.leadScoreDistribution || []
  const recentLeads = data?.recentLeads || []

  // Map recentLeads to reportEntries format for the table
  const reportEntries = recentLeads.map((lead) => ({
    id: lead.id,
    business: lead.business.name,
    category: lead.business.category,
    leadScore: lead.leadScore,
    status: formatStatus(lead.status),
    revenue: lead.estimatedValue,
    date: formatDate(lead.createdAt),
    channel: getChannelIcon(lead.outreachType),
  }))

  // ── Chart Configs ──────────────────────────────────────────────

  const leadTrendConfig = {
    leads: { label: 'Leads Discovered', color: '#f59e0b' },
    qualified: { label: 'Qualified Leads', color: '#10b981' },
  }

  const outreachConfig = {
    sent: { label: 'Sent', color: '#94a3b8' },
    opened: { label: 'Opened', color: '#f59e0b' },
    replied: { label: 'Replied', color: '#10b981' },
    bounced: { label: 'Bounced', color: '#ef4444' },
  }

  const revenueCategoryConfig = revenueByCategory.reduce((acc, c, i) => {
    acc[c.category] = { label: c.category, color: PIE_COLORS[i % PIE_COLORS.length] }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const scoreDistConfig = {
    count: { label: 'Lead Count', color: '#f59e0b' },
  }

  // Flatten outreach data for grouped bar chart
  const outreachFlatData = outreachPerformance.map((d) => ({
    channel: d.channel,
    Sent: d.sent,
    Opened: d.opened,
    Replied: d.replied,
    Bounced: d.bounced,
  }))

  const outreachFlatConfig = {
    Sent: { label: 'Sent', color: '#94a3b8' },
    Opened: { label: 'Opened', color: '#f59e0b' },
    Replied: { label: 'Replied', color: '#10b981' },
    Bounced: { label: 'Bounced', color: '#ef4444' },
  }

  // ── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <KPISkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-amber-500" />
              Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Performance analytics for {user?.name || 'your account'} — track leads, outreach, and revenue.
            </p>
          </div>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900">Unable to load reports</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchReports(dateRange)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-amber-500" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Performance analytics for {user?.name || 'your account'} — track leads, outreach, and revenue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            {(['7D', '30D', '90D', 'All'] as DateRange[]).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={dateRange === range ? 'default' : 'ghost'}
                className={`h-8 px-3 text-xs font-medium rounded-md transition-all ${
                  dateRange === range
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                onClick={() => handleRangeChange(range)}
                disabled={loading}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Custom
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* ── KPI Summary Cards ───────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Total Leads */}
        <motion.div variants={item} whileHover={cardHover}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-4xl font-bold tracking-tight">{(kpi?.totalLeads || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(kpi?.leadsTrend || 0) >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi?.leadsTrend || 0}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi?.leadsTrend || 0)}%
                      </span>
                    )}
                    <span className="text-muted-foreground">vs prev period</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div variants={item} whileHover={cardHover}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-4xl font-bold tracking-tight">{kpi?.conversionRate || 0}%</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(kpi?.conversionTrend || 0) >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi?.conversionTrend || 0}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi?.conversionTrend || 0)}%
                      </span>
                    )}
                    <span className="text-muted-foreground">vs prev period</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Generated */}
        <motion.div variants={item} whileHover={cardHover}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                  <p className="text-4xl font-bold tracking-tight">{formatCurrency(kpi?.revenueGenerated || 0)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(kpi?.revenueTrend || 0) >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi?.revenueTrend || 0}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi?.revenueTrend || 0)}%
                      </span>
                    )}
                    <span className="text-muted-foreground">vs prev period</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Outreach Sent */}
        <motion.div variants={item} whileHover={cardHover}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Outreach Sent</p>
                  <p className="text-4xl font-bold tracking-tight">{(kpi?.outreachSent || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {(kpi?.outreachTrend || 0) >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi?.outreachTrend || 0}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi?.outreachTrend || 0)}%
                      </span>
                    )}
                    <span className="text-muted-foreground">vs prev period</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-7 w-7 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Charts Section (2x2 Grid) ───────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Lead Generation Trend — Area Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Lead Generation Trend
              </CardTitle>
              <CardDescription>Leads discovered and qualified over time</CardDescription>
            </CardHeader>
            <CardContent>
              {leadTrend.length > 0 ? (
                <ChartContainer config={leadTrendConfig} className="h-[300px] w-full">
                  <AreaChart data={leadTrend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="qualifiedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={2.5} fill="url(#leadGradient)" />
                    <Area type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={2.5} fill="url(#qualifiedGradient)" />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No lead trend data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Outreach Performance — Grouped Bar Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-500" />
                Outreach Performance
              </CardTitle>
              <CardDescription>Emails, calls & WhatsApp breakdown by outcome</CardDescription>
            </CardHeader>
            <CardContent>
              {outreachFlatData.length > 0 && outreachFlatData.some(d => d.Sent > 0 || d.Opened > 0 || d.Replied > 0 || d.Bounced > 0) ? (
                <ChartContainer config={outreachFlatConfig} className="h-[300px] w-full">
                  <BarChart data={outreachFlatData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="channel" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Sent" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Opened" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Replied" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Bounced" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No outreach data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Category — Pie Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                Revenue by Category
              </CardTitle>
              <CardDescription>Revenue distribution across business categories</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByCategory.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ChartContainer config={revenueCategoryConfig} className="h-[260px] w-full lg:w-1/2">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={revenueByCategory}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {revenueByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2">
                    {revenueByCategory.map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-3 w-3 rounded-sm shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground truncate">{cat.category}</span>
                        <span className="font-medium ml-auto">{formatCurrency(cat.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No revenue data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Lead Score Distribution — Bar Chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                Lead Score Distribution
              </CardTitle>
              <CardDescription>How leads are distributed across scoring ranges</CardDescription>
            </CardHeader>
            <CardContent>
              {leadScoreDist.length > 0 && leadScoreDist.some(d => d.count > 0) ? (
                <>
                  <ChartContainer config={scoreDistConfig} className="h-[300px] w-full">
                    <BarChart data={leadScoreDist} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {leadScoreDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SCORE_COLORS[entry.label] || '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  {/* Score Legend */}
                  <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                    {Object.entries(SCORE_COLORS).map(([label, color]) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No lead score data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Detailed Data Table ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Detailed Report Entries
                </CardTitle>
                <CardDescription>Recent leads and their performance metrics</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reportEntries.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Lead Score</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Channel</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Revenue</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportEntries.map((entry) => {
                        const sc = getScoreColor(entry.leadScore)
                        return (
                          <tr key={entry.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-3">
                              <p className="text-sm font-medium">{entry.business}</p>
                            </td>
                            <td className="py-3">
                              <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                            </td>
                            <td className="py-3">
                              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${sc.bg}`}>
                                <span className={`text-xs font-bold ${sc.text}`}>{entry.leadScore}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="secondary" className={`text-xs ${STATUS_BADGE_STYLES[entry.status] || STATUS_BADGE_STYLES[formatStatus(entry.status)] || 'bg-slate-100 text-slate-700'}`}>
                                {entry.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                {entry.channel === 'Email' && <Mail className="h-3.5 w-3.5" />}
                                {entry.channel === 'Call' && <Target className="h-3.5 w-3.5" />}
                                {entry.channel === 'WhatsApp' && <Users className="h-3.5 w-3.5" />}
                                {entry.channel}
                              </div>
                            </td>
                            <td className="py-3 text-sm font-medium text-right">${entry.revenue.toLocaleString()}</td>
                            <td className="py-3 text-sm text-muted-foreground">{entry.date}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary */}
                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {reportEntries.length} entries for <span className="font-medium text-slate-700">{dateRange === 'All' ? 'all time' : `last ${dateRange.replace('D', ' days')}`}</span>
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-semibold text-emerald-600">
                        ${reportEntries.reduce((sum, e) => sum + e.revenue, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Avg Score:</span>
                      <span className="font-semibold text-amber-600">
                        {reportEntries.length > 0 ? Math.round(reportEntries.reduce((sum, e) => sum + e.leadScore, 0) / reportEntries.length) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No lead entries found for this period</p>
                <p className="text-xs text-muted-foreground mt-1">Try selecting a different date range or add more leads</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
