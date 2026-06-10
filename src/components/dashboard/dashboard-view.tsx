'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
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
} from 'lucide-react'

interface DashboardStats {
  totalBusinesses: number
  withoutWebsite: number
  activeLeads: number
  wonDealsValue: number
  leadsByStatus: { status: string; count: number }[]
  businessesByCategory: { category: string; count: number }[]
  businessesByCountry: { country: string; count: number }[]
  recentLeads: {
    id: string
    business: { name: string; category: string; city?: string; country?: string }
    status: string
    estimatedValue: number
    priority: string
  }[]
  searchStats: {
    totalSearches: number
    completedSearches: number
  }
  scoringStats: {
    avgLeadScore: number
    avgOpportunityScore: number
    totalEstimatedRevenue: number
    scoredCount: number
  }
  topScoringBusinesses: {
    id: string
    name: string
    category: string
    city: string | null
    leadScore: number | null
    opportunityScore: number | null
    estimatedMonthlyRevenue: number | null
  }[]
  websiteStatusBreakdown: { status: string; count: number }[]
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
}

const statusColors: Record<string, string> = {
  New: '#94a3b8',
  Contacted: '#f59e0b',
  Qualified: '#10b981',
  Proposal: '#f97316',
  Negotiation: '#a855f7',
  Won: '#22c55e',
  Lost: '#ef4444',
}

