'use client'

import { useAppStore, type AdminView } from '@/store/app-store'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminUsers } from '@/components/admin/admin-users'
import { AdminSubscriptions } from '@/components/admin/admin-subscriptions'
import { AdminCredits } from '@/components/admin/admin-credits'
import {
  AdminAgencies,
  AdminPayments,
  AdminTransactions,
  AdminLeads,
  AdminCategories,
  AdminLocations,
  AdminApiUsage,
  AdminSystemHealth,
  AdminAuditLogs,
  AdminReports,
  AdminSupport,
  AdminAnnouncements,
  AdminEmailBroadcast,
  AdminWhatsappBroadcast,
  AdminMarketing,
  AdminIntegrations,
  AdminAiUsage,
  AdminFeatureFlags,
  AdminSettings,
} from '@/components/admin/admin-other-pages'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Shield,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ArrowLeftRight,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

const viewLabels: Record<AdminView, string> = {
  'admin-dashboard': 'Dashboard',
  'admin-users': 'Users',
  'admin-agencies': 'Agencies',
  'admin-subscriptions': 'Subscriptions',
  'admin-payments': 'Payments',
  'admin-transactions': 'Transactions',
  'admin-leads': 'Leads',
  'admin-categories': 'Categories',
  'admin-locations': 'Locations',
  'admin-credits': 'Credits',
  'admin-api-usage': 'API Usage',
  'admin-system-health': 'System Health',
  'admin-audit-logs': 'Audit Logs',
  'admin-reports': 'Reports',
  'admin-support': 'Support Tickets',
  'admin-announcements': 'Announcements',
  'admin-email-broadcast': 'Email Broadcast',
  'admin-whatsapp-broadcast': 'WhatsApp Broadcast',
  'admin-marketing': 'Marketing',
  'admin-integrations': 'Integrations',
  'admin-ai-usage': 'AI Usage',
  'admin-feature-flags': 'Feature Flags',
  'admin-settings': 'Settings',
}

const viewGroups: Record<string, string> = {
  'admin-dashboard': 'Main',
  'admin-users': 'Main',
  'admin-agencies': 'Main',
  'admin-subscriptions': 'Main',
  'admin-payments': 'Main',
  'admin-transactions': 'Main',
  'admin-leads': 'Data',
  'admin-categories': 'Data',
  'admin-locations': 'Data',
  'admin-credits': 'Data',
  'admin-api-usage': 'System',
  'admin-system-health': 'System',
  'admin-audit-logs': 'System',
  'admin-reports': 'System',
  'admin-support': 'Support',
  'admin-announcements': 'Support',
  'admin-email-broadcast': 'Marketing',
  'admin-whatsapp-broadcast': 'Marketing',
  'admin-marketing': 'Marketing',
  'admin-integrations': 'Config',
  'admin-ai-usage': 'Config',
  'admin-feature-flags': 'Config',
  'admin-settings': 'Config',
}

function ViewRenderer({ view }: { view: AdminView }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {(() => {
          switch (view) {
            case 'admin-dashboard':
              return <AdminDashboard />
            case 'admin-users':
              return <AdminUsers />
            case 'admin-subscriptions':
              return <AdminSubscriptions />
            case 'admin-credits':
              return <AdminCredits />
            case 'admin-agencies':
              return <AdminAgencies />
            case 'admin-payments':
              return <AdminPayments />
            case 'admin-transactions':
              return <AdminTransactions />
            case 'admin-leads':
              return <AdminLeads />
            case 'admin-categories':
              return <AdminCategories />
            case 'admin-locations':
              return <AdminLocations />
            case 'admin-api-usage':
              return <AdminApiUsage />
            case 'admin-system-health':
              return <AdminSystemHealth />
            case 'admin-audit-logs':
              return <AdminAuditLogs />
            case 'admin-reports':
              return <AdminReports />
            case 'admin-support':
              return <AdminSupport />
            case 'admin-announcements':
              return <AdminAnnouncements />
            case 'admin-email-broadcast':
              return <AdminEmailBroadcast />
            case 'admin-whatsapp-broadcast':
              return <AdminWhatsappBroadcast />
            case 'admin-marketing':
              return <AdminMarketing />
            case 'admin-integrations':
              return <AdminIntegrations />
            case 'admin-ai-usage':
              return <AdminAiUsage />
            case 'admin-feature-flags':
              return <AdminFeatureFlags />
            case 'admin-settings':
              return <AdminSettings />
            default:
              return <AdminDashboard />
          }
        })()}
      </motion.div>
    </AnimatePresence>
  )
}

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
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
    case 'admin':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
    case 'agency_owner':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
  }
}

export function AdminLayout() {
  const {
    currentAdminView,
    user,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    setUser,
    setAuthMode,
    setActivePanel,
    setCurrentView,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  const notificationCount = 3

  const viewLabel = viewLabels[currentAdminView] || 'Dashboard'
  const viewGroup = viewGroups[currentAdminView] || 'Main'

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Fixed header */}
          <header className="bg-white dark:bg-slate-900 border-b h-16 shrink-0 z-30">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              {/* Left: Mobile menu + Breadcrumb */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Admin Panel Badge */}
                <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 font-semibold">
                  <Shield className="h-2.5 w-2.5" />
                  Admin Panel
                </Badge>

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink className="cursor-pointer text-muted-foreground hover:text-red-600">
                        Admin Console
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink className="text-muted-foreground">
                        {viewGroup}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium text-foreground">
                        {viewLabel}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1">
                {/* Search shortcut */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search (⌘K)</TooltipContent>
                </Tooltip>

                {/* Dark mode toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>

                {/* Notifications */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                      onClick={() => useAppStore.getState().setNotificationsOpen(true)}
                    >
                      <Bell className="h-4 w-4" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{notificationCount} notifications</TooltipContent>
                </Tooltip>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 text-xs font-bold">
                          {user?.name ? getInitials(user.name) : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">
                        {user?.name || 'Admin'}
                      </span>
                      <Badge
                        variant="outline"
                        className={`hidden lg:inline-flex text-[10px] px-1.5 py-0 ${roleBadgeColor(user?.role || 'admin')}`}
                      >
                        {(user?.role || 'admin').replace('_', ' ')}
                      </Badge>
                      <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useAppStore.getState().setCurrentAdminView('admin-settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-amber-600 focus:text-amber-600 dark:text-amber-400 dark:focus:text-amber-400"
                      onClick={() => {
                        setActivePanel('user')
                        setCurrentView('user-dashboard')
                      }}
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Switch to User Panel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => {
                        sessionStorage.setItem('bw-finder-logged-out', 'true')
                        setUser(null)
                        setAuthMode('admin')
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 min-h-0 overflow-auto">
            <div className="p-4 lg:p-6">
              <ViewRenderer view={currentAdminView} />
            </div>
            {/* Footer inside scroll area */}
            <footer className="border-t bg-white dark:bg-slate-900 py-3 px-4 lg:px-6 mt-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-red-600 flex items-center justify-center">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <span>Admin Console &copy; {new Date().getFullYear()}</span>
                </div>
                <p>Enterprise Management Console</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
