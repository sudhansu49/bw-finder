'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocaleCode, CurrencyCode } from '@/lib/i18n/types'

// ─── Role & Permission Types ─────────────────────────────────────────────────

export type Role = 'super_admin' | 'admin' | 'agency_owner' | 'team_member' | 'user'

export type AdminView =
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-agencies'
  | 'admin-subscriptions'
  | 'admin-payments'
  | 'admin-transactions'
  | 'admin-leads'
  | 'admin-categories'
  | 'admin-locations'
  | 'admin-credits'
  | 'admin-api-usage'
  | 'admin-system-health'
  | 'admin-audit-logs'
  | 'admin-reports'
  | 'admin-support'
  | 'admin-announcements'
  | 'admin-email-broadcast'
  | 'admin-whatsapp-broadcast'
  | 'admin-marketing'
  | 'admin-integrations'
  | 'admin-ai-usage'
  | 'admin-feature-flags'
  | 'admin-security'
  | 'admin-roles'
  | 'admin-sessions'
  | 'admin-settings'

export type UserView =
  | 'user-dashboard'
  | 'user-lead-finder'
  | 'user-website-detection'
  | 'user-lead-scoring'
  | 'user-outreach'
  | 'user-audit'
  | 'user-proposal'
  | 'user-whatsapp'
  | 'user-email'
  | 'user-crm'
  | 'user-reports'
  | 'user-exports'
  | 'user-settings'
  | 'user-profile'
  | 'user-billing'
  | 'user-subscription'
  | 'user-notifications'
  | 'user-help'

export type AuthMode = 'user' | 'admin'

interface AppUser {
  id: string
  email: string
  name: string
  company: string | null
  role: Role
  avatar?: string | null
  credits: number
  planId?: string | null
  planName?: string
  planTier?: string
  agencyId?: string | null
  status: string
}

interface AppState {
  user: AppUser | null
  setUser: (user: AppUser | null) => void
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void
  activePanel: 'user' | 'admin'
  setActivePanel: (panel: 'user' | 'admin') => void
  currentView: UserView
  setCurrentView: (view: UserView) => void
  currentAdminView: AdminView
  setCurrentAdminView: (view: AdminView) => void
  userSidebarCollapsed: boolean
  setUserSidebarCollapsed: (collapsed: boolean) => void
  toggleUserSidebar: () => void
  adminSidebarCollapsed: boolean
  setAdminSidebarCollapsed: (collapsed: boolean) => void
  toggleAdminSidebar: () => void
  sidebarMobileOpen: boolean
  setSidebarMobileOpen: (open: boolean) => void
  searchResults: any[]
  setSearchResults: (results: any[]) => void
  selectedBusiness: any | null
  setSelectedBusiness: (business: any | null) => void
  businessDetailOpen: boolean
  setBusinessDetailOpen: (open: boolean) => void
  openBusinessDetail: (business: any) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      authMode: 'user',
      setAuthMode: (mode) => set({ authMode: mode }),
      activePanel: 'user',
      setActivePanel: (panel) => set({
        activePanel: panel,
        userSidebarCollapsed: false,
        adminSidebarCollapsed: false,
      }),
      currentView: 'user-dashboard',
      setCurrentView: (view) => set({ currentView: view }),
      currentAdminView: 'admin-dashboard',
      setCurrentAdminView: (view) => set({ currentAdminView: view }),
      userSidebarCollapsed: false,
      setUserSidebarCollapsed: (collapsed) => set({ userSidebarCollapsed: collapsed }),
      toggleUserSidebar: () => set((s) => ({ userSidebarCollapsed: !s.userSidebarCollapsed })),
      adminSidebarCollapsed: false,
      setAdminSidebarCollapsed: (collapsed) => set({ adminSidebarCollapsed: collapsed }),
      toggleAdminSidebar: () => set((s) => ({ adminSidebarCollapsed: !s.adminSidebarCollapsed })),
      sidebarMobileOpen: false,
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      selectedBusiness: null,
      setSelectedBusiness: (business) => set({ selectedBusiness: business }),
      businessDetailOpen: false,
      setBusinessDetailOpen: (open) => set({ businessDetailOpen: open }),
      openBusinessDetail: (business) => set({ selectedBusiness: business, businessDetailOpen: true }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'bw-finder-store',
      partialize: (state) => ({
        activePanel: state.activePanel,
        userSidebarCollapsed: state.userSidebarCollapsed,
        adminSidebarCollapsed: state.adminSidebarCollapsed,
        authMode: state.authMode,
        locale: state.locale,
        currency: state.currency,
      }),
      skipHydration: true,
    }
  )
)
