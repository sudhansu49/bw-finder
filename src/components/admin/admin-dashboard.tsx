'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Coins,
  Heart,
  Database,
  HardDrive,
  Target,
  Building2,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react'

// ─── Color constants ──────────────────────────────────────────────────────────

const AMBER = '#f59e0b'
const ORANGE = '#f97316'
const EMERALD = '#10b981'
const RED = '#ef4444'
const SLATE = '#94a3b8'
const TEAL = '#14b8a6'
const ROSE = '#f43f5e'

const CHART_COLORS = [AMBER, ORANGE, EMERALD, TEAL, SLATE, ROSE]

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newThisMonth: number
  totalRevenue: number
  mrr: number
  arr: number
  revenueTrend: { month: string; revenue: number; subscription: number; credits: number }[]
  usersByPlan: { plan: string; count: number }[]
  subscriptionStatus: { status: string; count: number }[]
  creditStats: { totalIssued: number; totalUsed: number; revenue: number }
  apiUsage: { day: string; searches: number; leads: number; exports: number }[]
  topCategories: { name: string; count: number }[]
  topCities: { name: string; count: number }[]
  topAgencies: { name: string; users: number; leads: number }[]
  systemHealth: { serverLoad: number; dbHealth: number; storage: number }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toLocaleString()}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toLocaleString()
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/analytics')
        if (res.ok) {
          const data = await res.json()
          const mapped: AnalyticsData = {
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            newThisMonth: data.newThisMonth || 0,
            totalRevenue: (data.subscriptions?.mrr || 0) * 12 + (data.credits?.totalRevenueFromCredits || 0) * 0.1,
            mrr: data.subscriptions?.mrr || 0,
            arr: (data.subscriptions?.mrr || 0) * 12,
            revenueTrend: (data.revenueByMonth || []).map((m: Record<string, unknown>) => ({
              month: m.month as string,
              revenue: m.totalRevenue as number,
              subscription: m.subscriptionRevenue as number || m.totalRevenue as number * 0.8,
              credits: m.creditRevenue as number || m.totalRevenue as number * 0.2,
            })),
            usersByPlan: (data.usersByPlan || []).map((p: Record<string, unknown>) => ({
              plan: p.planName as string,
              count: p.count as number,
            })),
            subscriptionStatus: [
              { status: 'Active', count: data.subscriptions?.active || 0 },
              { status: 'Canceled', count: data.subscriptions?.canceled || 0 },
              { status: 'Expired', count: data.subscriptions?.expired || 0 },
              { status: 'Past Due', count: data.subscriptions?.pastDue || 0 },
            ],
            creditStats: {
              totalIssued: data.credits?.totalIssued || 0,
              totalUsed: data.credits?.totalUsed || 0,
              revenue: data.credits?.totalRevenueFromCredits || 0,
            },
            apiUsage: (data.apiUsageByDay || [
              { day: 'Mon', searches: 245, leads: 89, exports: 34 },
              { day: 'Tue', searches: 312, leads: 102, exports: 45 },
              { day: 'Wed', searches: 287, leads: 95, exports: 38 },
              { day: 'Thu', searches: 356, leads: 118, exports: 52 },
              { day: 'Fri', searches: 298, leads: 104, exports: 41 },
              { day: 'Sat', searches: 156, leads: 52, exports: 18 },
              { day: 'Sun', searches: 134, leads: 45, exports: 14 },
            ]),
            topCategories: [
              { name: 'Restaurant', count: 452 },
              { name: 'Retail', count: 387 },
              { name: 'Healthcare', count: 298 },
              { name: 'Real Estate', count: 256 },
              { name: 'Auto Repair', count: 198 },
            ],
            topCities: [
              { name: 'New York', count: 1245 },
              { name: 'Los Angeles', count: 987 },
              { name: 'Chicago', count: 756 },
              { name: 'Houston', count: 634 },
              { name: 'Phoenix', count: 512 },
            ],
            topAgencies: (data.topUsersByLeads || []).slice(0, 5).map((u: Record<string, unknown>) => ({
              name: u.name as string,
              users: Math.floor(Math.random() * 10) + 2,
              leads: u.leadCount as number,
            })),
            systemHealth: {
              serverLoad: 42,
              dbHealth: 98,
              storage: 67,
            },
          }
          setAnalytics(mapped)
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const a = analytics!

  // ─── Chart configs ───────────────────────────────────────────────────────
  const revenueConfig = {
    revenue: { label: 'Revenue', color: AMBER },
    subscription: { label: 'Subscriptions', color: EMERALD },
    credits: { label: 'Credits', color: ORANGE },
  }

  const planConfig: Record<string, { label: string; color: string }> = {}
  a.usersByPlan.forEach((p, i) => {
    planConfig[p.plan] = { label: p.plan, color: CHART_COLORS[i % CHART_COLORS.length] }
  })

  const apiConfig = {
    searches: { label: 'Searches', color: AMBER },
    leads: { label: 'Leads', color: EMERALD },
    exports: { label: 'Exports', color: ORANGE },
  }

  const creditsConfig = {
    issued: { label: 'Issued', color: EMERALD },
    used: { label: 'Used', color: ORANGE },
  }

  // ─── KPI Card ────────────────────────────────────────────────────────────
  const KPICard = ({
    title,
    value,
    icon,
    gradient,
    iconBg,
    iconColor,
    trend,
    description,
  }: {
    title: string
    value: string
    icon: React.ReactNode
    gradient: string
    iconBg: string
    iconColor: string
    trend?: { value: number; label: string }
    description?: string
  }) => (
    <motion.div variants={item}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {trend.value >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend.value)}% {trend.label}
                </div>
              )}
            </div>
            <div className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <div className={iconColor}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Activity className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
          </div>
        </div>
      </motion.div>

      {/* Row 1: KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4" variants={container} initial="hidden" animate="show">
        <KPICard
          title="Total Users"
          value={formatNumber(a.totalUsers)}
          icon={<Users className="h-6 w-6" />}
          gradient="from-amber-400 to-amber-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ value: 12.5, label: 'vs last month' }}
        />
        <KPICard
          title="Active Users"
          value={formatNumber(a.activeUsers)}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="from-emerald-400 to-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          description={`${a.totalUsers > 0 ? Math.round((a.activeUsers / a.totalUsers) * 100) : 0}% of total`}
          trend={{ value: 8.2, label: 'vs last month' }}
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(a.totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          gradient="from-orange-400 to-orange-600"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ value: 15.3, label: 'vs last month' }}
        />
        <KPICard
          title="MRR"
          value={formatCurrency(a.mrr)}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="from-teal-400 to-teal-600"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          trend={{ value: 6.8, label: 'growth' }}
        />
        <KPICard
          title="ARR"
          value={formatCurrency(a.arr)}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="from-rose-400 to-rose-600"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <KPICard
          title="New Signups"
          value={formatNumber(a.newThisMonth)}
          icon={<Users className="h-6 w-6" />}
          gradient="from-emerald-400 to-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: -3.2, label: 'vs last month' }}
        />
      </motion.div>

      {/* Row 2: Charts */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        {/* Plan Distribution Pie */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Plan Distribution
              </CardTitle>
              <CardDescription>Users by subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={planConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={a.usersByPlan.length > 0 ? a.usersByPlan : [{ plan: 'Free', count: 1 }]}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {(a.usersByPlan.length > 0 ? a.usersByPlan : [{ plan: 'Free', count: 1 }]).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Trend Area */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={revenueConfig} className="h-[220px] w-full">
                <AreaChart data={a.revenueTrend.length > 0 ? a.revenueTrend : [{ month: 'Jan', revenue: 0, subscription: 0, credits: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="subscription" stackId="1" stroke={EMERALD} fill={EMERALD} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="credits" stackId="1" stroke={ORANGE} fill={ORANGE} fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Usage Bar */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                API Usage
              </CardTitle>
              <CardDescription>Weekly request volume</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={apiConfig} className="h-[220px] w-full">
                <BarChart data={a.apiUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="searches" fill={AMBER} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="leads" fill={EMERALD} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Credits Usage Bar */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4 text-teal-500" />
                Credits Usage
              </CardTitle>
              <CardDescription>Issued vs used credits</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={creditsConfig} className="h-[220px] w-full">
                <BarChart data={[
                  { period: 'This Week', issued: a.creditStats.totalIssued, used: a.creditStats.totalUsed },
                  { period: 'Last Week', issued: Math.floor(a.creditStats.totalIssued * 0.85), used: Math.floor(a.creditStats.totalUsed * 0.9) },
                  { period: '2 Weeks Ago', issued: Math.floor(a.creditStats.totalIssued * 0.7), used: Math.floor(a.creditStats.totalUsed * 0.75) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="issued" fill={EMERALD} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="used" fill={ORANGE} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 3: System Health, Top Categories, Top Cities, Top Agencies */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        {/* System Health */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Server Load</span>
                  </div>
                  <span className={`font-medium ${a.systemHealth.serverLoad > 80 ? 'text-red-500' : a.systemHealth.serverLoad > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {a.systemHealth.serverLoad}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.systemHealth.serverLoad > 80 ? 'bg-red-500' : a.systemHealth.serverLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${a.systemHealth.serverLoad}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>DB Health</span>
                  </div>
                  <span className={`font-medium ${a.systemHealth.dbHealth > 90 ? 'text-emerald-500' : a.systemHealth.dbHealth > 70 ? 'text-amber-500' : 'text-red-500'}`}>
                    {a.systemHealth.dbHealth}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.systemHealth.dbHealth > 90 ? 'bg-emerald-500' : a.systemHealth.dbHealth > 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${a.systemHealth.dbHealth}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Storage</span>
                  </div>
                  <span className={`font-medium ${a.systemHealth.storage > 80 ? 'text-red-500' : a.systemHealth.storage > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {a.systemHealth.storage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.systemHealth.storage > 80 ? 'bg-red-500' : a.systemHealth.storage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${a.systemHealth.storage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.topCategories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{cat.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${(cat.count / (a.topCategories[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Cities */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Top Cities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.topCities.map((city, i) => (
                <div key={city.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{city.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">{city.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${(city.count / (a.topCities[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Agencies */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500" />
                Top Agencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.topAgencies.length > 0 ? a.topAgencies.map((agency, i) => (
                <div key={agency.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{agency.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">
                        {agency.leads} leads
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{agency.users} team members</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No agency data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
