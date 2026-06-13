'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, type UserView, type AdminView } from '@/store/app-store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
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
  Shield,
  Users,
  Building2,
  DollarSign,
  Receipt,
  Tag,
  MapPin,
  Coins,
  Activity,
  Heart,
  TrendingUp,
  Puzzle,
  Brain,
  ToggleLeft,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react'

// ─── User Panel Navigation ────────────────────────────────────────────────────

const userNavItems: { view: UserView; label: string; icon: React.ElementType; group: string }[] = [
  { view: 'user-dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { view: 'user-lead-finder', label: 'Lead Finder', icon: Search, group: 'Overview' },
  { view: 'user-website-detection', label: 'Website Detection', icon: Globe, group: 'Overview' },
  { view: 'user-lead-scoring', label: 'Lead Scoring', icon: Target, group: 'Overview' },
  { view: 'user-outreach', label: 'Outreach', icon: Megaphone, group: 'Overview' },
  { view: 'user-audit', label: 'AI Audit', icon: ClipboardCheck, group: 'Tools' },
  { view: 'user-proposal', label: 'Proposal Generator', icon: FileText, group: 'Tools' },
  { view: 'user-whatsapp', label: 'WhatsApp Generator', icon: Smartphone, group: 'Tools' },
  { view: 'user-email', label: 'Email Generator', icon: Mail, group: 'Tools' },
  { view: 'user-crm', label: 'CRM', icon: Kanban, group: 'Tools' },
  { view: 'user-reports', label: 'Reports', icon: BarChart3, group: 'Output' },
  { view: 'user-exports', label: 'Exports', icon: Download, group: 'Output' },
  { view: 'user-settings', label: 'Settings', icon: Settings, group: 'Account' },
  { view: 'user-profile', label: 'Profile', icon: User, group: 'Account' },
  { view: 'user-billing', label: 'Billing', icon: CreditCard, group: 'Account' },
  { view: 'user-subscription', label: 'Subscription', icon: Crown, group: 'Account' },
  { view: 'user-notifications', label: 'Notifications', icon: Bell, group: 'Account' },
  { view: 'user-help', label: 'Help Center', icon: LifeBuoy, group: 'Account' },
]

// ─── Admin Panel Navigation ────────────────────────────────────────────────────

const adminNavItems: { view: AdminView; label: string; icon: React.ElementType; group: string }[] = [
  { view: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Main' },
  { view: 'admin-users', label: 'Users', icon: Users, group: 'Main' },
  { view: 'admin-agencies', label: 'Agencies', icon: Building2, group: 'Main' },
  { view: 'admin-subscriptions', label: 'Subscriptions', icon: CreditCard, group: 'Main' },
  { view: 'admin-payments', label: 'Payments', icon: DollarSign, group: 'Main' },
  { view: 'admin-transactions', label: 'Transactions', icon: Receipt, group: 'Main' },
  { view: 'admin-leads', label: 'Leads', icon: Target, group: 'Data' },
  { view: 'admin-categories', label: 'Categories', icon: Tag, group: 'Data' },
  { view: 'admin-locations', label: 'Locations', icon: MapPin, group: 'Data' },
  { view: 'admin-credits', label: 'Credits', icon: Coins, group: 'Data' },
  { view: 'admin-api-usage', label: 'API Usage', icon: Activity, group: 'System' },
  { view: 'admin-system-health', label: 'System Health', icon: Heart, group: 'System' },
  { view: 'admin-audit-logs', label: 'Audit Logs', icon: FileText, group: 'System' },
  { view: 'admin-reports', label: 'Reports', icon: BarChart3, group: 'System' },
  { view: 'admin-support', label: 'Support', icon: LifeBuoy, group: 'Support' },
  { view: 'admin-announcements', label: 'Announcements', icon: Megaphone, group: 'Support' },
  { view: 'admin-email-broadcast', label: 'Email Broadcast', icon: Mail, group: 'Marketing' },
  { view: 'admin-whatsapp-broadcast', label: 'WhatsApp Broadcast', icon: Smartphone, group: 'Marketing' },
  { view: 'admin-marketing', label: 'Marketing', icon: TrendingUp, group: 'Marketing' },
  { view: 'admin-integrations', label: 'Integrations', icon: Puzzle, group: 'Config' },
  { view: 'admin-ai-usage', label: 'AI Usage', icon: Brain, group: 'Config' },
  { view: 'admin-feature-flags', label: 'Feature Flags', icon: ToggleLeft, group: 'Config' },
  { view: 'admin-settings', label: 'Settings', icon: Settings, group: 'Config' },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    activePanel,
    user,
    setCurrentView,
    setCurrentAdminView,
    setActivePanel,
    setUser,
    setAuthMode,
  } = useAppStore()

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleUserNav = useCallback((view: UserView) => {
    setCurrentView(view)
    setCommandPaletteOpen(false)
  }, [setCurrentView, setCommandPaletteOpen])

  const handleAdminNav = useCallback((view: AdminView) => {
    setCurrentAdminView(view)
    setCommandPaletteOpen(false)
  }, [setCurrentAdminView, setCommandPaletteOpen])

  const handleSwitchPanel = useCallback(() => {
    if (activePanel === 'user') {
      setActivePanel('admin')
      setCurrentAdminView('admin-dashboard')
    } else {
      setActivePanel('user')
      setCurrentView('user-dashboard')
    }
    setCommandPaletteOpen(false)
  }, [activePanel, setActivePanel, setCurrentAdminView, setCurrentView, setCommandPaletteOpen])

  const handleLogout = useCallback(() => {
    sessionStorage.setItem('bw-finder-logged-out', 'true')
    setUser(null)
    setAuthMode(activePanel === 'admin' ? 'admin' : 'user')
    setCommandPaletteOpen(false)
  }, [activePanel, setUser, setAuthMode, setCommandPaletteOpen])

  // Group items by their group property
  const groupByLabel = <T extends { group: string }>(items: T[]): { label: string; items: T[] }[] => {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const list = map.get(item.group) || []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder={activePanel === 'admin' ? 'Search admin console...' : 'Search BW Finder...'} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {activePanel === 'user' ? (
          <>
            {groupByLabel(userNavItems).map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.view}
                      onSelect={() => handleUserNav(item.view)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-amber-500" />
                      <span>{item.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            {isAdmin && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Switch">
                  <CommandItem onSelect={handleSwitchPanel} className="flex items-center gap-3 cursor-pointer">
                    <Shield className="h-4 w-4 text-red-500" />
                    <span>Switch to Admin Panel</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        ) : (
          <>
            {groupByLabel(adminNavItems).map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.view}
                      onSelect={() => handleAdminNav(item.view)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-red-500" />
                      <span>{item.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading="Switch">
              <CommandItem onSelect={handleSwitchPanel} className="flex items-center gap-3 cursor-pointer">
                <ArrowLeftRight className="h-4 w-4 text-amber-500" />
                <span>Switch to User Panel</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={handleLogout} className="flex items-center gap-3 cursor-pointer text-red-600">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
