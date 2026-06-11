'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Shield,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle2,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  plan: string
  credits: number
  status: string
  leads: number
  joined: string
}

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'suspended':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'banned':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'admin':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'agency_owner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'team_member':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function planBadgeClass(plan: string): string {
  switch (plan?.toLowerCase()) {
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

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Add user dialog
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [addUserName, setAddUserName] = useState('')
  const [addUserEmail, setAddUserEmail] = useState('')
  const [addUserRole, setAddUserRole] = useState('user')
  const [addUserSubmitting, setAddUserSubmitting] = useState(false)

  // Add credits dialog
  const [addCreditsOpen, setAddCreditsOpen] = useState(false)
  const [addCreditsUserId, setAddCreditsUserId] = useState('')
  const [addCreditsAmount, setAddCreditsAmount] = useState('')
  const [addCreditsType, setAddCreditsType] = useState<'bonus' | 'purchase' | 'refund'>('bonus')
  const [addCreditsDesc, setAddCreditsDesc] = useState('')
  const [addCreditsSubmitting, setAddCreditsSubmitting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
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
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
      // Silently handle
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
        fetchUsers()
      }
    } catch {
      // Silently handle
    } finally {
      setAddCreditsSubmitting(false)
    }
  }

  const handleAddUser = async () => {
    if (!addUserName || !addUserEmail) return
    setAddUserSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addUserName, email: addUserEmail, role: addUserRole }),
      })
      if (res.ok) {
        setAddUserOpen(false)
        setAddUserName('')
        setAddUserEmail('')
        setAddUserRole('user')
        fetchUsers()
      }
    } catch {
      // Silently handle
    } finally {
      setAddUserSubmitting(false)
    }
  }

  // Computed
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const adminCount = users.filter((u) => ['admin', 'super_admin'].includes(u.role)).length
  const newThisMonth = users.filter((u) => {
    const d = new Date(u.joined)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage platform users and permissions</p>
            </div>
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => setAddUserOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                12.5% vs last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{adminCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold">{newThisMonth}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <ArrowDownRight className="h-3 w-3" />
                3.2% vs last month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agency_owner">Agency Owner</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              All Users
            </CardTitle>
            <CardDescription>{totalUsers} users found</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
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
                            <Badge variant="outline" className={roleBadgeClass(user.role)}>
                              {user.role.replace('_', ' ')}
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
                                {(user.status === 'suspended') && (
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { status: 'active' })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                {user.status === 'banned' && (
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { status: 'active' })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Unban User
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

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account on the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={addUserName}
                onChange={(e) => setAddUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="john@example.com"
                type="email"
                value={addUserEmail}
                onChange={(e) => setAddUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={addUserRole} onValueChange={setAddUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agency_owner">Agency Owner</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleAddUser}
              disabled={addUserSubmitting}
            >
              {addUserSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={addCreditsOpen} onOpenChange={setAddCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>Add credits to a user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={addCreditsUserId} onChange={(e) => setAddCreditsUserId(e.target.value)} placeholder="User ID" />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="100"
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
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={addCreditsDesc}
                onChange={(e) => setAddCreditsDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCreditsOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleAddCredits}
              disabled={addCreditsSubmitting}
            >
              {addCreditsSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
