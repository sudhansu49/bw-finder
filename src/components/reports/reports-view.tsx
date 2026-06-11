'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, Pie, PieChart } from 'recharts'
import { motion } from 'framer-motion'
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

// ─── Demo Data Generators ──────────────────────────────────────────────────────

function generateLeadTrendData(range: DateRange) {
  const points = range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 12 : 12
  if (range === '7D') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((d, i) => ({
      date: d,
      leads: [12, 18, 15, 22, 28, 10, 16][i],
      qualified: [5, 8, 7, 11, 14, 4, 8][i],
    }))
  }
  if (range === '30D') {
    return Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1}`,
      leads: Math.floor(Math.random() * 20) + 8,
      qualified: Math.floor(Math.random() * 10) + 3,
    }))
  }
  if (range === '90D') {
    const months = ['W1 Jan', 'W2 Jan', 'W3 Jan', 'W4 Jan', 'W1 Feb', 'W2 Feb', 'W3 Feb', 'W4 Feb', 'W1 Mar', 'W2 Mar', 'W3 Mar', 'W4 Mar']
    return months.map((m, i) => ({
      date: m,
      leads: [42, 55, 48, 62, 58, 71, 65, 78, 74, 82, 88, 95][i],
      qualified: [18, 24, 20, 28, 25, 33, 29, 36, 34, 39, 42, 46][i],
    }))
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((m, i) => ({
    date: m,
    leads: [120, 145, 132, 168, 155, 190, 178, 210, 195, 230, 245, 268][i],
    qualified: [52, 64, 58, 75, 68, 86, 79, 96, 88, 105, 112, 124][i],
  }))
}

function generateOutreachData(range: DateRange) {
  const multiplier = range === '7D' ? 1 : range === '30D' ? 4 : range === '90D' ? 12 : 52
  return [
    { channel: 'Email', sent: 245 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), opened: 142 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), replied: 38 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), bounced: 22 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier) },
    { channel: 'Call', sent: 120 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), opened: 95 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), replied: 28 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), bounced: 12 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier) },
    { channel: 'WhatsApp', sent: 180 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), opened: 156 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), replied: 45 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier), bounced: 8 * (multiplier > 4 ? Math.floor(multiplier / 4) : multiplier) },
  ]
}

function generateRevenueByCategory() {
  return [
    { category: 'Salon', revenue: 28400, count: 18 },
    { category: 'Restaurant', revenue: 42100, count: 24 },
    { category: 'Gym', revenue: 19800, count: 12 },
    { category: 'Dental', revenue: 35600, count: 15 },
    { category: 'Retail', revenue: 22300, count: 20 },
    { category: 'Legal', revenue: 51200, count: 9 },
    { category: 'Real Estate', revenue: 38700, count: 11 },
    { category: 'Auto Repair', revenue: 15400, count: 14 },
  ]
}

function generateLeadScoreDistribution() {
  return [
    { range: '0-10', count: 8, label: 'Cold' },
    { range: '11-20', count: 15, label: 'Cold' },
    { range: '21-30', count: 22, label: 'Cool' },
    { range: '31-40', count: 35, label: 'Cool' },
    { range: '41-50', count: 48, label: 'Warm' },
    { range: '51-60', count: 56, label: 'Warm' },
    { range: '61-70', count: 42, label: 'Hot' },
    { range: '71-80', count: 31, label: 'Hot' },
    { range: '81-90', count: 18, label: 'Prime' },
    { range: '91-100', count: 9, label: 'Prime' },
  ]
}

function generateReportEntries(range: DateRange) {
  const entries = [
    { id: 'rpt-001', business: 'Glow Beauty Salon', category: 'Salon', leadScore: 82, status: 'Won', revenue: 2800, date: '2025-01-15', channel: 'Email' },
    { id: 'rpt-002', business: 'Sakura Sushi Bar', category: 'Restaurant', leadScore: 74, status: 'Proposal Sent', revenue: 3500, date: '2025-01-14', channel: 'WhatsApp' },
    { id: 'rpt-003', business: 'FitZone Gym', category: 'Gym', leadScore: 65, status: 'Qualified', revenue: 2200, date: '2025-01-13', channel: 'Call' },
    { id: 'rpt-004', business: 'Bright Smile Dental', category: 'Dental', leadScore: 91, status: 'Won', revenue: 4200, date: '2025-01-12', channel: 'Email' },
    { id: 'rpt-005', business: 'Urban Threads', category: 'Retail', leadScore: 43, status: 'Contacted', revenue: 1800, date: '2025-01-11', channel: 'WhatsApp' },
    { id: 'rpt-006', business: 'Parker & Associates', category: 'Legal', leadScore: 88, status: 'Won', revenue: 5600, date: '2025-01-10', channel: 'Call' },
    { id: 'rpt-007', business: 'Keystone Realty', category: 'Real Estate', leadScore: 77, status: 'Negotiation', revenue: 3800, date: '2025-01-09', channel: 'Email' },
    { id: 'rpt-008', business: 'Mike\'s Auto Shop', category: 'Auto Repair', leadScore: 34, status: 'New', revenue: 1200, date: '2025-01-08', channel: 'Email' },
    { id: 'rpt-009', business: 'Zen Wellness Spa', category: 'Salon', leadScore: 69, status: 'Interested', revenue: 2600, date: '2025-01-07', channel: 'WhatsApp' },
    { id: 'rpt-010', business: 'The Burger Joint', category: 'Restaurant', leadScore: 56, status: 'Meeting', revenue: 3100, date: '2025-01-06', channel: 'Call' },
    { id: 'rpt-011', business: 'Iron Works Fitness', category: 'Gym', leadScore: 48, status: 'Contacted', revenue: 1900, date: '2025-01-05', channel: 'Email' },
    { id: 'rpt-012', business: 'Family Dental Care', category: 'Dental', leadScore: 85, status: 'Won', revenue: 4600, date: '2025-01-04', channel: 'Call' },
  ]

  if (range === '7D') return entries.slice(0, 7)
  if (range === '30D') return entries
  return [...entries, ...entries.map(e => ({ ...e, id: e.id + '-b', date: '2024-12-' + e.date.split('-')[2] }))]
}

// ─── KPI Data by Range ─────────────────────────────────────────────────────────

function getKPIData(range: DateRange) {
  const data: Record<DateRange, { totalLeads: number; conversionRate: number; revenueGenerated: number; outreachSent: number; leadsTrend: number; conversionTrend: number; revenueTrend: number; outreachTrend: number }> = {
    '7D': { totalLeads: 121, conversionRate: 18.2, revenueGenerated: 18400, outreachSent: 543, leadsTrend: 12.4, conversionTrend: 3.1, revenueTrend: 8.7, outreachTrend: -2.3 },
    '30D': { totalLeads: 486, conversionRate: 21.5, revenueGenerated: 72600, outreachSent: 2180, leadsTrend: 15.8, conversionTrend: 5.4, revenueTrend: 22.3, outreachTrend: 8.1 },
    '90D': { totalLeads: 1423, conversionRate: 19.8, revenueGenerated: 198400, outreachSent: 6450, leadsTrend: 24.2, conversionTrend: 2.8, revenueTrend: 31.5, outreachTrend: 18.6 },
    'All': { totalLeads: 5680, conversionRate: 20.4, revenueGenerated: 742000, outreachSent: 24800, leadsTrend: 32.1, conversionTrend: 7.2, revenueTrend: 45.8, outreachTrend: 28.4 },
  }
  return data[range]
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

// ─── Main Component ────────────────────────────────────────────────────────────

export function ReportsView() {
  const { user } = useAppStore()
  const [dateRange, setDateRange] = useState<DateRange>('30D')

  const kpi = useMemo(() => getKPIData(dateRange), [dateRange])
  const leadTrend = useMemo(() => generateLeadTrendData(dateRange), [dateRange])
  const outreachData = useMemo(() => generateOutreachData(dateRange), [dateRange])
  const revenueByCategory = useMemo(() => generateRevenueByCategory(), [])
  const leadScoreDist = useMemo(() => generateLeadScoreDistribution(), [])
  const reportEntries = useMemo(() => generateReportEntries(dateRange), [dateRange])

  // ── Chart Configs ──────────────────────────────────────────────────────

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
  const outreachFlatData = outreachData.map(d => ({
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
                onClick={() => setDateRange(range)}
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
                  <p className="text-4xl font-bold tracking-tight">{kpi.totalLeads.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.leadsTrend >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.leadsTrend}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi.leadsTrend)}%
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
                  <p className="text-4xl font-bold tracking-tight">{kpi.conversionRate}%</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.conversionTrend >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.conversionTrend}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi.conversionTrend)}%
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
                  <p className="text-4xl font-bold tracking-tight">{formatCurrency(kpi.revenueGenerated)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.revenueTrend >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.revenueTrend}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi.revenueTrend)}%
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
                  <p className="text-4xl font-bold tracking-tight">{kpi.outreachSent.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.outreachTrend >= 0 ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.outreachTrend}%
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(kpi.outreachTrend)}%
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
                          <Badge variant="secondary" className={`text-xs ${STATUS_BADGE_STYLES[entry.status] || 'bg-slate-100 text-slate-700'}`}>
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
                    {Math.round(reportEntries.reduce((sum, e) => sum + e.leadScore, 0) / reportEntries.length)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
