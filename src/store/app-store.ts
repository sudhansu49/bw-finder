'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

// Which auth screen to show: 'user' login or 'admin' login
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
  agencyId?: string | null
  status: string
}

interface AppState {
  // Auth
  user: AppUser | null
  setUser: (user: AppUser | null) => void
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void

  // Panel (derived from role after login - NO manual switching)
  activePanel: 'user' | 'admin'
  setActivePanel: (panel: 'user' | 'admin') => void

  // User Panel views
  currentView: UserView
  setCurrentView: (view: UserView) => void

  // Admin Panel views
  currentAdminView: AdminView
  setCurrentAdminView: (view: AdminView) => void

  // Sidebar state - separate per panel
  userSidebarCollapsed: boolean
  setUserSidebarCollapsed: (collapsed: boolean) => void
  toggleUserSidebar: () => void
  adminSidebarCollapsed: boolean
  setAdminSidebarCollapsed: (collapsed: boolean) => void
  toggleAdminSidebar: () => void
  sidebarMobileOpen: boolean
  setSidebarMobileOpen: (open: boolean) => void

  // Search results
  searchResults: any[]
  setSearchResults: (results: any[]) => void
  selectedBusiness: any | null
  setSelectedBusiness: (business: any | null) => void

  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  // Notifications panel
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      authMode: 'user',
      setAuthMode: (mode) => set({ authMode: mode }),

      // Panel - set automatically based on login
      activePanel: 'user',
      setActivePanel: (panel) => set({
        activePanel: panel,
        userSidebarCollapsed: false,
        adminSidebarCollapsed: false,
      }),

      // User Panel views
      currentView: 'user-dashboard',
      setCurrentView: (view) => set({ currentView: view }),

      // Admin Panel views
      currentAdminView: 'admin-dashboard',
      setCurrentAdminView: (view) => set({ currentAdminView: view }),

      // Sidebar - separate per panel
      userSidebarCollapsed: false,
      setUserSidebarCollapsed: (collapsed) => set({ userSidebarCollapsed: collapsed }),
      toggleUserSidebar: () => set((s) => ({ userSidebarCollapsed: !s.userSidebarCollapsed })),
      adminSidebarCollapsed: false,
      setAdminSidebarCollapsed: (collapsed) => set({ adminSidebarCollapsed: collapsed }),
      toggleAdminSidebar: () => set((s) => ({ adminSidebarCollapsed: !s.adminSidebarCollapsed })),
      sidebarMobileOpen: false,
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

      // Search
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      selectedBusiness: null,
      setSelectedBusiness: (business) => set({ selectedBusiness: business }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Notifications
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
    }),
    {
      name: 'bw-finder-store',
      partialize: (state) => ({
        activePanel: state.activePanel,
        userSidebarCollapsed: state.userSidebarCollapsed,
        adminSidebarCollapsed: state.adminSidebarCollapsed,
        authMode: state.authMode,
      }),
      // Skip hydration to avoid SSR/client mismatch — rehydrate after mount
      skipHydration: true,
    }
  )
)
