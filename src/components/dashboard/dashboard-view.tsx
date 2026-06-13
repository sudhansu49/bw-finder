'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type UserView } from '@/store/app-store'
import { useTranslation, useCurrency } from '@/lib/i18n/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart, CartesianGrid, Line, LineChart } from 'recharts'
import { motion } from 'framer-motion'
import {
  Building2,
  Unplug,
  Users,
  DollarSign,
  Search,
  UserPlus,
  BarChart3,
  Globe,
  Target,
  TrendingUp,
  ClipboardCheck,
  AlertTriangle,
  Sparkles,
  Shield,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  ChevronRight,
  Calculator,
  MessageSquare,
  Mail,
} from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  totalBusinesses: number
  noWebsiteBusinesses: number
  noWebsiteLeads: number
  highOpportunityLeads: number
  mediumOpportunityLeads: number
  lowOpportunityLeads: number
  activeLeads: number
  wonLeadsCount: number
  lostLeadsCount: number
  wonDealsValue: number
  pipelineValue: number
  totalLeadsValue: number
  totalEstimatedRevenue: number
  revenueByMonth: { month: string; revenue: number; deals: number }[]
  conversionRate: number
  avgDealCycle: number
  funnelData: { stage: string; count: number }[]
  stageConversions: { from: string; to: string; rate: number }[]
  leadsByStatus: { status: string; rawStatus: string; count: number }[]
  businessesByCategory: { category: string; count: number }[]
  businessesByCountry: { country: string; count: number }[]
  websiteStatusBreakdown: { status: string; count: number }[]
  recentLeads: {
    id: string
    business: { name: string; category: string; city?: string; country?: string }
    status: string
    estimatedValue: number
    priority: string
  }[]
  topOpportunityLeads: {
    id: string
    status: string
    estimatedValue: number
    business: {
      id: string
      name: string
      category: string
      city: string | null
      hasWebsite: boolean
      leadScore: number | null
      opportunityScore: number | null
      estimatedMonthlyRevenue: number | null
    }
  }[]
  scoringStats: {
    avgLeadScore: number
    avgOpportunityScore: number
    totalEstimatedRevenue: number
    scoredCount: number
  }
  auditStats: {
    auditedCount: number
    avgAuditScore: number
    totalOpportunityValue: number
    criticalIssues: number
    warningIssues: number
    opportunities: number
  }
  topAuditOpportunities: {
    id: string
    name: string
    category: string
    city: string | null
    auditScore: number | null
    leadScore: number | null
  }[]
  searchStats: {
    totalSearches: number
    completedSearches: number
  }
}

const statusColors: Record<string, string> = {
  New: '#94a3b8',
  'New Lead': '#94a3b8',
  Contacted: '#f59e0b',
  Interested: '#3b82f6',
  Qualified: '#10b981',
  Meeting: '#8b5cf6',
  Proposal: '#f97316',
  'Proposal Sent': '#ec4899',
  Negotiation: '#a855f7',
  Won: '#22c55e',
  Lost: '#ef4444',
}

const categoryColors = [
  '#f59e0b', '#f97316', '#ef4444', '#10b981', '#a855f7',
  '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#14b8a6',
]

const funnelColors = [
  '#94a3b8', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e',
]

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

function getScoreColor(score: number | null | undefined): { bg: string; text: string } {
  if (score === null || score === undefined) return { bg: 'bg-slate-100', text: 'text-slate-400' }
  if (score >= 70) return { bg: 'bg-emerald-50', text: 'text-emerald-600' }
  if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-600' }
  return { bg: 'bg-red-50', text: 'text-red-500' }
}