const categoryColors = [
  '#f59e0b', '#f97316', '#ef4444', '#10b981', '#a855f7',
  '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#14b8a6',
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardView() {
  const { user, setCurrentView } = useAppStore()
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
          setStats({
            totalBusinesses: 0,
            withoutWebsite: 0,
            activeLeads: 0,
            wonDealsValue: 0,
            leadsByStatus: [],
            businessesByCategory: [],
            businessesByCountry: [],
            recentLeads: [],
            searchStats: { totalSearches: 0, completedSearches: 0 },
            scoringStats: { avgLeadScore: 0, avgOpportunityScore: 0, totalEstimatedRevenue: 0, scoredCount: 0 },
            topScoringBusinesses: [],
            websiteStatusBreakdown: [],
            auditStats: { auditedCount: 0, avgAuditScore: 0, totalOpportunityValue: 0, criticalIssues: 0, warningIssues: 0, opportunities: 0 },
            topAuditOpportunities: [],
          })
        }
      } catch {
        setStats({
          totalBusinesses: 0,
          withoutWebsite: 0,
          activeLeads: 0,
          wonDealsValue: 0,
          leadsByStatus: [],
          businessesByCategory: [],
          businessesByCountry: [],
          recentLeads: [],
          searchStats: { totalSearches: 0, completedSearches: 0 },
          scoringStats: { avgLeadScore: 0, avgOpportunityScore: 0, totalEstimatedRevenue: 0, scoredCount: 0 },
          topScoringBusinesses: [],
          websiteStatusBreakdown: [],
          auditStats: { auditedCount: 0, avgAuditScore: 0, totalOpportunityValue: 0, criticalIssues: 0, warningIssues: 0, opportunities: 0 },
          topAuditOpportunities: [],
        })
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

  const statCards = [
    { title: 'Total Businesses Found', value: stats.totalBusinesses, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50' },
    { title: 'No Website', value: stats.withoutWebsite, icon: Unplug, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Active Leads', value: stats.activeLeads, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Won Deals Value', value: `$${stats.wonDealsValue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  const scoringCards = [
    { title: 'Avg Lead Score', value: stats.scoringStats?.avgLeadScore || 0, icon: Target, color: (stats.scoringStats?.avgLeadScore || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600', bg: (stats.scoringStats?.avgLeadScore || 0) >= 70 ? 'bg-emerald-50' : 'bg-amber-50', suffix: '/100' },
    { title: 'Avg Opportunity', value: stats.scoringStats?.avgOpportunityScore || 0, icon: TrendingUp, color: (stats.scoringStats?.avgOpportunityScore || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600', bg: (stats.scoringStats?.avgOpportunityScore || 0) >= 70 ? 'bg-emerald-50' : 'bg-amber-50', suffix: '/100' },
    { title: 'Total Est. Revenue', value: `$${((stats.scoringStats?.totalEstimatedRevenue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50', suffix: '/mo' },
  ]

  const barChartConfig = stats.leadsByStatus.reduce((acc, s) => {
    acc[s.status] = { label: s.status, color: statusColors[s.status] || '#94a3b8' }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const pieChartConfig = stats.businessesByCategory.reduce((acc, c, i) => {
    acc[c.category] = { label: c.category, color: categoryColors[i % categoryColors.length] }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const countryChartConfig = stats.businessesByCountry.reduce((acc, c, i) => {
    acc[c.country] = { label: c.country, color: categoryColors[i % categoryColors.length] }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
      </div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Scoring Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          AI Lead Scoring
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {scoringCards.map((stat) => (
            <motion.div key={stat.title} variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Top Scoring Leads */}
      {stats.topScoringBusinesses && stats.topScoringBusinesses.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Top Scoring Leads (No Website)
            </CardTitle>
            <CardDescription>Your best opportunities ranked by AI lead score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Lead Score</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Opportunity</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Est. Revenue/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topScoringBusinesses.map((biz) => (
                    <tr key={biz.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3">
                        <p className="text-sm font-medium">{biz.name}</p>
                        <p className="text-xs text-muted-foreground">{biz.city || ''}</p>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                      </td>
                      <td className="py-3">
                        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${biz.leadScore && biz.leadScore >= 70 ? 'bg-emerald-50' : biz.leadScore && biz.leadScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <span className={`text-xs font-bold ${biz.leadScore && biz.leadScore >= 70 ? 'text-emerald-600' : biz.leadScore && biz.leadScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {biz.leadScore || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${biz.opportunityScore && biz.opportunityScore >= 70 ? 'bg-emerald-50' : biz.opportunityScore && biz.opportunityScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <span className={`text-xs font-bold ${biz.opportunityScore && biz.opportunityScore >= 70 ? 'text-emerald-600' : biz.opportunityScore && biz.opportunityScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {biz.opportunityScore || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-medium text-right">
                        {biz.estimatedMonthlyRevenue ? `$${biz.estimatedMonthlyRevenue.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Business Audit Overview */}
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
                        ${stats.auditStats.totalOpportunityValue >= 1000
                          ? `${(stats.auditStats.totalOpportunityValue / 1000).toFixed(0)}k`
                          : stats.auditStats.totalOpportunityValue}
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

      {/* Top Audit Opportunities */}
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
                  {stats.topAuditOpportunities.map((biz) => (
                    <tr key={biz.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3">
                        <p className="text-sm font-medium">{biz.name}</p>
                        <p className="text-xs text-muted-foreground">{biz.city || ''}</p>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                      </td>
                      <td className="py-3">
                        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                          biz.auditScore && biz.auditScore >= 80 ? 'bg-emerald-50' :
                          biz.auditScore && biz.auditScore >= 60 ? 'bg-amber-50' :
                          biz.auditScore && biz.auditScore >= 40 ? 'bg-orange-50' :
                          'bg-red-50'
                        }`}>
                          <span className={`text-xs font-bold ${
                            biz.auditScore && biz.auditScore >= 80 ? 'text-emerald-600' :
                            biz.auditScore && biz.auditScore >= 60 ? 'text-amber-600' :
                            biz.auditScore && biz.auditScore >= 40 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {biz.auditScore || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${biz.leadScore && biz.leadScore >= 70 ? 'bg-emerald-50' : biz.leadScore && biz.leadScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <span className={`text-xs font-bold ${biz.leadScore && biz.leadScore >= 70 ? 'text-emerald-600' : biz.leadScore && biz.leadScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {biz.leadScore || '-'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leads by Status</CardTitle>
            <CardDescription>Distribution of leads across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.leadsByStatus.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-[280px] w-full">
                <BarChart data={stats.leadsByStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
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
      </div>

      {/* Businesses by Country + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Businesses by Country */}
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
              <ChartContainer config={countryChartConfig} className="h-[200px] w-full">
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
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No country data yet. Discover businesses in different locations!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <CardDescription>Latest leads in your pipeline</CardDescription>
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
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
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
                          ${lead.estimatedValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No leads yet. Start discovering businesses!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Button
          onClick={() => setCurrentView('search')}
          className="h-20 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-3 text-base"
        >
          <Search className="h-5 w-5" />
          Discover Businesses
        </Button>
        <Button
          onClick={() => setCurrentView('audit')}
          variant="outline"
          className="h-20 border-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 flex items-center gap-3 text-base"
        >
          <ClipboardCheck className="h-5 w-5" />
          AI Audit
        </Button>
        <Button
          onClick={() => setCurrentView('leads')}
          variant="outline"
          className="h-20 border-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 flex items-center gap-3 text-base"
        >
          <UserPlus className="h-5 w-5" />
          Add Lead
        </Button>
        <Button
          onClick={() => setCurrentView('leads')}
          variant="outline"
          className="h-20 border-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 flex items-center gap-3 text-base"
        >
          <BarChart3 className="h-5 w-5" />
          View Pipeline
        </Button>
      </div>
    </div>
  )
}
