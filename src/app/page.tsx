'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { AuthPage } from '@/components/layout/auth-page'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { SearchView } from '@/components/search/search-view'
import { LeadsView } from '@/components/leads/leads-view'
import { BusinessesView } from '@/components/businesses/businesses-view'
import { OutreachView } from '@/components/outreach/outreach-view'
import { WhatsAppView } from '@/components/whatsapp/whatsapp-view'
import { EmailView } from '@/components/email/email-view'
import { CRMView } from '@/components/crm/crm-view'
import { ServicesView } from '@/components/services/services-view'
import { SettingsView } from '@/components/settings/settings-view'
import { AuditView } from '@/components/audit/audit-view'
import { ProposalView } from '@/components/proposal/proposal-view'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

function ViewRenderer({ view }: { view: string }) {
  switch (view) {
    case 'dashboard':
      return <DashboardView />
    case 'search':
      return <SearchView />
    case 'leads':
      return <LeadsView />
    case 'businesses':
      return <BusinessesView />
    case 'crm':
      return <CRMView />
    case 'outreach':
      return <OutreachView />
    case 'whatsapp':
      return <WhatsAppView />
    case 'email':
      return <EmailView />
    case 'audit':
      return <AuditView />
    case 'proposal':
      return <ProposalView />
    case 'services':
      return <ServicesView />
    case 'settings':
      return <SettingsView />
    default:
      return <DashboardView />
  }
}

export default function Home() {
  const { user, currentView, sidebarOpen, setSidebarOpen } = useAppStore()

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
    if (savedUser && !user) {
      try {
        const parsed = JSON.parse(savedUser)
        useAppStore.getState().setUser(parsed)
      } catch {
        localStorage.removeItem('bw-finder-user')
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      localStorage.setItem('bw-finder-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('bw-finder-user')
    }
  }, [user])

  // Not authenticated - show auth page
  if (!user) {
    return <AuthPage />
  }

  // Authenticated - show main app
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b bg-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">BW</span>
              </div>
              <span className="font-semibold text-sm">BW Finder</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-8">
            <ViewRenderer view={currentView} />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white py-4 px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">BW</span>
            </div>
            <span>BW Finder &copy; {new Date().getFullYear()}</span>
          </div>
          <p>Find businesses without websites &bull; Close deals faster</p>
        </div>
      </footer>
    </div>
  )
}