export function DashboardView() {
  const { user, setCurrentView } = useAppStore()
  const { t } = useTranslation()
  const { format: formatCurr, formatCompact: formatCompactCurr, formatNumber: formatNum, symbol } = useCurrency()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = user?.id || 'demo'
        const res = await fetch(`/api/analytics?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          setStats(getEmptyStats())
        }
      } catch {
        setStats(getEmptyStats())
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!stats) return null

  const noWebsitePct = stats.totalBusinesses > 0
    ? Math.round((stats.noWebsiteBusinesses / stats.totalBusinesses) * 100)
    : 0

  const highOppPct = stats.totalLeads > 0
    ? Math.round((stats.highOpportunityLeads / stats.totalLeads) * 100)
    : 0

  const maxFunnelCount = Math.max(...stats.funnelData.map(f => f.count), 1)

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  }

  const revenueChartConfig = stats.revenueByMonth.reduce((acc, m) => {
    acc[m.month] = { label: m.month, color: '#f59e0b' }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const barChartConfig = stats.leadsByStatus.reduce((acc, s) => {
    acc[s.status] = { label: s.status, color: statusColors[s.status] || '#94a3b8' }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const pieChartConfig = stats.businessesByCategory.reduce((acc, c, i) => {
    acc[c.category] = { label: c.category, color: categoryColors[i % categoryColors.length] }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {user?.name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentView('user-lead-finder')} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Search className="h-4 w-4 mr-2" /> Discover
          </Button>
          <Button onClick={() => setCurrentView('user-crm')} variant="outline">
            <Activity className="h-4 w-4 mr-2" /> Pipeline
          </Button>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Find Leads', icon: Search, view: 'user-lead-finder' as UserView, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
          { label: 'Pipeline', icon: Activity, view: 'user-crm' as UserView, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
          { label: 'AI Audit', icon: ClipboardCheck, view: 'user-audit' as UserView, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' },
          { label: 'Proposal', icon: FileText, view: 'user-proposal' as UserView, color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' },
          { label: 'WhatsApp', icon: MessageSquare, view: 'user-whatsapp' as UserView, color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30' },
          { label: 'Email', icon: Mail, view: 'user-email' as UserView, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentView(action.view)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.color} hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Section 1: KPI Hero Cards ──────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Total Leads */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalLeads')}</p>
                  <p className="text-4xl font-bold tracking-tight">{stats.totalLeads}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-emerald-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" />
                      {stats.wonLeadsCount} {t('dashboard.wonDeals').toLowerCase()}
                    </span>
                    <span className="text-muted-foreground mx-1">·</span>
                    <span className="text-amber-600">{stats.activeLeads} active</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* No Website Leads */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.noWebsiteBusinesses')}</p>
                  <p className="text-4xl font-bold tracking-tight">{stats.noWebsiteBusinesses}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-red-600 font-semibold">{noWebsitePct}%</span>
                    <span className="text-muted-foreground">of businesses</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Unplug className="h-7 w-7 text-red-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={noWebsitePct} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Opportunity Leads */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">High Opportunity</p>
                  <p className="text-4xl font-bold tracking-tight">{stats.highOpportunityLeads}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Zap className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">{highOppPct}%</span>
                    <span className="text-muted-foreground">of leads scored 70+</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Potential */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.pipelineValue')}</p>
                  <p className="text-4xl font-bold tracking-tight">{formatCompactCurr(stats.pipelineValue)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <DollarSign className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-600 font-semibold">{formatCompactCurr(stats.wonDealsValue)} {t('dashboard.wonDeals').toLowerCase()}</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Section 5: Conversion Metrics ──────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-amber-500" />
          Conversion Metrics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Funnel */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sales Funnel</CardTitle>
              <CardDescription>Leads flowing through your pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.funnelData.length > 0 && stats.funnelData.some(f => f.count > 0) ? (
                <div className="space-y-2">
                  {stats.funnelData.map((stage, index) => {
                    const widthPct = maxFunnelCount > 0 ? Math.max((stage.count / maxFunnelCount) * 100, 8) : 8
                    const conversionFromPrev = index > 0 && stats.funnelData[index - 1].count > 0
                      ? Math.round((stage.count / stats.funnelData[index - 1].count) * 100)
                      : null
                    return (
                      <motion.div
                        key={stage.stage}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-28 text-right">
                          <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-9 relative overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full flex items-center justify-end pr-3"
                              style={{ backgroundColor: funnelColors[index] }}
                            >
                              <span className="text-xs font-bold text-white drop-shadow-sm">{stage.count}</span>
                            </motion.div>
                          </div>
                          {conversionFromPrev !== null && (
                            <span className={`text-xs font-medium w-12 text-right ${
                              conversionFromPrev >= 50 ? 'text-emerald-600' :
                              conversionFromPrev >= 25 ? 'text-amber-600' :
                              'text-red-500'
                            }`}>
                              {conversionFromPrev}%
                            </span>
                          )}
                          {conversionFromPrev === null && <span className="w-12" />}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No leads in pipeline yet. Start discovering businesses!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Conversion Stats */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('dashboard.conversionRate')}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-4xl font-bold text-emerald-600">{stats.conversionRate}%</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.wonLeadsCount} won / {stats.totalLeads} total leads
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Deal Cycle</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-4xl font-bold text-amber-600">{stats.avgDealCycle}</p>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lost Rate</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-4xl font-bold text-red-500">
                        {stats.totalLeads > 0 ? Math.round((stats.lostLeadsCount / stats.totalLeads) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-red-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.lostLeadsCount} {t('dashboard.lostDeals').toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Stage-to-Stage Conversion ──────────────────────────────── */}
      {stats.stageConversions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Stage Conversion Rates
            </CardTitle>
            <CardDescription>How leads move from one stage to the next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.stageConversions.map((conv, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{conv.from}</div>
                    <div className="flex items-center justify-center gap-1">
                      <ArrowDownRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`text-2xl font-bold ${
                      conv.rate >= 50 ? 'text-emerald-600' :
                      conv.rate >= 25 ? 'text-amber-600' :
                      'text-red-500'
                    }`}>
                      {conv.rate}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">→ {conv.to}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Revenue Trend ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly won deal value over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.revenueByMonth.some(m => m.revenue > 0) ? (
              <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                <AreaChart data={stats.revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompactCurr(v)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fill="url(#revenueGradient)" />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet. Win your first deal!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leads by Status</CardTitle>
            <CardDescription>Distribution across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.leadsByStatus.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-[280px] w-full">
                <BarChart data={stats.leadsByStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No lead data yet. Start discovering businesses!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Opportunity Leads ──────────────────────────────────── */}
      {stats.topOpportunityLeads && stats.topOpportunityLeads.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  {t('dashboard.topOpportunities')}
                </CardTitle>
                <CardDescription>Highest-scoring leads ranked by AI opportunity score</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('leads')} className="text-amber-600">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Website</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Lead Score</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Opp. Score</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Est. Revenue/mo</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Deal Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topOpportunityLeads.map((lead) => {
                    const ls = getScoreColor(lead.business.leadScore)
                    const os = getScoreColor(lead.business.opportunityScore)
                    return (
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3">
                          <p className="text-sm font-medium">{lead.business.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.business.category}
                            {lead.business.city && ` · ${lead.business.city}`}
                          </p>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary" className={`text-xs ${lead.business.hasWebsite ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {lead.business.hasWebsite ? 'Has Site' : 'No Site'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${ls.bg}`}>
                            <span className={`text-xs font-bold ${ls.text}`}>{lead.business.leadScore !== null && lead.business.leadScore !== undefined ? lead.business.leadScore : '-'}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${os.bg}`}>
                            <span className={`text-xs font-bold ${os.text}`}>{lead.business.opportunityScore !== null && lead.business.opportunityScore !== undefined ? lead.business.opportunityScore : '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm font-medium text-right">
                          {lead.business.estimatedMonthlyRevenue ? formatCurr(lead.business.estimatedMonthlyRevenue) : '-'}
                        </td>
                        <td className="py-3 text-sm font-medium text-right">
                          {lead.estimatedValue ? formatCurr(lead.estimatedValue) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── AI Scoring Overview ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Lead Scoring
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Lead Score</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold mt-1">{stats.scoringStats?.avgLeadScore || 0}</p>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${(stats.scoringStats?.avgLeadScore || 0) >= 70 ? 'bg-emerald-50' : 'bg-amber-50'} flex items-center justify-center`}>
                    <Target className={`h-6 w-6 ${(stats.scoringStats?.avgLeadScore || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Opportunity</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold mt-1">{stats.scoringStats?.avgOpportunityScore || 0}</p>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${(stats.scoringStats?.avgOpportunityScore || 0) >= 70 ? 'bg-emerald-50' : 'bg-amber-50'} flex items-center justify-center`}>
                    <TrendingUp className={`h-6 w-6 ${(stats.scoringStats?.avgOpportunityScore || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Est. Revenue</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold mt-1">{formatCompactCurr(stats.scoringStats?.totalEstimatedRevenue || 0)}</p>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* ── AI Business Audit Overview ─────────────────────────────── */}
      {stats.auditStats && stats.auditStats.auditedCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-500" />
            AI Business Audit
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Audited</p>
                      <p className="text-3xl font-bold mt-1">{stats.auditStats.auditedCount}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ClipboardCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Audit Score</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold mt-1">{stats.auditStats.avgAuditScore}</p>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{stats.auditStats.criticalIssues}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Opp. Value</p>
                      <p className="text-3xl font-bold text-orange-600 mt-1">
                        {formatCompactCurr(stats.auditStats.totalOpportunityValue)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* ── Top Audit Opportunities ────────────────────────────────── */}
      {stats.topAuditOpportunities && stats.topAuditOpportunities.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Top Audit Opportunities
            </CardTitle>
            <CardDescription>Businesses with the most digital gaps — best opportunities for your services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Audit Score</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Lead Score</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAuditOpportunities.map((biz) => {
                    const as = getScoreColor(biz.auditScore)
                    const ls = getScoreColor(biz.leadScore)
                    return (
                      <tr key={biz.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-3">
                          <p className="text-sm font-medium">{biz.name}</p>
                          <p className="text-xs text-muted-foreground">{biz.city || ''}</p>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                        </td>
                        <td className="py-3">
                          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${as.bg}`}>
                            <span className={`text-xs font-bold ${as.text}`}>{biz.auditScore !== null && biz.auditScore !== undefined ? biz.auditScore : '-'}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${ls.bg}`}>
                            <span className={`text-xs font-bold ${ls.text}`}>{biz.leadScore !== null && biz.leadScore !== undefined ? biz.leadScore : '-'}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Businesses by Category + Country ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Businesses by Category</CardTitle>
            <CardDescription>Top business categories discovered</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.businessesByCategory.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="h-[280px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={stats.businessesByCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {stats.businessesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No business data yet. Run a discovery search!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" />
              Businesses by Country
            </CardTitle>
            <CardDescription>Geographic distribution of discovered businesses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.businessesByCountry.length > 0 ? (
              <ChartContainer
                config={stats.businessesByCountry.reduce((acc, c, i) => {
                  acc[c.country] = { label: c.country, color: categoryColors[i % categoryColors.length] }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[280px] w-full"
              >
                <BarChart data={stats.businessesByCountry} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="country" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {stats.businessesByCountry.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No country data yet. Discover businesses in different locations!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Leads ───────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
              <CardDescription>Latest leads in your pipeline</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('leads')} className="text-amber-600">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">{lead.business.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.business.category}
                            {lead.business.city && ` · ${lead.business.city}`}
                            {lead.business.country && `, ${lead.business.country}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: statusColors[lead.status] + '20',
                            color: statusColors[lead.status],
                          }}
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[lead.priority] || ''}`}>
                          {lead.priority}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm font-medium text-right">
                        {formatCurr(lead.estimatedValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
              No leads yet. Start discovering businesses!
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Button
          onClick={() => setCurrentView('search')}
          className="h-16 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 text-sm"
        >
          <Search className="h-4 w-4" />
          Discover
        </Button>
        <Button
          onClick={() => setCurrentView('audit')}
          variant="outline"
          className="h-16 border-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 flex items-center gap-2 text-sm"
        >
          <ClipboardCheck className="h-4 w-4" />
          AI Audit
        </Button>
        <Button
          onClick={() => setCurrentView('proposal')}
          variant="outline"
          className="h-16 border-2 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 flex items-center gap-2 text-sm"
        >
          <FileText className="h-4 w-4" />
          Proposals
        </Button>
        <Button
          onClick={() => setCurrentView('crm')}
          variant="outline"
          className="h-16 border-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 flex items-center gap-2 text-sm"
        >
          <Activity className="h-4 w-4" />
          Pipeline
        </Button>
        <Button
          onClick={() => setCurrentView('leads')}
          variant="outline"
          className="h-16 border-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 flex items-center gap-2 text-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  )
}

function getEmptyStats(): DashboardStats {
  return {
    totalLeads: 0,
    totalBusinesses: 0,
    noWebsiteBusinesses: 0,
    noWebsiteLeads: 0,
    highOpportunityLeads: 0,
    mediumOpportunityLeads: 0,
    lowOpportunityLeads: 0,
    activeLeads: 0,
    wonLeadsCount: 0,
    lostLeadsCount: 0,
    wonDealsValue: 0,
    pipelineValue: 0,
    totalLeadsValue: 0,
    totalEstimatedRevenue: 0,
    revenueByMonth: [],
    conversionRate: 0,
    avgDealCycle: 0,
    funnelData: [
      { stage: 'New Lead', count: 0 },
      { stage: 'Contacted', count: 0 },
      { stage: 'Interested', count: 0 },
      { stage: 'Meeting', count: 0 },
      { stage: 'Proposal', count: 0 },
      { stage: 'Won', count: 0 },
    ],
    stageConversions: [],
    leadsByStatus: [],
    businessesByCategory: [],
    businessesByCountry: [],
    websiteStatusBreakdown: [],
    recentLeads: [],
    topOpportunityLeads: [],
    scoringStats: { avgLeadScore: 0, avgOpportunityScore: 0, totalEstimatedRevenue: 0, scoredCount: 0 },
    auditStats: { auditedCount: 0, avgAuditScore: 0, totalOpportunityValue: 0, criticalIssues: 0, warningIssues: 0, opportunities: 0 },
    topAuditOpportunities: [],
    searchStats: { totalSearches: 0, completedSearches: 0 },
  }
}
