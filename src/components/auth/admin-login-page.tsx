'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react'

export function AdminLoginPage() {
  const { setUser, setActivePanel, setCurrentAdminView, setAuthMode } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Check if user has admin access
      const role = data.user?.role
      if (role !== 'super_admin' && role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        return
      }

      // Set user and go directly to admin panel
      setUser(data.user)
      setActivePanel('admin')
      setCurrentAdminView('admin-dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Admin Branding */}
      <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-600 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-800 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/25">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight">Admin Console</span>
              <span className="block text-xs text-red-400 uppercase tracking-widest">BW Finder</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Enterprise{' '}
            <span className="text-red-400">Control Center</span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Manage users, subscriptions, credits, and platform operations. Authorized personnel only.
          </p>

          <div className="space-y-4">
            {[
              { icon: Shield, label: 'Role-Based Access Control' },
              { icon: Lock, label: 'Audit Logging & IP Tracking' },
              { icon: Eye, label: 'Real-time System Monitoring' },
              { icon: AlertTriangle, label: 'Critical Alerts & Notifications' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400 shrink-0">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-gray-300 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-2 text-sm text-red-400/80">
            <Lock className="h-4 w-4" />
            <span>Restricted access &bull; Admin credentials required</span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-gray-950">
        <Card className="w-full max-w-md shadow-2xl border-gray-800 bg-gray-900 border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/25">
              <Shield className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to the management console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-300">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@finder.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/25"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In to Console
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('user')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to User Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
