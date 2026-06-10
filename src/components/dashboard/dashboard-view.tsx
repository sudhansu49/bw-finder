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
  TrendingUp,
} from 'lucide-react'

interface DashboardStats {
  totalBusinesses: number
  withoutWebsite: number
  activeLeads: number
  wonDealsValue: number
  leadsByStatus: { status: string; count: number }[]
  businessesByCategory: { category: string; count: number }[]
  recentLeads: {
    id: string
    business: { name: string; category: string }
    status: string
    estimatedValue: number
    priority: string
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
          // Fallback demo data
          setStats({
            totalBusinesses: 156,
            withoutWebsite: 89,
            activeLeads: 34,
            wonDealsValue: 24500,
            leadsByStatus: [
              { status: 'New', count: 8 },
              { status: 'Contacted', count: 12 },
              { status: 'Qualified', count: 6 },
              { status: 'Proposal', count: 4 },
              { status: 'Negotiation', count: 3 },
              { status: 'Won', count: 5 },
              { status: 'Lost', count: 2 },
            ],
            businessesByCategory: [
              { category: 'Restaurant', count: 28 },
              { category: 'Salon', count: 18 },
              { category: 'Mechanic', count: 15 },
              { category: 'Plumber', count: 12 },
              { category: 'Dentist', count: 9 },
              { category: 'Gym', count: 7 },
            ],
            recentLeads: [
              { id: '1', business: { name: 'Mario\'s Pizza', category: 'Restaurant' }, status: 'Contacted', estimatedValue: 2500, priority: 'high' },
              { id: '2', business: { name: 'Style Studio', category: 'Salon' }, status: 'New', estimatedValue: 1800, priority: 'medium' },
              { id: '3', business: { name: 'Quick Fix Auto', category: 'Mechanic' }, status: 'Proposal', estimatedValue: 3200, priority: 'high' },
              { id: '4', business: { name: 'Bright Smile Dental', category: 'Dentist' }, status: 'Won', estimatedValue: 4500, priority: 'high' },
              { id: '5', business: { name: 'FitLife Gym', category: 'Gym' }, status: 'Qualified', estimatedValue: 2000, priority: 'low' },
            ],
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
          recentLeads: [],
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
    { title: 'Without Website', value: stats.withoutWebsite, icon: Unplug, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Active Leads', value: stats.activeLeads, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Won Deals Value', value: `$${stats.wonDealsValue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  const barChartConfig = stats.leadsByStatus.reduce((acc, s) => {
    acc[s.status] = { label: s.status, color: statusColors[s.status] || '#94a3b8' }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  const pieChartConfig = stats.businessesByCategory.reduce((acc, c, i) => {
    acc[c.category] = { label: c.category, color: categoryColors[i % categoryColors.length] }
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leads by Status</CardTitle>
            <CardDescription>Distribution of leads across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[280px] w-full">
              <BarChart data={stats.leadsByStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.leadsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Businesses by Category</CardTitle>
            <CardDescription>Top business categories discovered</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[index % categoryColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Leads</CardTitle>
          <CardDescription>Latest leads in your pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Business</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-3 text-sm font-medium">{lead.business.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{lead.business.category}</td>
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          onClick={() => setCurrentView('search')}
          className="h-20 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-3 text-base"
        >
          <Search className="h-5 w-5" />
          Search Businesses
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
