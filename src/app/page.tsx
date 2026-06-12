'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { AuthPage } from '@/components/layout/auth-page'
import { AdminLoginPage } from '@/components/auth/admin-login-page'
import { UserLayout } from '@/components/user/user-layout'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function Home() {
  const { user, activePanel, authMode } = useAppStore()

  // Rehydrate Zustand persisted store after mount (skipHydration is enabled)
  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  // Auto-seed database on first load
  useEffect(() => {
    const seedIfNeeded = async () => {
      try {
        const seeded = localStorage.getItem('bw-finder-seeded')
        if (!seeded) {
          await fetch('/api/seed', { method: 'POST' })
          localStorage.setItem('bw-finder-seeded', 'true')
        }
      } catch {
        // Silent fail - seed might already exist
      }
    }
    seedIfNeeded()
  }, [])

  // Persist user session in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('bw-finder-user')
    const explicitLogout = sessionStorage.getItem('bw-finder-logged-out')
    if (savedUser && !user && !explicitLogout) {
      try {
        const parsed = JSON.parse(savedUser)
        useAppStore.getState().setUser(parsed)
      } catch {
        localStorage.removeItem('bw-finder-user')
      }
    }
    if (explicitLogout) {
      sessionStorage.removeItem('bw-finder-logged-out')
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('bw-finder-user', JSON.stringify(user))
      sessionStorage.removeItem('bw-finder-logged-out')
    } else {
      localStorage.removeItem('bw-finder-user')
    }
  }, [user])

  // ─── Routing Logic ─────────────────────────────────────────────────────────
  // COMPLETELY SEPARATE: Admin and User panels render independently
  // No shared state between panels beyond auth

  // Not authenticated - show auth page based on mode
  if (!user) {
    if (authMode === 'admin') {
      return <AdminLoginPage />
    }
    return <AuthPage />
  }

  // Authenticated - route to the correct panel
  // Admin panel and User panel are COMPLETELY SEPARATE
  if (activePanel === 'admin') {
    return <AdminLayout />
  }

  return <UserLayout />
}
