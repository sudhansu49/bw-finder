'use client'

import { useAppStore, type AdminView } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  DollarSign,
  Receipt,
  Target,
  Tag,
  MapPin,
  Coins,
  Activity,
  Heart,
  FileText,
  BarChart3,
  LifeBuoy,
  Megaphone,
  Mail,
  Smartphone,
  TrendingUp,
  Puzzle,
  Brain,
  ToggleLeft,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  X,
  ArrowLeftRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  view: AdminView
  label: string
  icon: React.ElementType
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { view: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'admin-users', label: 'Users', icon: Users },
      { view: 'admin-agencies', label: 'Agencies', icon: Building2 },
      { view: 'admin-subscriptions', label: 'Subscriptions', icon: CreditCard },
      { view: 'admin-payments', label: 'Payments', icon: DollarSign },
      { view: 'admin-transactions', label: 'Transactions', icon: Receipt },
    ],
  },
  {
    title: 'DATA',
    items: [
      { view: 'admin-leads', label: 'Leads', icon: Target },
      { view: 'admin-categories', label: 'Categories', icon: Tag },
      { view: 'admin-locations', label: 'Locations', icon: MapPin },
      { view: 'admin-credits', label: 'Credits', icon: Coins },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { view: 'admin-api-usage', label: 'API Usage', icon: Activity },
      { view: 'admin-system-health', label: 'System Health', icon: Heart },
      { view: 'admin-audit-logs', label: 'Audit Logs', icon: FileText },
      { view: 'admin-reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { view: 'admin-support', label: 'Support', icon: LifeBuoy },
      { view: 'admin-announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      { view: 'admin-email-broadcast', label: 'Email Broadcast', icon: Mail },
      { view: 'admin-whatsapp-broadcast', label: 'WhatsApp', icon: Smartphone },
      { view: 'admin-marketing', label: 'Marketing', icon: TrendingUp },
    ],
  },
  {
    title: 'CONFIG',
    items: [
      { view: 'admin-integrations', label: 'Integrations', icon: Puzzle },
      { view: 'admin-ai-usage', label: 'AI Usage', icon: Brain },
      { view: 'admin-feature-flags', label: 'Feature Flags', icon: ToggleLeft },
      { view: 'admin-settings', label: 'Settings', icon: Settings },
    ],
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function roleBadgeColor(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'admin':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'agency_owner':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

export function AdminSidebar() {
  const {
    currentAdminView,
    setCurrentAdminView,
    adminSidebarCollapsed,
    toggleAdminSidebar,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    user,
    setUser,
    setAuthMode,
    setActivePanel,
    setCurrentView,
  } = useAppStore()

  const handleNavClick = (view: AdminView) => {
    setCurrentAdminView(view)
    setSidebarMobileOpen(false)
  }

  const handleLogout = () => {
    sessionStorage.setItem('bw-finder-logged-out', 'true')
    setUser(null)
    setAuthMode('admin')
  }

  const initials = user?.name ? getInitials(user.name) : 'A'

  const renderNavItem = (item: NavItem) => {
    const isActive = currentAdminView === item.view
    const Icon = item.icon

    if (adminSidebarCollapsed) {
      return (
        <Tooltip key={item.view}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavClick(item.view)}
              className={`
                w-full flex items-center justify-center h-10 rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-indicator-collapsed"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-red-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <button
        key={item.view}
        onClick={() => handleNavClick(item.view)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 group relative
          ${
            isActive
              ? 'bg-red-600/15 text-red-400'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }
        `}
      >
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="truncate">{item.label}</span>
        {isActive && (
          <motion.div
            layoutId="admin-sidebar-indicator-expanded"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-red-500"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </button>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header / Logo - fixed height */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          {!adminSidebarCollapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold tracking-tight text-white block truncate">
                Admin Console
              </span>
              <span className="text-[10px] text-red-400/60 uppercase tracking-wider">BW Finder</span>
            </div>
          )}
        </div>
        {!adminSidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator className="bg-slate-700/50 shrink-0" />

      {/* Search bar */}
      {!adminSidebarCollapsed && (
        <div className="px-3 pt-3 shrink-0">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-500 text-sm hover:bg-slate-800 transition-colors"
            onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Navigation - scrollable area */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-3">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!adminSidebarCollapsed && (
                <h3 className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {group.title}
                </h3>
              )}
              {adminSidebarCollapsed && <div className="my-1" />}
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-slate-700/50 shrink-0" />

      {/* User section - compact */}
      <div className="p-3 shrink-0">
        {adminSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-center">
                  <p className="font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || 'admin'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-slate-800"
                  onClick={() => {
                    setActivePanel('user')
                    setCurrentView('user-dashboard')
                  }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">User Panel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-slate-800"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 mt-0.5 ${roleBadgeColor(user?.role || 'admin')}`}
                >
                  {(user?.role || 'admin').replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 h-8 text-xs"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 text-xs"
                onClick={() => {
                  setActivePanel('user')
                  setCurrentView('user-dashboard')
                }}
              >
                <Search className="h-3.5 w-3.5" />
                User Panel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle - desktop only */}
      <div className="hidden lg:flex p-3 pt-0 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-500 hover:text-white hover:bg-slate-800 h-8"
          onClick={toggleAdminSidebar}
        >
          {adminSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[280px] bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out lg:hidden
          flex flex-col overflow-hidden
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0 bg-slate-900 text-white
          transition-all duration-300 ease-in-out shrink-0 overflow-hidden
          ${adminSidebarCollapsed ? 'w-20' : 'w-[280px]'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
