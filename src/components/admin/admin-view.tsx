'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart, CartesianGrid } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CreditCard,
  Coins,
  BarChart3,
  Search,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Target,
  Globe,
  FileText,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  plan: string
  credits: number
  status: 'active' | 'suspended' | 'banned'
  leads: number
  joined: string
}

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

interface CreditTransaction {
  id: string
  userId: string
  userName: string
  amount: number
  type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'plan_credits'
  description: string
  date: string
}

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  mrr: number
  totalRevenue: number
  revenueTrend: { month: string; revenue: number }[]
  usersByPlan: { plan: string; count: number }[]
  subscriptionStatus: { status: string; count: number }[]
  topUsersByLeads: { name: string; leads: number; plan: string }[]
  topUsersByCredits: { name: string; credits: number; plan: string }[]
  platformStats: { totalLeads: number; totalSearches: number; totalExports: number }
}

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

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// ─── Color constants ──────────────────────────────────────────────────────────

const AMBER = '#f59e0b'
const ORANGE = '#f97316'
const EMERALD = '#10b981'
const RED = '#ef4444'
const SLATE = '#94a3b8'
const ROSE = '#f43f5e'
const TEAL = '#14b8a6'

const PLAN_COLORS: Record<string, string> = {
  free: SLATE,
  starter: AMBER,
  pro: ORANGE,
  enterprise: EMERALD,
}

const SUB_STATUS_COLORS: Record<string, string> = {
  active: EMERALD,
  canceled: RED,
  expired: SLATE,
  past_due: ROSE,
}

