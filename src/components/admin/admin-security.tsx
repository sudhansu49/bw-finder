'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Area, AreaChart, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Key,
  Monitor,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye,
  Ban,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

// ─── Animation ──────────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface SecurityData {
  users: { total: number; active: number; suspended: number; banned: number }
  sessions: { total: number; active: number }
  today: {
    logins: number; failedLogins: number; securityEvents: number
    criticalEvents: number; authLogs: number; auditLogs: number; adminActions: number
  }
  weekly: { securityEvents: number; rateLimitHits: number }
  rateLimits: { totalKeys: number; activeKeys: number }
  charts: {
    loginsByDay: { date: string; count: number }[]
    securityByCategory: { action: string; count: number }[]
    topActions: { action: string; count: number }[]
  }
  usersByRole: { role: string; count: number }[]
  recentSecurityEvents: any[]
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, subtitle, color = 'slate', trend }: {
  icon: React.ElementType
  title: string
  value: string | number
  subtitle?: string
  color?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  const bgMap: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-500/10',
    amber: 'bg-amber-100 dark:bg-amber-500/10',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/10',
    orange: 'bg-orange-100 dark:bg-orange-500/10',
    slate: 'bg-slate-100 dark:bg-slate-500/10',
    blue: 'bg-blue-100 dark:bg-blue-500/10',
  }
  const textMap: Record<string, string> = {
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    orange: 'text-orange-600 dark:text-orange-400',
    slate: 'text-slate-600 dark:text-slate-400',
    blue: 'text-blue-600 dark:text-blue-400',
  }

  return (
    <motion.div variants={staggerItem} {...fadeIn}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${bgMap[color]}`}>
              <Icon className={`h-5 w-5 ${textMap[color]}`} />
            </div>
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Severity Badge ─────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    info: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 ${colors[severity] || colors.info}`}>
      {severity}
    </Badge>
  )
}

// ─── Role Badge ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    super_admin: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    admin: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    agency_owner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    team_member: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    user: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 ${colors[role] || colors.user}`}>
      {role.replace('_', ' ')}
    </Badge>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminSecurity() {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentAdminView } = useAppStore()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/security', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch security data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const loginSuccessRate = data.today.logins + data.today.failedLogins > 0
    ? Math.round((data.today.logins / (data.today.logins + data.today.failedLogins)) * 100)
    : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Security Center</h1>
            <p className="text-sm text-muted-foreground">Monitor security events, sessions, and access control</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} title="Total Users" value={data.users.total} subtitle={`${data.users.active} active`} color="blue" />
        <StatCard icon={Activity} title="Active Sessions" value={data.sessions.active} subtitle={`${data.sessions.total} total`} color="emerald" />
        <StatCard icon={CheckCircle2} title="Login Success" value={`${loginSuccessRate}%`} subtitle={`${data.today.logins} today`} color={loginSuccessRate > 90 ? 'emerald' : 'amber'} />
        <StatCard icon={AlertTriangle} title="Security Events" value={data.weekly.securityEvents} subtitle="this week" color={data.weekly.securityEvents > 10 ? 'red' : 'amber'} />
      </motion.div>

      {/* Second Row Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={XCircle} title="Failed Logins" value={data.today.failedLogins} subtitle="today" color="red" />
        <StatCard icon={AlertCircle} title="Critical Events" value={data.today.criticalEvents} subtitle="today" color={data.today.criticalEvents > 0 ? 'red' : 'emerald'} />
        <StatCard icon={Ban} title="Rate Limit Hits" value={data.weekly.rateLimitHits} subtitle="this week" color="orange" />
        <StatCard icon={Key} title="Admin Actions" value={data.today.adminActions} subtitle="today" color="slate" />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Login Activity (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <AreaChart data={data.charts.loginsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} name="Logins" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Users by Role Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <BarChart data={data.usersByRole}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="role" tick={{ fontSize: 9 }} tickFormatter={(v) => v.replace('_', ' ')} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Account Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Status */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">Active</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data.users.active}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm">Suspended</span>
              </div>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{data.users.suspended}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-500/5">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm">Banned</span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{data.users.banned}</span>
            </div>

            <div className="pt-2 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setCurrentAdminView('admin-sessions')}>
                <Monitor className="h-3.5 w-3.5" />
                Manage Sessions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setCurrentAdminView('admin-roles')}>
                <Key className="h-3.5 w-3.5" />
                Manage Roles
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setCurrentAdminView('admin-audit-logs')}>
                <Eye className="h-3.5 w-3.5" />
                View Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Recent Security Events
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentAdminView('admin-audit-logs')}>
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentSecurityEvents.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                No recent security events
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Event</TableHead>
                      <TableHead className="text-[10px]">Actor</TableHead>
                      <TableHead className="text-[10px]">Severity</TableHead>
                      <TableHead className="text-[10px]">IP</TableHead>
                      <TableHead className="text-[10px]">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentSecurityEvents.map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">
                          {event.action.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-xs">
                          {event.actor ? (
                            <span>{event.actor.name}</span>
                          ) : (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell><SeverityBadge severity={event.severity} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{event.ipAddress || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Top Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Today&apos;s Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Auth Events', value: data.today.authLogs, icon: Lock, color: 'text-blue-500' },
              { label: 'Audit Logs', value: data.today.auditLogs, icon: Activity, color: 'text-emerald-500' },
              { label: 'Admin Actions', value: data.today.adminActions, icon: Shield, color: 'text-amber-500' },
              { label: 'Security Events', value: data.today.securityEvents, icon: AlertTriangle, color: 'text-red-500' },
              { label: 'Failed Logins', value: data.today.failedLogins, icon: XCircle, color: 'text-orange-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <item.icon className={`h-5 w-5 ${item.color} shrink-0`} />
                <div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
