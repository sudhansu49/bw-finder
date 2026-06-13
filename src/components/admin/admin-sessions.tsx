'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Monitor,
  Globe,
  Clock,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Search,
  Wifi,
  WifiOff,
  Shield,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

// ─── Animation ──────────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Session {
  id: string
  userId: string
  refreshToken: string
  deviceInfo: string | null
  ipAddress: string | null
  userAgent: string | null
  isRevoked: boolean
  expiresAt: string
  createdAt: string
  lastActiveAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string | null
  }
}

interface SessionsData {
  sessions: Session[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  stats: { total: number; active: number; revoked: number }
}

// ─── Device Icon ────────────────────────────────────────────────────────────

function DeviceIcon({ deviceInfo }: { deviceInfo: string | null }) {
  if (!deviceInfo) return <Monitor className="h-4 w-4 text-slate-400" />
  const lower = deviceInfo.toLowerCase()
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
    return <Smartphone className="h-4 w-4 text-blue-500" />
  }
  if (lower.includes('chrome')) return <Globe className="h-4 w-4 text-emerald-500" />
  if (lower.includes('firefox')) return <Globe className="h-4 w-4 text-orange-500" />
  if (lower.includes('safari')) return <Globe className="h-4 w-4 text-blue-400" />
  if (lower.includes('edge')) return <Globe className="h-4 w-4 text-blue-600" />
  return <Laptop className="h-4 w-4 text-slate-500" />
}

// ─── Session Status Badge ───────────────────────────────────────────────────

function SessionStatusBadge({ session }: { session: Session }) {
  const isExpired = new Date(session.expiresAt) < new Date()
  if (session.isRevoked) {
    return <Badge variant="outline" className="text-[10px] px-1.5 text-red-600 bg-red-50 dark:bg-red-500/10">Revoked</Badge>
  }
  if (isExpired) {
    return <Badge variant="outline" className="text-[10px] px-1.5 text-slate-500 bg-slate-50 dark:bg-slate-500/10">Expired</Badge>
  }
  return <Badge variant="outline" className="text-[10px] px-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10">Active</Badge>
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
      {role.replace(/_/g, ' ')}
    </Badge>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminSessions() {
  const [data, setData] = useState<SessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'session' | 'user'; id: string; name: string }>({
    open: false, type: 'session', id: '', name: '',
  })
  const [revoking, setRevoking] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const activeParam = filter === 'active' ? '&active=true' : ''
      const res = await fetch(`/api/admin/sessions?limit=100${activeParam}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRevokeSession = async () => {
    setRevoking(true)
    try {
      const body = confirmDialog.type === 'user'
        ? { userId: confirmDialog.id, revokeAll: true }
        : { sessionId: confirmDialog.id }
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to revoke:', err)
    } finally {
      setRevoking(false)
      setConfirmDialog({ open: false, type: 'session', id: '', name: '' })
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Filter sessions by search
  const filteredSessions = data.sessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      (s.ipAddress || '').includes(q) ||
      (s.deviceInfo || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Active Sessions</h1>
            <p className="text-sm text-muted-foreground">Monitor and manage user sessions</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <motion.div {...fadeIn} className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-500/10 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{data.stats.active}</p>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{data.stats.revoked}</p>
              <p className="text-xs text-muted-foreground">Revoked</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">IP Address</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Active</TableHead>
                  <TableHead className="text-xs">Expires</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      No sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                            {session.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{session.user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{session.user.email}</p>
                          </div>
                          <RoleBadge role={session.user.role} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon deviceInfo={session.deviceInfo} />
                          <span className="text-xs">{session.deviceInfo || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {session.ipAddress || '-'}
                      </TableCell>
                      <TableCell>
                        <SessionStatusBadge session={session} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(session.lastActiveAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(session.expiresAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {!session.isRevoked && new Date(session.expiresAt) > new Date() && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-red-600 hover:text-red-700"
                              onClick={() => setConfirmDialog({
                                open: true,
                                type: 'session',
                                id: session.id,
                                name: session.user.name,
                              })}
                            >
                              <Trash2 className="h-3 w-3" />
                              Revoke
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-amber-600 hover:text-amber-700"
                              onClick={() => setConfirmDialog({
                                open: true,
                                type: 'user',
                                id: session.userId,
                                name: session.user.name,
                              })}
                            >
                              <Shield className="h-3 w-3" />
                              All
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Revoke Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirmDialog.type === 'user' ? 'Revoke All Sessions' : 'Revoke Session'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'user'
                ? `This will terminate ALL active sessions for ${confirmDialog.name}. They will need to log in again on all devices.`
                : `This will terminate the session for ${confirmDialog.name}. They will need to log in again on that device.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">
              This action is immediate and cannot be undone. The user will be logged out {confirmDialog.type === 'user' ? 'everywhere' : 'on this device'}.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleRevokeSession}
              disabled={revoking}
              className="gap-2"
            >
              {revoking && <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
              {confirmDialog.type === 'user' ? 'Revoke All Sessions' : 'Revoke Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
