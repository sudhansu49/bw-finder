'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Target,
  Mail,
  Shield,
  Megaphone,
  CheckCheck,
  X,
  Clock,
  AlertTriangle,
  Settings,
  AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system' | 'lead' | 'outreach' | 'marketing'

interface ApiNotification {
  id: string
  senderId: string | null
  recipientId: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl: string | null
  createdAt: string
  sender?: {
    id: string
    name: string
    avatar: string | null
  } | null
}

interface NotificationPreference {
  id: string
  category: string
  icon: React.ElementType
  color: string
  bgColor: string
  items: { id: string; label: string; enabled: boolean }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'lead':
      return Target
    case 'outreach':
      return Mail
    case 'warning':
      return AlertTriangle
    case 'success':
      return Target
    case 'error':
      return AlertTriangle
    case 'system':
      return Shield
    case 'marketing':
      return Megaphone
    case 'info':
    default:
      return Shield
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'lead':
      return { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    case 'outreach':
      return { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'warning':
      return { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    case 'success':
      return { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'error':
      return { icon: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    case 'system':
      return { icon: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
    case 'marketing':
      return { icon: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
    case 'info':
    default:
      return { icon: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
  }
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-72 rounded-lg" />
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-4">
              <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationsView() {
  const { user } = useAppStore()
  const { toast } = useToast()

  // Notification state
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [apiUnreadCount, setApiUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [markingRead, setMarkingRead] = useState<string | null>(null) // notificationId being marked as read

  // Preferences state (local)
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'lead-alerts',
      category: 'Lead Alerts',
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      items: [
        { id: 'new-leads', label: 'New leads discovered', enabled: true },
        { id: 'lead-score', label: 'Lead score changes', enabled: true },
      ],
    },
    {
      id: 'outreach-updates',
      category: 'Outreach Updates',
      icon: Mail,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      items: [
        { id: 'email-opened', label: 'Email opened', enabled: true },
        { id: 'call-reminders', label: 'Call reminders', enabled: true },
      ],
    },
    {
      id: 'system',
      category: 'System',
      icon: Shield,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      items: [
        { id: 'plan-updates', label: 'Plan updates', enabled: true },
        { id: 'maintenance', label: 'Maintenance alerts', enabled: false },
      ],
    },
    {
      id: 'marketing',
      category: 'Marketing',
      icon: Megaphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { id: 'tips', label: 'Tips & best practices', enabled: true },
        { id: 'offers', label: 'Offers & promotions', enabled: false },
      ],
    },
  ])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/user/notifications?userId=${user.id}&limit=50`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to fetch notifications')
      }
      const json = await res.json()
      setNotifications(json.notifications ?? [])
      setApiUnreadCount(json.unreadCount ?? 0)
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err)
      setError(err.message || 'Failed to load notifications')
      toast({
        title: 'Error',
        description: 'Failed to load notifications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Derived state
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read)
      default:
        return notifications
    }
  }, [notifications, activeTab])

  // Actions
  const markAsRead = async (id: string) => {
    if (!user?.id) return
    // Optimistic update
    const prev = notifications
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setMarkingRead(id)
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId: id }),
      })
      if (!res.ok) {
        throw new Error('Failed to mark as read')
      }
    } catch (err) {
      console.error('Failed to mark as read:', err)
      // Rollback
      setNotifications(prev)
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      })
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    // Optimistic update
    const prev = notifications
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, markAllRead: true }),
      })
      if (!res.ok) {
        throw new Error('Failed to mark all as read')
      }
      toast({
        title: 'Success',
        description: 'All notifications marked as read.',
      })
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      // Rollback
      setNotifications(prev)
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      })
    }
  }

  const dismissNotification = (id: string) => {
    // Just remove from local state (no API for delete)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const togglePreference = (categoryId: string, itemId: string) => {
    setPreferences((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, enabled: !item.enabled } : item
              ),
            }
          : cat
      )
    )
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loading) return <NotificationsSkeleton />

  // ─── Error State ────────────────────────────────────────────────────────

  if (error && notifications.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-muted-foreground">Manage your notifications</p>
          </div>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Failed to load notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNotifications} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark All Read
            </Button>
          )}
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs px-2.5">
            {notifications.length} total
          </Badge>
        </div>
      </div>

      {/* Tabs: All / Unread */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 h-10 p-1">
          <TabsTrigger value="all" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-6">
          {/* Notification Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {preferences.map((category, catIdx) => {
                    const CategoryIcon = category.icon
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIdx * 0.08 }}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`h-8 w-8 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                            <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{category.category}</span>
                        </div>
                        <div className="space-y-3">
                          {category.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">{item.label}</span>
                              <Switch
                                checked={item.enabled}
                                onCheckedChange={() => togglePreference(category.id, item.id)}
                                className="data-[state=checked]:bg-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Recent Notifications
                  </CardTitle>
                  {filteredNotifications.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredNotifications.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">
                      {activeTab === 'unread'
                        ? 'No unread notifications'
                        : 'No notifications'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {activeTab === 'unread'
                        ? "You've read everything! New notifications will appear here."
                        : 'Your notification inbox is empty. Stay tuned for updates!'}
                    </p>
                  </motion.div>
                ) : (
                  <ScrollArea className="max-h-[520px] pr-1">
                    <div className="space-y-1">
                      <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notification, idx) => {
                          const TypeIcon = getTypeIcon(notification.type)
                          const colors = getTypeColor(notification.type)

                          return (
                            <motion.div
                              key={notification.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0, padding: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.03 }}
                              onClick={() => {
                                if (!notification.read) markAsRead(notification.id)
                              }}
                              className={`
                                group relative flex items-start gap-3 rounded-xl p-4 cursor-pointer
                                transition-all duration-200 hover:bg-slate-50
                                ${!notification.read
                                  ? 'border-l-[3px] border-l-blue-500 bg-blue-50/40 hover:bg-blue-50/60'
                                  : 'border-l-[3px] border-l-transparent'
                                }
                              `}
                            >
                              {/* Type Icon */}
                              <div className={`
                                mt-0.5 h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0
                                group-hover:scale-105 transition-transform
                              `}>
                                <TypeIcon className={`h-4.5 w-4.5 ${colors.icon}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className={`text-sm font-medium truncate ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <span className="text-[11px] text-slate-400">
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                  {notification.type && (
                                    <Badge variant="secondary" className="h-4 text-[10px] px-1.5 bg-slate-50 text-slate-500 border-slate-100">
                                      {notification.type}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Dismiss Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(notification.id)
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
