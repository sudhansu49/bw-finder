'use client'

import { useAppStore, type View } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Search,
  Users,
  Building2,
  MessageSquare,
  Briefcase,
  Settings,
  LogOut,
  X,
  ClipboardCheck,
  FileText,
  Smartphone,
  Mail,
  Kanban,
  BookOpen,
} from 'lucide-react'

const navItems: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'search', label: 'Discover', icon: Search },
  { view: 'leads', label: 'Leads', icon: Users },
  { view: 'businesses', label: 'Businesses', icon: Building2 },
  { view: 'crm', label: 'CRM Pipeline', icon: Kanban },
  { view: 'audit', label: 'Audit', icon: ClipboardCheck },
  { view: 'proposal', label: 'Proposal', icon: FileText },
  { view: 'outreach', label: 'Outreach', icon: MessageSquare },
  { view: 'whatsapp', label: 'WhatsApp AI', icon: Smartphone },
  { view: 'email', label: 'Email AI', icon: Mail },
  { view: 'services', label: 'Services', icon: Briefcase },
  { view: 'api-docs', label: 'API Docs', icon: BookOpen },
  { view: 'settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const { currentView, setCurrentView, user, setUser, sidebarOpen, setSidebarOpen } = useAppStore()

  const handleNavClick = (view: View) => {
    setCurrentView(view)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('dashboard')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
              <Search className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">BW Finder</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-slate-700" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.view
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-amber-400" />
                )}
              </button>
            )
          })}
        </nav>

        <Separator className="bg-slate-700" />

        {/* User section */}
        <div className="p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8 bg-slate-700">
              <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-1 justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
