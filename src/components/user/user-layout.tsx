'use client'

import { useAppStore, type UserView } from '@/store/app-store'
import { UserSidebar } from '@/components/user/user-sidebar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { SearchView } from '@/components/search/search-view'
import { LeadsView } from '@/components/leads/leads-view'
import { BusinessesView } from '@/components/businesses/businesses-view'
import { AuditView } from '@/components/audit/audit-view'
import { ProposalView } from '@/components/proposal/proposal-view'
import { WhatsAppView } from '@/components/whatsapp/whatsapp-view'
import { EmailView } from '@/components/email/email-view'
import { CRMView } from '@/components/crm/crm-view'
import { ExportView } from '@/components/export/export-view'
import { SettingsView } from '@/components/settings/settings-view'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  Search,
  Bell,
  Moon,
  Menu,
  ArrowLeftRight,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Crown,
  CreditCard,
  BarChart3,
  LifeBuoy,
  Shield,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

// ─── View Labels & Groups ────────────────────────────────────────────────────

const viewLabels: Record<UserView, string> = {
  'user-dashboard': 'Dashboard',
  'user-lead-finder': 'Lead Finder',
  'user-website-detection': 'Website Detection',
  'user-lead-scoring': 'Lead Scoring',
  'user-audit': 'AI Audit',
  'user-proposal': 'Proposal Generator',
  'user-whatsapp': 'WhatsApp Generator',
  'user-email': 'Email Generator',
  'user-crm': 'CRM',
  'user-reports': 'Reports',
  'user-exports': 'Exports',
  'user-settings': 'Settings',
  'user-profile': 'Profile',
  'user-billing': 'Billing',
  'user-subscription': 'Subscription',
  'user-notifications': 'Notifications',
  'user-help': 'Help Center',
}

const viewGroups: Record<UserView, string> = {
  'user-dashboard': 'Overview',
  'user-lead-finder': 'Overview',
  'user-website-detection': 'Overview',
  'user-lead-scoring': 'Overview',
  'user-audit': 'Tools',
  'user-proposal': 'Tools',
  'user-whatsapp': 'Tools',
  'user-email': 'Tools',
  'user-crm': 'Tools',
  'user-reports': 'Output',
  'user-exports': 'Output',
  'user-settings': 'Account',
  'user-profile': 'Account',
  'user-billing': 'Account',
  'user-subscription': 'Account',
  'user-notifications': 'Account',
  'user-help': 'Account',
}

// ─── Placeholder Views ───────────────────────────────────────────────────────

function PlaceholderView({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
          <Badge variant="outline" className="mt-4 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

function UserProfileView() {
  return (
    <PlaceholderView
      title="Profile"
      description="Manage your personal information, avatar, and account preferences. Update your name, email, and other details."
      icon={User}
    />
  )
}

function UserBillingView() {
  return (
    <PlaceholderView
      title="Billing"
      description="View your billing history, manage payment methods, download invoices, and track your spending."
      icon={CreditCard}
    />
  )
}

function UserSubscriptionView() {
  return (
    <PlaceholderView
      title="Subscription"
      description="Manage your subscription plan, upgrade or downgrade, view plan features, and check your usage limits."
      icon={Crown}
    />
  )
}

function UserNotificationsView() {
  return (
    <PlaceholderView
      title="Notifications"
      description="Configure your notification preferences, view recent alerts, and manage email and push notification settings."
      icon={Bell}
    />
  )
}

function UserHelpView() {
  return (
    <PlaceholderView
      title="Help Center"
      description="Access documentation, tutorials, FAQs, and contact support. Get help with any feature or issue."
      icon={LifeBuoy}
    />
  )
}

function UserReportsView() {
  return (
    <PlaceholderView
      title="Reports"
      description="Generate and view detailed reports on your leads, campaigns, outreach performance, and business metrics."
      icon={BarChart3}
    />
  )
}

// ─── View Renderer ───────────────────────────────────────────────────────────

function ViewRenderer({ view }: { view: UserView }) {
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
            case 'user-dashboard':
              return <DashboardView />
            case 'user-lead-finder':
              return <SearchView />
            case 'user-website-detection':
              return <BusinessesView />
            case 'user-lead-scoring':
              return <LeadsView />
            case 'user-audit':
              return <AuditView />
            case 'user-proposal':
              return <ProposalView />
            case 'user-whatsapp':
              return <WhatsAppView />
            case 'user-email':
              return <EmailView />
            case 'user-crm':
              return <CRMView />
            case 'user-exports':
              return <ExportView />
            case 'user-settings':
              return <SettingsView />
            case 'user-reports':
              return <UserReportsView />
            case 'user-profile':
              return <UserProfileView />
            case 'user-billing':
              return <UserBillingView />
            case 'user-subscription':
              return <UserSubscriptionView />
            case 'user-notifications':
              return <UserNotificationsView />
            case 'user-help':
              return <UserHelpView />
            default:
              return <DashboardView />
          }
        })()}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function planBadgeColorLight(plan: string | null | undefined): string {
  switch (plan) {
    case 'pro':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'enterprise':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'starter':
      return 'bg-slate-100 text-slate-600 border-slate-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function UserLayout() {
  const {
    currentView,
    user,
    setActivePanel,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    setUser,
    setCurrentView,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  const notificationCount = 3

  const viewLabel = viewLabels[currentView] || 'Dashboard'
  const viewGroup = viewGroups[currentView] || 'Overview'
  const canSeeAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const initials = user?.name ? getInitials(user.name) : 'U'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-1">
        {/* Sidebar */}
        <UserSidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fixed header */}
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b h-16 shrink-0">
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

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink className="cursor-pointer text-muted-foreground hover:text-amber-600">
                        BW Finder
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
                      <Moon className="h-4 w-4" />
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

                {/* Switch to Admin Panel - only for admin/super_admin */}
                {canSeeAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-amber-600"
                        onClick={() => setActivePanel('admin')}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Switch to Admin Panel</TooltipContent>
                  </Tooltip>
                )}

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">
                        {user?.name || 'User'}
                      </span>
                      <Badge
                        variant="outline"
                        className={`hidden lg:inline-flex text-[10px] px-1.5 py-0 ${planBadgeColorLight(user?.planId)}`}
                      >
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        {(user?.planId || 'free').charAt(0).toUpperCase() + (user?.planId || 'free').slice(1)}
                      </Badge>
                      <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentView('user-profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-billing')}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Subscription
                    </DropdownMenuItem>
                    {canSeeAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setActivePanel('admin')}>
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Switch to Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => {
                        setUser(null)
                        setActivePanel('user')
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
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <ViewRenderer view={currentView} />
          </main>

          {/* Footer */}
          <footer className="border-t bg-white dark:bg-slate-900 py-3 px-4 lg:px-6 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center">
                  <Search className="h-3 w-3 text-white" />
                </div>
                <span>BW Finder &copy; {new Date().getFullYear()}</span>
              </div>
              <p>Find businesses without websites &bull; Close deals faster</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
