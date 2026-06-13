'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Shield,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Crown,
  UserCog,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

// ─── Animation ──────────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface RoleData {
  role: string
  level: number
  userCount: number
  permissions: string[]
  permissionCount: number
}

interface RolesData {
  roles: RoleData[]
  permissionCategories: Record<string, string[]>
  totalPermissions: number
}

interface UserData {
  id: string
  email: string
  name: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

// ─── Role Badge ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    super_admin: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    admin: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
    agency_owner: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    team_member: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
    user: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  }
  const icons: Record<string, React.ElementType> = {
    super_admin: Crown,
    admin: Shield,
    agency_owner: Users,
    team_member: UserCog,
    user: Users,
  }
  const Icon = icons[role] || Users

  return (
    <Badge variant="outline" className={`text-xs px-2 py-0.5 gap-1 ${colors[role] || colors.user}`}>
      <Icon className="h-3 w-3" />
      {role.replace(/_/g, ' ')}
    </Badge>
  )
}

// ─── Permission Matrix Cell ─────────────────────────────────────────────────

function PermCell({ hasPermission }: { hasPermission: boolean }) {
  return hasPermission ? (
    <div className="flex items-center justify-center">
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminRoles() {
  const [data, setData] = useState<RolesData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [changeDialogOpen, setChangeDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [newRole, setNewRole] = useState('')
  const [changing, setChanging] = useState(false)
  const { user: currentUser } = useAppStore()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch('/api/admin/roles', { credentials: 'include' }),
        fetch('/api/admin/users?limit=50', { credentials: 'include' }),
      ])
      if (rolesRes.ok) setData(await rolesRes.json())
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) return
    setChanging(true)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, role: newRole }),
        credentials: 'include',
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
        )
        setChangeDialogOpen(false)
        setSelectedUser(null)
        setNewRole('')
      }
    } catch (err) {
      console.error('Failed to change role:', err)
    } finally {
      setChanging(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const roles = data.roles.sort((a, b) => b.level - a.level)
  const categories = Object.entries(data.permissionCategories).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground">Manage role-based access control for your organization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {data.totalPermissions} permissions
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix" className="gap-2">
            <Shield className="h-3.5 w-3.5" />
            Permission Matrix
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-3.5 w-3.5" />
            User Roles
          </TabsTrigger>
        </TabsList>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Role Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roles.map((role) => (
              <motion.div key={role.role} {...fadeIn}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <RoleBadge role={role.role} />
                    <p className="text-2xl font-bold mt-2">{role.userCount}</p>
                    <p className="text-[10px] text-muted-foreground">users</p>
                    <Separator className="my-2" />
                    <p className="text-sm font-medium">{role.permissionCount}</p>
                    <p className="text-[10px] text-muted-foreground">permissions</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Permission Matrix Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Permission Matrix</CardTitle>
              <CardDescription>Complete role-permission mapping across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sticky left-0 bg-background z-10 min-w-[160px]">Permission</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role.role} className="text-[10px] text-center min-w-[90px]">
                            <div className="flex flex-col items-center gap-1">
                              <RoleBadge role={role.role} />
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map(([category, perms]) => (
                        <>
                          <TableRow key={`cat-${category}`} className="bg-muted/30">
                            <TableCell colSpan={roles.length + 1} className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-1.5 sticky left-0 bg-muted/30 z-10">
                              {category}
                            </TableCell>
                          </TableRow>
                          {perms.map((perm) => (
                            <TableRow key={perm}>
                              <TableCell className="text-xs font-mono sticky left-0 bg-background z-10">
                                {perm}
                              </TableCell>
                              {roles.map((role) => (
                                <TableCell key={`${role.role}-${perm}`} className="text-center p-1">
                                  <PermCell hasPermission={role.permissions.includes(perm)} />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Assign Roles to Users</CardTitle>
              <CardDescription>Click on a user&apos;s role to change it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Last Login</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs font-medium">{user.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                        <TableCell><RoleBadge role={user.role} /></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] px-1.5 ${user.status === 'active' ? 'text-emerald-600' : user.status === 'suspended' ? 'text-amber-600' : 'text-red-600'}`}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.id !== currentUser?.id && user.role !== 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setChangeDialogOpen(true)
                              }}
                            >
                              <UserCog className="h-3 w-3" />
                              Change Role
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Role Dialog */}
      <Dialog open={changeDialogOpen} onOpenChange={setChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current:</span>
              {selectedUser && <RoleBadge role={selectedUser.role} />}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <span className="text-sm font-medium">New Role:</span>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="agency_owner">Agency Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUser?.role === 'super_admin' && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {newRole && newRole !== selectedUser?.role && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Role Change Impact</p>
                  <p className="mt-1">
                    Changing from <strong>{selectedUser?.role.replace(/_/g, ' ')}</strong> to <strong>{newRole.replace(/_/g, ' ')}</strong> will
                    immediately update their permissions and access levels. This action will be logged.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleChangeRole}
              disabled={changing || newRole === selectedUser?.role}
              className="gap-2"
            >
              {changing && <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
