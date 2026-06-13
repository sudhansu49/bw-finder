'use client'

import { useAppStore, type UserView } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Search,
  Globe,
  Target,
  Megaphone,
  ClipboardCheck,
  FileText,
  Smartphone,
  Mail,
  Kanban,
  BarChart3,
  Download,
  Settings,
  User,
  CreditCard,
  Crown,
  Bell,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/hooks'

interface NavItem {
  view: UserView
  labelKey: string
  icon: React.ElementType
}

interface NavGroup {
  titleKey: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    titleKey: 'nav.overview',
    items: [
      { view: 'user-dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { view: 'user-lead-finder', labelKey: 'nav.leadFinder', icon: Search },
      { view: 'user-website-detection', labelKey: 'nav.websiteDetection', icon: Globe },
      { view: 'user-lead-scoring', labelKey: 'nav.leadScoring', icon: Target },
      { view: 'user-outreach', labelKey: 'nav.outreach', icon: Megaphone },
    ],
  },
  {
    titleKey: 'nav.tools',
    items: [
      { view: 'user-audit', labelKey: 'nav.aiAudit', icon: ClipboardCheck },
      { view: 'user-proposal', labelKey: 'nav.proposalGenerator', icon: FileText },
      { view: 'user-whatsapp', labelKey: 'nav.whatsappGenerator', icon: Smartphone },
      { view: 'user-email', labelKey: 'nav.emailGenerator', icon: Mail },
      { view: 'user-crm', labelKey: 'nav.crm', icon: Kanban },
    ],
  },
  {
    titleKey: 'nav.output',
    items: [
      { view: 'user-reports', labelKey: 'nav.reports', icon: BarChart3 },
      { view: 'user-exports', labelKey: 'nav.exports', icon: Download },
    ],
  },
  {
    titleKey: 'nav.account',
    items: [
      { view: 'user-settings', labelKey: 'nav.settings', icon: Settings },
      { view: 'user-profile', labelKey: 'nav.profile', icon: User },
      { view: 'user-billing', labelKey: 'nav.billing', icon: CreditCard },
      { view: 'user-subscription', labelKey: 'nav.subscription', icon: Crown },
      { view: 'user-notifications', labelKey: 'nav.notifications', icon: Bell },
      { view: 'user-help', labelKey: 'nav.helpCenter', icon: LifeBuoy },
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

function planBadgeColor(plan: string | null | undefined): string {
  switch (plan) {
    case 'pro':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'enterprise':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'starter':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

export function UserSidebar() {
  const {
    currentView,
    setCurrentView,
    userSidebarCollapsed,
    toggleUserSidebar,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    user,
    setUser,
    setActivePanel,
    setAuthMode,
    setCurrentAdminView,
  } = useAppStore()

  const { t } = useTranslation()
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'

  const handleNavClick = (view: UserView) => {
    setCurrentView(view)
    setSidebarMobileOpen(false)
  }

  const handleLogout = () => {
    sessionStorage.setItem('bw-finder-logged-out', 'true')
    setUser(null)
    setAuthMode('user')
  }
  const initials = user?.name ? getInitials(user.name) : 'U'
  const planLabel = user?.planName || 'Free'

  const renderNavItem = (item: NavItem) => {
    const isActive = currentView === item.view
    const Icon = item.icon

    if (userSidebarCollapsed) {
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
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator-collapsed"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-amber-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {t(item.labelKey)}
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
              ? 'bg-amber-500/15 text-amber-500'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }
        `}
      >
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="truncate">{t(item.labelKey)}</span>
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator-expanded"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-amber-500"
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Search className="h-5 w-5" />
          </div>
          {!userSidebarCollapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold tracking-tight text-white block truncate">
                BW Finder
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lead Intelligence</span>
            </div>
          )}
        </div>
        {!userSidebarCollapsed && (
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
      {!userSidebarCollapsed && (
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

      {/* Navigation - scrollable area takes all available space */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-3">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.titleKey}>
              {!userSidebarCollapsed && (
                <h3 className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {t(group.titleKey)}
                </h3>
              )}
              {userSidebarCollapsed && <div className="my-1" />}
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-slate-700/50 shrink-0" />

      {/* User section - compact, fixed at bottom */}
      <div className="p-3 shrink-0">
        {userSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-center">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{planLabel} Plan</p>
                </div>
              </TooltipContent>
            </Tooltip>
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-slate-800"
                    onClick={() => {
                      setActivePanel('admin')
                      setCurrentAdminView('admin-dashboard')
                    }}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Admin Panel</TooltipContent>
              </Tooltip>
            )}
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
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${planBadgeColor(user?.planName?.toLowerCase())}`}
                  >
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    {planLabel}
                  </Badge>
                  {user?.credits !== undefined && (
                    <span className="text-[10px] text-slate-500">{user.credits} credits</span>
                  )}
                </div>
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
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 text-xs"
                  onClick={() => {
                    setActivePanel('admin')
                    setCurrentAdminView('admin-dashboard')
                  }}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Button>
              )}
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
          onClick={toggleUserSidebar}
        >
          {userSidebarCollapsed ? (
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
          ${userSidebarCollapsed ? 'w-20' : 'w-[280px]'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
