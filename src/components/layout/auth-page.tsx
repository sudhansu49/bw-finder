'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { Search, CheckCircle2, Zap, Globe, BarChart3, MessageSquare, Shield } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { setAuthMode } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Left side - Marketing */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">BW Finder</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Find Businesses{' '}
            <span className="text-amber-400">Without Websites</span>
          </h1>

          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Discover local businesses that need your digital services. Search, track, and close deals faster than ever before.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, label: 'AI-Powered Business Discovery' },
              { icon: Globe, label: 'Website Status Detection' },
              { icon: BarChart3, label: 'Lead Pipeline Management' },
              { icon: MessageSquare, label: 'Outreach Tracking' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-slate-200 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Free to start &bull; No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-slate-50 dark:bg-slate-950 relative">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}

          {/* Admin access link - subtle, at bottom */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setAuthMode('admin')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Shield className="h-3 w-3" />
              Admin Console
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