const CREDIT_TYPE_COLORS: Record<string, string> = {
  purchase: AMBER,
  usage: ORANGE,
  bonus: EMERALD,
  refund: TEAL,
  plan_credits: '#8b5cf6',
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'suspended':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'banned':
      return 'bg-red-50 text-red-700 border-red-200'
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
  switch (plan) {
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

export function AdminView() {
  // Tab state
  const [activeTab, setActiveTab] = useState('users')

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [subsLoading, setSubsLoading] = useState(true)
  const [subStatusFilter, setSubStatusFilter] = useState('all')

  // Credits state
  const [credits, setCredits] = useState<CreditTransaction[]>([])
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [creditTypeFilter, setCreditTypeFilter] = useState('all')
  const [addCreditsOpen, setAddCreditsOpen] = useState(false)
  const [addCreditsUserId, setAddCreditsUserId] = useState('')
  const [addCreditsAmount, setAddCreditsAmount] = useState('')
  const [addCreditsType, setAddCreditsType] = useState<'bonus' | 'purchase' | 'refund'>('bonus')
  const [addCreditsDesc, setAddCreditsDesc] = useState('')
  const [addCreditsSubmitting, setAddCreditsSubmitting] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // ─── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams()
      if (userSearch) params.set('search', userSearch)
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter)
      if (userStatusFilter !== 'all') params.set('status', userStatusFilter)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.users || []).map((u: Record<string, unknown>) => ({
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
          role: u.role as string,
          plan: (u.plan as Record<string, string>)?.name || (u.activeSubscription as Record<string, Record<string, string>>)?.plan?.name || 'Free',
          credits: u.credits as number,
          status: u.status as string,
          leads: (u as Record<string, number>).leadCount || 0,
          joined: u.createdAt as string,
        }))
        setUsers(mapped)
      }
    } catch {
      // Silently handle error
    } finally {
      setUsersLoading(false)
    }
  }, [userSearch, userRoleFilter, userStatusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ─── Fetch subscriptions ─────────────────────────────────────────────────
  const fetchSubs = useCallback(async () => {
    setSubsLoading(true)
    try {
      const params = new URLSearchParams()
      if (subStatusFilter !== 'all') params.set('status', subStatusFilter)
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.subscriptions || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          userId: s.userId as string,
          userName: (s.user as Record<string, string>)?.name || 'Unknown',
          userEmail: (s.user as Record<string, string>)?.email || '',
          plan: (s.plan as Record<string, unknown>)?.name as string || 'Free',
          status: s.status as string,
          periodStart: s.currentPeriodStart as string,
          periodEnd: s.currentPeriodEnd as string,
          cancelAtEnd: s.cancelAtPeriodEnd as boolean,
          amount: (s.plan as Record<string, number>)?.price || 0,
        }))
        setSubscriptions(mapped)
      }
    } catch {
      // Silently handle error
    } finally {
      setSubsLoading(false)
    }
  }, [subStatusFilter])

  useEffect(() => {
    fetchSubs()
  }, [fetchSubs])

  // ─── Fetch credits ───────────────────────────────────────────────────────
  const fetchCredits = useCallback(async () => {
    setCreditsLoading(true)
    try {
      const params = new URLSearchParams()
      if (creditTypeFilter !== 'all') params.set('type', creditTypeFilter)
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
      // Silently handle error
    } finally {
      setCreditsLoading(false)
    }
  }, [creditTypeFilter])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  // ─── Fetch analytics ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true)
      try {
        const res = await fetch('/api/admin/analytics')
        if (res.ok) {
          const data = await res.json()
          // Map the API response to the frontend AnalyticsData type
          const mapped: AnalyticsData = {
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            mrr: data.subscriptions?.mrr || 0,
            totalRevenue: (data.subscriptions?.mrr || 0) + (data.credits?.totalRevenueFromCredits || 0) * 0.1,
            revenueTrend: (data.revenueByMonth || []).map((m: Record<string, unknown>) => ({
              month: m.month as string,
              revenue: m.totalRevenue as number,
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
            topUsersByLeads: (data.topUsersByLeads || []).map((u: Record<string, unknown>) => ({
              name: u.name as string,
              leads: u.leadCount as number,
              plan: 'Pro',
            })),
            topUsersByCredits: (data.topUsersByCredits || []).map((u: Record<string, unknown>) => ({
              name: u.name as string,
              credits: u.creditsUsed as number,
              plan: 'Pro',
            })),
            platformStats: {
              totalLeads: data.platformUsage?.totalLeads || 0,
              totalSearches: data.platformUsage?.totalSearches || 0,
              totalExports: data.platformUsage?.totalExports || 0,
            },
          }
          setAnalytics(mapped)
        }
      } catch {
        // Silently handle error
      } finally {
        setAnalyticsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // ─── User actions ────────────────────────────────────────────────────────
  const updateUser = async (userId: string, updates: { role?: string; status?: string; credits?: number }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      })
      if (res.ok) {
        fetchUsers()
      }
    } catch {
      // Silently handle error
    }
  }

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
      // Silently handle error
    }
  }

  const handleAddCredits = async () => {
    if (!addCreditsUserId || !addCreditsAmount) return
    setAddCreditsSubmitting(true)
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: addCreditsUserId,
          amount: Number(addCreditsAmount),
          type: addCreditsType,
          description: addCreditsDesc || `Admin added ${addCreditsAmount} credits`,
        }),
      })
      if (res.ok) {
        setAddCreditsOpen(false)
        setAddCreditsUserId('')
        setAddCreditsAmount('')
        setAddCreditsDesc('')
        fetchCredits()
        fetchUsers()
      }
    } catch {
      // Silently handle error
    } finally {
      setAddCreditsSubmitting(false)
    }
  }

  // ─── Computed values ─────────────────────────────────────────────────────
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const adminUsers = users.filter((u) => u.role === 'admin').length
  const newThisMonth = users.filter((u) => {
    const d = new Date(u.joined)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const activeSubs = subscriptions.filter((s) => s.status === 'active').length
  const mrr = subscriptions.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)
  const canceledThisMonth = subscriptions.filter((s) => {
    if (s.status !== 'canceled') return false
    const d = new Date(s.periodEnd)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const churnRate = activeSubs > 0 ? ((canceledThisMonth / (activeSubs + canceledThisMonth)) * 100).toFixed(1) : '0'

  const totalCreditsIssued = credits.filter((c) => c.amount > 0).reduce((sum, c) => sum + c.amount, 0)
  const totalCreditsUsed = credits.filter((c) => c.amount < 0).reduce((sum, c) => sum + Math.abs(c.amount), 0)
  const creditsBalance = totalCreditsIssued - totalCreditsUsed
  const revenueFromCredits = credits
    .filter((c) => c.type === 'purchase')
    .reduce((sum, c) => sum + c.amount * 0.1, 0)

  // ─── Chart configs ───────────────────────────────────────────────────────
  const revenueChartConfig = {
    revenue: { label: 'Revenue', color: AMBER },
  }

  const usersByPlanConfig: Record<string, { label: string; color: string }> = {}
  ;(analytics?.usersByPlan || []).forEach((p, i) => {
    usersByPlanConfig[p.plan] = { label: p.plan, color: [AMBER, ORANGE, EMERALD, SLATE, TEAL][i % 5] }
  })

  const subStatusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: EMERALD },
    canceled: { label: 'Canceled', color: RED },
    expired: { label: 'Expired', color: SLATE },
    past_due: { label: 'Past Due', color: ROSE },
  }

  // ─── Render loading ──────────────────────────────────────────────────────
  const renderLoading = () => (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
    </div>
  )

  // ─── KPI Card helper ─────────────────────────────────────────────────────
  const renderKPICard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    gradient: string,
    iconBg: string,
    iconColor: string,
    subtitle?: string,
    trend?: { value: number; label: string }
  ) => (
    <motion.div variants={item}>
      <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
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

  // ─── Tab 1: Users ────────────────────────────────────────────────────────
  const renderUsersTab = () => (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKPICard('Total Users', totalUsers, <Users className="h-6 w-6" />, 'from-amber-400 to-amber-600', 'bg-amber-50', 'text-amber-600')}
        {renderKPICard('Active Users', activeUsers, <UserCheck className="h-6 w-6" />, 'from-emerald-400 to-emerald-600', 'bg-emerald-50', 'text-emerald-600', `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total`)}
        {renderKPICard('Admin Users', adminUsers, <Shield className="h-6 w-6" />, 'from-orange-400 to-orange-600', 'bg-orange-50', 'text-orange-600')}
        {renderKPICard('New This Month', newThisMonth, <UserPlus className="h-6 w-6" />, 'from-teal-400 to-teal-600', 'bg-teal-50', 'text-teal-600')}
      </div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchUsers} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users table */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              User Management
            </CardTitle>
            <CardDescription>{totalUsers} users found</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              renderLoading()
            ) : (
              <ScrollArea className="max-h-[520px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Plan</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Leads</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No users found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-amber-50 text-amber-700 text-xs font-bold">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={user.role === 'admin' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                              {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className={planBadgeClass(user.plan)}>
                              {user.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{user.credits}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadgeClass(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">{user.leads}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">{formatDate(user.joined)}</span>
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
                                <DropdownMenuItem onClick={() => updateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                </DropdownMenuItem>
                                {user.status === 'active' && (
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { status: 'suspended' })}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Suspend User
                                  </DropdownMenuItem>
                                )}
                                {(user.status === 'suspended' || user.status === 'banned') && (
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { status: 'active' })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                {user.status !== 'banned' && (
                                  <DropdownMenuItem variant="destructive" onClick={() => updateUser(user.id, { status: 'banned' })}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Ban User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAddCreditsUserId(user.id)
                                    setAddCreditsOpen(true)
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Credits
                                </DropdownMenuItem>
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
    </motion.div>
  )

  // ─── Tab 2: Subscriptions ────────────────────────────────────────────────
  const renderSubscriptionsTab = () => (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKPICard('Active Subscriptions', activeSubs, <CreditCard className="h-6 w-6" />, 'from-emerald-400 to-emerald-600', 'bg-emerald-50', 'text-emerald-600')}
        {renderKPICard('MRR', formatCurrency(mrr), <DollarSign className="h-6 w-6" />, 'from-amber-400 to-amber-600', 'bg-amber-50', 'text-amber-600')}
        {renderKPICard('Canceled This Month', canceledThisMonth, <UserX className="h-6 w-6" />, 'from-red-400 to-red-600', 'bg-red-50', 'text-red-600')}
        {renderKPICard('Churn Rate', `${churnRate}%`, <TrendingDown className="h-6 w-6" />, 'from-orange-400 to-orange-600', 'bg-orange-50', 'text-orange-600')}
      </div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
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
              <Button variant="outline" size="icon" onClick={fetchSubs} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscriptions table */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Subscriptions
            </CardTitle>
            <CardDescription>{subscriptions.length} subscriptions total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {subsLoading ? (
              renderLoading()
            ) : (
              <ScrollArea className="max-h-[520px]">
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
    </motion.div>
  )

  // ─── Tab 3: Credits ──────────────────────────────────────────────────────
  const renderCreditsTab = () => (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKPICard('Total Issued', totalCreditsIssued.toLocaleString(), <Coins className="h-6 w-6" />, 'from-amber-400 to-amber-600', 'bg-amber-50', 'text-amber-600')}
        {renderKPICard('Total Used', totalCreditsUsed.toLocaleString(), <Activity className="h-6 w-6" />, 'from-orange-400 to-orange-600', 'bg-orange-50', 'text-orange-600')}
        {renderKPICard('Balance', creditsBalance.toLocaleString(), <DollarSign className="h-6 w-6" />, 'from-emerald-400 to-emerald-600', 'bg-emerald-50', 'text-emerald-600')}
        {renderKPICard('Revenue from Credits', formatCurrency(revenueFromCredits), <TrendingUp className="h-6 w-6" />, 'from-teal-400 to-teal-600', 'bg-teal-50', 'text-teal-600')}
      </div>

      {/* Filters + Add Credits button */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Select value={creditTypeFilter} onValueChange={setCreditTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setAddCreditsUserId('')
                  setAddCreditsAmount('')
                  setAddCreditsDesc('')
                  setAddCreditsOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Credits
              </Button>
              <Button variant="outline" size="icon" onClick={fetchCredits} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credits table */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Credit Transactions
            </CardTitle>
            <CardDescription>{credits.length} transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {creditsLoading ? (
              renderLoading()
            ) : (
              <ScrollArea className="max-h-[520px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden sm:table-cell">Description</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
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
                      credits.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <span className="text-sm font-medium">{tx.userName}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: `${CREDIT_TYPE_COLORS[tx.type]}10`,
                                color: CREDIT_TYPE_COLORS[tx.type],
                                borderColor: `${CREDIT_TYPE_COLORS[tx.type]}40`,
                              }}
                            >
                              {tx.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
                              {tx.description}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
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
      <Dialog open={addCreditsOpen} onOpenChange={setAddCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Add Credits to User
            </DialogTitle>
            <DialogDescription>Add credits directly to a user&apos;s account balance.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="Enter user ID"
                value={addCreditsUserId}
                onChange={(e) => setAddCreditsUserId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={addCreditsAmount}
                  onChange={(e) => setAddCreditsAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={addCreditsType} onValueChange={(v) => setAddCreditsType(v as 'bonus' | 'purchase' | 'refund')}>
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
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Reason for adding credits..."
                value={addCreditsDesc}
                onChange={(e) => setAddCreditsDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCreditsOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleAddCredits}
              disabled={!addCreditsUserId || !addCreditsAmount || addCreditsSubmitting}
            >
              {addCreditsSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )

  // ─── Tab 4: Analytics ────────────────────────────────────────────────────
  const renderAnalyticsTab = () => {
    if (analyticsLoading) return renderLoading()
    if (!analytics) return null

    return (
      <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {renderKPICard('Total Users', analytics.totalUsers, <Users className="h-6 w-6" />, 'from-amber-400 to-amber-600', 'bg-amber-50', 'text-amber-600', undefined, { value: 12, label: 'vs last month' })}
          {renderKPICard('Active Users', analytics.activeUsers, <UserCheck className="h-6 w-6" />, 'from-emerald-400 to-emerald-600', 'bg-emerald-50', 'text-emerald-600', undefined, { value: 8, label: 'vs last month' })}
          {renderKPICard('MRR', formatCurrency(analytics.mrr), <DollarSign className="h-6 w-6" />, 'from-orange-400 to-orange-600', 'bg-orange-50', 'text-orange-600', undefined, { value: 15, label: 'vs last month' })}
          {renderKPICard('Total Revenue', formatCurrency(analytics.totalRevenue), <TrendingUp className="h-6 w-6" />, 'from-teal-400 to-teal-600', 'bg-teal-50', 'text-teal-600', undefined, { value: 22, label: 'vs last month' })}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue trend */}
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.revenueTrend.length > 0 && analytics.revenueTrend.some((r) => r.revenue > 0) ? (
                  <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                    <AreaChart data={analytics.revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="revenue" stroke={AMBER} strokeWidth={3} fill="url(#adminRevenueGrad)" />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No revenue data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Users by Plan - Pie */}
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  Users by Plan
                </CardTitle>
                <CardDescription>Distribution of users across plans</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.usersByPlan.length > 0 ? (
                  <ChartContainer config={usersByPlanConfig} className="h-[280px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={analytics.usersByPlan}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="plan"
                      >
                        {analytics.usersByPlan.map((entry, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={[AMBER, ORANGE, EMERALD, SLATE, TEAL][i % 5]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No plan data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subscription Status Breakdown - Bar chart */}
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                Subscription Status Breakdown
              </CardTitle>
              <CardDescription>Current subscription statuses across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.subscriptionStatus.length > 0 ? (
                <ChartContainer config={subStatusConfig} className="h-[280px] w-full">
                  <BarChart data={analytics.subscriptionStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {analytics.subscriptionStatus.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={SUB_STATUS_COLORS[entry.status] || SLATE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  No subscription data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Users tables + Platform Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top users by leads */}
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  Top Users by Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topUsersByLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No data</TableCell>
                        </TableRow>
                      ) : (
                        analytics.topUsersByLeads.map((u, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-xs font-bold">
                                  {i + 1}
                                </div>
                                <span className="text-sm">{u.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${planBadgeClass(u.plan)}`}>
                                {u.plan}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{u.leads}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top users by credits */}
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Top Users by Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topUsersByCredits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No data</TableCell>
                        </TableRow>
                      ) : (
                        analytics.topUsersByCredits.map((u, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-xs font-bold">
                                  {i + 1}
                                </div>
                                <span className="text-sm">{u.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${planBadgeClass(u.plan)}`}>
                                {u.plan}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{u.credits}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform stats */}
          <motion.div variants={item}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-500" />
                  Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                      <p className="text-lg font-bold">{analytics.platformStats.totalLeads.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Search className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Searches</p>
                      <p className="text-lg font-bold">{analytics.platformStats.totalSearches.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Download className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Exports</p>
                      <p className="text-lg font-bold">{analytics.platformStats.totalExports.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-500" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, subscriptions, credits, and view platform analytics.</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 p-1 h-auto flex-wrap">
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-1.5">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            {renderUsersTab()}
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            {renderSubscriptionsTab()}
          </TabsContent>

          <TabsContent value="credits" className="mt-6">
            {renderCreditsTab()}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {renderAnalyticsTab()}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
