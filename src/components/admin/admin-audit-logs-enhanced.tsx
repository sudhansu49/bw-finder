'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react'

// ─── Animation ──────────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string
  actorId: string | null
  action: string
  category: string
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  severity: string
  resource: string | null
  resourceId: string | null
  metadata: string | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
    role: string
    avatar: string | null
  } | null
}

interface AuditData {
  data: AuditLog[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  stats: {
    totalLogs: number
    authLogs: number
    securityLogs: number
    criticalLogs: number
    todayLogs: number
  }
}

// ─── Severity Badge ─────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    info: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  }
  const icons: Record<string, React.ElementType> = {
    info: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    critical: AlertTriangle,
  }
  const Icon = icons[severity] || CheckCircle2
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 gap-0.5 ${colors[severity] || colors.info}`}>
      <Icon className="h-2.5 w-2.5" />
      {severity}
    </Badge>
  )
}

// ─── Category Badge ─────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    auth: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    user: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    subscription: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    billing: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    credit: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    admin: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    system: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    security: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    api: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
    session: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 ${colors[category] || colors.system}`}>
      {category}
    </Badge>
  )
}

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4', '#f97316', '#ec4899']

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminAuditLogs() {
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [severity, setSeverity] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      })
      if (category !== 'all') params.set('category', category)
      if (severity !== 'all') params.set('severity', severity)

      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
    }
  }, [page, category, severity])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExport = () => {
    if (!data) return
    const csv = [
      ['Timestamp', 'Action', 'Category', 'Severity', 'Actor', 'IP Address', 'Details'].join(','),
      ...data.data.map((log) =>
        [
          new Date(log.createdAt).toISOString(),
          log.action,
          log.category,
          log.severity,
          log.actor?.name || 'System',
          log.ipAddress || '-',
          `"${(log.details || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-slate-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const stats = data?.stats || { totalLogs: 0, authLogs: 0, securityLogs: 0, criticalLogs: 0, todayLogs: 0 }

  // Build category pie data
  const categoryData = [
    { name: 'auth', value: stats.authLogs, color: PIE_COLORS[0] },
    { name: 'security', value: stats.securityLogs, color: PIE_COLORS[7] },
    { name: 'other', value: Math.max(0, stats.totalLogs - stats.authLogs - stats.securityLogs), color: PIE_COLORS[4] },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">Complete activity trail for compliance and monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div {...fadeIn} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Logs', value: stats.totalLogs, icon: FileText, color: 'slate' },
          { label: 'Auth Events', value: stats.authLogs, icon: Shield, color: 'blue' },
          { label: 'Security Events', value: stats.securityLogs, icon: AlertTriangle, color: 'red' },
          { label: 'Critical', value: stats.criticalLogs, icon: XCircle, color: 'rose' },
          { label: 'Today', value: stats.todayLogs, icon: Clock, color: 'emerald' },
        ].map((s) => {
          const bgMap: Record<string, string> = { slate: 'bg-slate-100 dark:bg-slate-500/10', blue: 'bg-blue-100 dark:bg-blue-500/10', red: 'bg-red-100 dark:bg-red-500/10', rose: 'bg-rose-100 dark:bg-rose-500/10', emerald: 'bg-emerald-100 dark:bg-emerald-500/10' }
          const textMap: Record<string, string> = { slate: 'text-slate-600', blue: 'text-blue-600', red: 'text-red-600', rose: 'text-rose-600', emerald: 'text-emerald-600' }
          return (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bgMap[s.color]}`}>
                  <s.icon className={`h-4 w-4 ${textMap[s.color]}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Chart + Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[160px]">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((d) => (
                <div key={d.name} className="flex items-center gap-1 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1) }}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Time</TableHead>
                    <TableHead className="text-[10px]">Action</TableHead>
                    <TableHead className="text-[10px]">Actor</TableHead>
                    <TableHead className="text-[10px]">Category</TableHead>
                    <TableHead className="text-[10px]">Severity</TableHead>
                    <TableHead className="text-[10px]">IP</TableHead>
                    <TableHead className="text-[10px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {log.action.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.actor ? log.actor.name : <span className="text-muted-foreground italic">System</span>}
                      </TableCell>
                      <TableCell><CategoryBadge category={log.category} /></TableCell>
                      <TableCell><SeverityBadge severity={log.severity} /></TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-xs text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
