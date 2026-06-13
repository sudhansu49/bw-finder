'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, UserPlus } from 'lucide-react'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { setUser, setCurrentView } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, company: company || null }),
        credentials: 'include', // Include cookies for JWT
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setUser(data.user)
      setCurrentView('user-dashboard')
      useAppStore.getState().setActivePanel('user')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-white">
          <UserPlus className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Start finding businesses that need you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-company">Company (optional)</Label>
            <Input
              id="signup-company"
              type="text"
              placeholder="Your company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-amber-600 hover:text-amber-700 font-semibold underline-offset-2 hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
