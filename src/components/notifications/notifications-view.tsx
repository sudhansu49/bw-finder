'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TrendingUp,
  Users,
  Zap,
  Settings,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'lead' | 'outreach' | 'system' | 'marketing'

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: Date
  read: boolean
  mention?: boolean
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

function formatRelativeTime(date: Date): string {
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

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'lead':
      return Target
    case 'outreach':
      return Mail
    case 'system':
      return Shield
    case 'marketing':
      return Megaphone
  }
}

function getTypeColor(type: NotificationType) {
  switch (type) {
    case 'lead':
      return { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    case 'outreach':
      return { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    case 'system':
      return { icon: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
    case 'marketing':
      return { icon: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  }
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

function generateDemoNotifications(): Notification[] {
  const now = new Date()
  return [
    {
      id: 'n1',
      type: 'lead',
      title: 'New high-value lead discovered',
      description: 'Bella Vista Restaurant scored 92/100 on opportunity analysis. Estimated revenue: $4,200/mo.',
      timestamp: new Date(now.getTime() - 12 * 60000),
      read: false,
    },
    {
      id: 'n2',
      type: 'lead',
      title: 'Lead score updated',
      description: 'Sunrise Dental Clinic lead score increased from 64 to 78. Now qualifies as hot lead.',
      timestamp: new Date(now.getTime() - 38 * 60000),
      read: false,
    },
    {
      id: 'n3',
      type: 'outreach',
      title: 'Email opened by prospect',
      description: 'Marco Rossi from TechHub Solutions opened your proposal email 2 times.',
      timestamp: new Date(now.getTime() - 1.5 * 3600000),
      read: false,
      mention: true,
    },
    {
      id: 'n4',
      type: 'outreach',
      title: 'Call reminder: Follow-up with Green Leaf Spa',
      description: 'Scheduled call in 30 minutes. Last contact: proposal sent 3 days ago.',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      read: false,
    },
    {
      id: 'n5',
      type: 'system',
      title: 'Plan upgraded successfully',
      description: 'Your account has been upgraded to the Professional plan. You now have 500 credits/month.',
      timestamp: new Date(now.getTime() - 3 * 3600000),
      read: true,
    },
    {
      id: 'n6',
      type: 'lead',
      title: '5 new leads in your pipeline',
      description: 'New leads found matching your saved search: "Restaurants without websites in Milan".',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      read: true,
    },
    {
      id: 'n7',
      type: 'system',
      title: 'Scheduled maintenance tonight',
      description: 'System maintenance from 2:00 AM to 3:00 AM UTC. Expected downtime: 15 minutes.',
      timestamp: new Date(now.getTime() - 5 * 3600000),
      read: false,
    },
    {
      id: 'n8',
      type: 'marketing',
      title: 'Pro tip: Optimize your outreach sequence',
      description: 'Our data shows adding a follow-up within 48h increases response rates by 34%. Try it now!',
      timestamp: new Date(now.getTime() - 8 * 3600000),
      read: true,
    },
    {
      id: 'n9',
      type: 'outreach',
      title: 'Email campaign completed',
      description: 'Your "Q1 Outreach Blast" campaign finished. 142 sent, 38 opened, 12 replies.',
      timestamp: new Date(now.getTime() - 12 * 3600000),
      read: true,
    },
    {
      id: 'n10',
      type: 'lead',
      title: 'Lead score dropped below threshold',
      description: 'City Gym lead score decreased from 52 to 38. Consider re-evaluating or archiving.',
      timestamp: new Date(now.getTime() - 1 * 86400000),
      read: false,
    },
    {
      id: 'n11',
      type: 'marketing',
      title: 'Limited offer: 20% off annual plans',
      description: 'Upgrade to annual billing before March 31st and save 20%. Use code SPRING20 at checkout.',
      timestamp: new Date(now.getTime() - 1.5 * 86400000),
      read: true,
    },
    {
      id: 'n12',
      type: 'system',
      title: 'Credits running low',
      description: 'You have 15 credits remaining. Consider upgrading your plan to avoid interruptions.',
      timestamp: new Date(now.getTime() - 2 * 86400000),
      read: false,
    },
    {
      id: 'n13',
      type: 'outreach',
      title: 'Reply received from Urban Coffee Co.',
      description: 'Lisa Chen replied: "Thanks for reaching out. Can we schedule a call next week?"',
      timestamp: new Date(now.getTime() - 2.5 * 86400000),
      read: true,
      mention: true,
    },
    {
      id: 'n14',
      type: 'marketing',
      title: 'New feature: AI-powered lead scoring',
      description: 'Our AI now automatically scores leads based on 30+ signals. Check your lead dashboard!',
      timestamp: new Date(now.getTime() - 3 * 86400000),
      read: true,
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationsView() {
  const { user } = useAppStore()

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>(generateDemoNotifications)
  const [activeTab, setActiveTab] = useState<string>('all')

  // Preferences state
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

  // Derived state
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read)
      case 'mentions':
        return notifications.filter((n) => n.mention)
      default:
        return notifications
    }
  }, [notifications, activeTab])

  // Actions
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
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

      {/* Tabs: All / Unread / Mentions */}
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
          <TabsTrigger value="mentions" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Mentions
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
                        : activeTab === 'mentions'
                          ? 'No mentions'
                          : 'No notifications'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {activeTab === 'unread'
                        ? 'You\'ve read everything! New notifications will appear here.'
                        : activeTab === 'mentions'
                          ? 'When someone mentions you, it\'ll show up here.'
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
                              onClick={() => markAsRead(notification.id)}
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
                                  {notification.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <span className="text-[11px] text-slate-400">
                                    {formatRelativeTime(notification.timestamp)}
                                  </span>
                                  {notification.mention && (
                                    <Badge variant="secondary" className="h-4 text-[10px] px-1.5 bg-blue-50 text-blue-600 border-blue-100">
                                      @mention
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
