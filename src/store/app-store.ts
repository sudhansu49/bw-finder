'use client'

import { create } from 'zustand'

export type View = 'dashboard' | 'search' | 'leads' | 'businesses' | 'audit' | 'proposal' | 'outreach' | 'whatsapp' | 'email' | 'services' | 'settings'

interface User {
  id: string
  email: string
  name: string
  company: string | null
}

interface AppState {
  currentView: View
  setCurrentView: (view: View) => void
  user: User | null
  setUser: (user: User | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchResults: any[]
  setSearchResults: (results: any[]) => void
  selectedBusiness: any | null
  setSelectedBusiness: (business: any | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  user: null,
  setUser: (user) => set({ user }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  selectedBusiness: null,
  setSelectedBusiness: (business) => set({ selectedBusiness: business }),
}))
