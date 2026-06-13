'use client'

import { useState, useEffect } from 'react'
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
import { ProfileView } from '@/components/profile/profile-view'
import { BillingView } from '@/components/billing/billing-view'
import { SubscriptionView } from '@/components/subscription/subscription-view'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { HelpView } from '@/components/help/help-view'
import { ReportsView } from '@/components/reports/reports-view'
import { OutreachView } from '@/components/outreach/outreach-view'
import { BusinessDetailDrawer } from '@/components/businesses/business-detail-drawer'
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
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Crown,
  CreditCard,
  Shield,
  ArrowLeftRight,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { CurrencySwitcher } from '@/components/layout/currency-switcher'
import { useTranslation } from '@/lib/i18n/hooks'

// ─── View Labels & Groups ────────────────────────────────────────────────────

const viewLabels: Record<UserView, string> = {
  'user-dashboard': 'Dashboard',
  'user-lead-finder': 'Lead Finder',
  'user-website-detection': 'Website Detection',
  'user-lead-scoring': 'Lead Scoring',
  'user-outreach': 'Outreach',
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
  'user-outreach': 'Overview',
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

// All views are now imported as proper components - no more placeholders

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
            case 'user-outreach':
              return <OutreachView />
            case 'user-exports':
              return <ExportView />
            case 'user-settings':
              return <SettingsView />
            case 'user-reports':
              return <ReportsView />
            case 'user-profile':
              return <ProfileView />
            case 'user-billing':
              return <BillingView />
            case 'user-subscription':
              return <SubscriptionView />
            case 'user-notifications':
              return <NotificationsView />
            case 'user-help':
              return <HelpView />
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
    setAuthMode,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    setUser,
    setCurrentView,
    setActivePanel,
    setCurrentAdminView,
  } = useAppStore()

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const { theme, setTheme } = useTheme()
  const { t, translations: tr } = useTranslation()
  const [notificationCount, setNotificationCount] = useState(0)

  // Fetch real unread notification count
  useEffect(() => {
    if (!user?.id) return
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/user/notifications?limit=1', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setNotificationCount(data.unreadCount ?? 0)
        }
      } catch {
        // Silent fail
      }
    }
    fetchCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Translated view labels
  const translatedViewLabels: Record<UserView, string> = {
    'user-dashboard': t('nav.dashboard'),
    'user-lead-finder': t('nav.leadFinder'),
    'user-website-detection': t('nav.websiteDetection'),
    'user-lead-scoring': t('nav.leadScoring'),
    'user-outreach': t('nav.outreach'),
    'user-audit': t('nav.aiAudit'),
    'user-proposal': t('nav.proposalGenerator'),
    'user-whatsapp': t('nav.whatsappGenerator'),
    'user-email': t('nav.emailGenerator'),
    'user-crm': t('nav.crm'),
    'user-reports': t('nav.reports'),
    'user-exports': t('nav.exports'),
    'user-settings': t('nav.settings'),
    'user-profile': t('nav.profile'),
    'user-billing': t('nav.billing'),
    'user-subscription': t('nav.subscription'),
    'user-notifications': t('nav.notifications'),
    'user-help': t('nav.helpCenter'),
  }

  // Translated view groups
  const translatedViewGroups: Record<UserView, string> = {
    'user-dashboard': t('nav.overview'),
    'user-lead-finder': t('nav.overview'),
    'user-website-detection': t('nav.overview'),
    'user-lead-scoring': t('nav.overview'),
    'user-outreach': t('nav.overview'),
    'user-audit': t('nav.tools'),
    'user-proposal': t('nav.tools'),
    'user-whatsapp': t('nav.tools'),
    'user-email': t('nav.tools'),
    'user-crm': t('nav.tools'),
    'user-reports': t('nav.output'),
    'user-exports': t('nav.output'),
    'user-settings': t('nav.account'),
    'user-profile': t('nav.account'),
    'user-billing': t('nav.account'),
    'user-subscription': t('nav.account'),
    'user-notifications': t('nav.account'),
    'user-help': t('nav.account'),
  }

  const viewLabel = translatedViewLabels[currentView] || 'Dashboard'
  const viewGroup = translatedViewGroups[currentView] || t('nav.overview')
  const initials = user?.name ? getInitials(user.name) : 'U'

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <UserSidebar />

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

                {/* User Panel Badge */}
                <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 font-semibold">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  User Panel
                </Badge>

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
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Currency Switcher */}
                <CurrencySwitcher />

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
                      onClick={() => setCurrentView('user-notifications')}
                    >
                      <Bell className="h-4 w-4" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{notificationCount} notification{notificationCount !== 1 ? 's' : ''}</TooltipContent>
                </Tooltip>

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
                        className={`hidden lg:inline-flex text-[10px] px-1.5 py-0 ${planBadgeColorLight(user?.planName?.toLowerCase())}`}
                      >
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        {(user?.planName || 'Free')}
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
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-billing')}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('nav.billing')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('user-subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      {t('nav.subscription')}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setActivePanel('admin')
                            setCurrentAdminView('admin-dashboard')
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Switch to Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => {
                        sessionStorage.setItem('bw-finder-logged-out', 'true')
                        setUser(null)
                        setAuthMode('user')
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
              <ViewRenderer view={currentView} />
            </div>
            {/* Footer inside scroll area */}
            <footer className="border-t bg-white dark:bg-slate-900 py-3 px-4 lg:px-6 mt-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center">
                    <Search className="h-3 w-3 text-white" />
                  </div>
                  <span>{t('footer.copyright')} &copy; {new Date().getFullYear()}</span>
                </div>
                <p>{t('footer.tagline')}</p>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Business Detail Drawer - available across all user views */}
      <BusinessDetailDrawer />
    </div>
  )
}
