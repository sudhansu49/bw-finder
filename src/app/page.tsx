'use client'

import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { AuthPage } from '@/components/layout/auth-page'
import { AdminLoginPage } from '@/components/auth/admin-login-page'
import { UserLayout } from '@/components/user/user-layout'
import { AdminLayout } from '@/components/admin/admin-layout'

// ─── JWT Token Refresh Logic ────────────────────────────────────────────────
// Access tokens expire every 15 minutes. This helper refreshes them
// automatically when they expire using the refresh token cookie.

async function refreshAccessToken(): Promise<{ user: any; token: string } | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      return { user: data.user, token: data.token }
    }
    return null
  } catch {
    return null
  }
}

export default function Home() {
  const { user, activePanel, authMode, setUser } = useAppStore()

  // Rehydrate Zustand persisted store after mount
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
        // Silent fail
      }
    }
    seedIfNeeded()
  }, [])

  // JWT Cookie-based session verification with auto-refresh
  useEffect(() => {
    const verifySession = async () => {
      const explicitLogout = sessionStorage.getItem('bw-finder-logged-out')
      if (explicitLogout) {
        sessionStorage.removeItem('bw-finder-logged-out')
        return
      }

      // Restore from localStorage first for instant UI
      const savedUser = localStorage.getItem('bw-finder-user')
      if (savedUser && !user) {
        try {
          const parsed = JSON.parse(savedUser)
          useAppStore.getState().setUser(parsed)
        } catch {
          localStorage.removeItem('bw-finder-user')
        }
      }

      // Verify JWT cookie with the server
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            useAppStore.getState().setUser(data.user)
            localStorage.setItem('bw-finder-user', JSON.stringify(data.user))
          }
        } else if (res.status === 401) {
          // Access token expired - try to refresh
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            useAppStore.getState().setUser(refreshed.user)
            localStorage.setItem('bw-finder-user', JSON.stringify(refreshed.user))
          } else {
            // Refresh failed - session expired
            const currentUser = useAppStore.getState().user
            if (currentUser) {
              localStorage.removeItem('bw-finder-user')
              useAppStore.getState().setUser(null)
            }
          }
        }
      } catch {
        // Network error - keep existing session from localStorage
      }
    }
    verifySession()
  }, [])

  // Periodic token refresh (every 14 minutes, access token expires at 15 min)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        useAppStore.getState().setUser(refreshed.user)
        localStorage.setItem('bw-finder-user', JSON.stringify(refreshed.user))
      }
    }, 14 * 60 * 1000) // 14 minutes

    return () => clearInterval(interval)
  }, [user])

  // Persist user session in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('bw-finder-user', JSON.stringify(user))
      sessionStorage.removeItem('bw-finder-logged-out')
    } else {
      localStorage.removeItem('bw-finder-user')
    }
  }, [user])

  // ─── Routing Logic ─────────────────────────────────────────────────────────

  if (!user) {
    if (authMode === 'admin') {
      return <AdminLoginPage />
    }
    return <AuthPage />
  }

  if (activePanel === 'admin') {
    return <AdminLayout />
  }

  return <UserLayout />
}
