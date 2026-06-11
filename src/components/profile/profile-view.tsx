'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  Lock,
  Globe,
  Calendar,
  Trash2,
  AlertTriangle,
  Save,
  Camera,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    agency_owner: 'Agency Owner',
    team_member: 'Team Member',
    user: 'User',
  }
  return map[role] || role
}

function roleBadgeStyle(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
    case 'admin':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
    case 'agency_owner':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
    case 'team_member':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
  }
}

function planBadgeStyle(plan: string | null | undefined): string {
  switch ((plan || '').toLowerCase()) {
    case 'pro':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
    case 'enterprise':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
    case 'starter':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
  }
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// ─── Timezone / Language / DateFormat Options ─────────────────────────────────

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
]

// ─── Connected Account Type ───────────────────────────────────────────────────

interface ConnectedAccount {
  provider: string
  label: string
  connected: boolean
  email?: string
  icon: React.ElementType
  color: string
}

const defaultAccounts: ConnectedAccount[] = [
  {
    provider: 'google',
    label: 'Google',
    connected: true,
    email: 'alex.johnson@gmail.com',
    icon: Globe,
    color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
  {
    provider: 'linkedin',
    label: 'LinkedIn',
    connected: false,
    icon: ExternalLink,
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
  },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileView() {
  const { user, setUser } = useAppStore()
  const { toast } = useToast()

  // Pre-fill from store, with realistic demo fallbacks
  const displayName = user?.name || 'Alex Johnson'
  const displayEmail = user?.email || 'alex.johnson@agency.com'
  const displayCompany = user?.company || 'Digital Growth Agency'
  const displayRole = user?.role || 'agency_owner'
  const displayPlan = user?.planName || 'Pro'
  const displayCredits = user?.credits ?? 250

  // Personal info form
  const [personalForm, setPersonalForm] = useState({
    name: displayName,
    email: displayEmail,
    phone: '+1 (555) 842-3190',
    company: displayCompany,
    jobTitle: 'Lead Generation Manager',
    location: 'San Francisco, CA',
  })
  const [personalLoading, setPersonalLoading] = useState(false)

  // Account settings
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [language, setLanguage] = useState('en')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Security
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Connected accounts
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(defaultAccounts)

  // Delete account confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // ── Handlers ──

  const handleSavePersonal = async () => {
    setPersonalLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      if (user) {
        setUser({
          ...user,
          name: personalForm.name,
          email: personalForm.email,
          company: personalForm.company || null,
        })
      }
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved successfully.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setPersonalLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSettingsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      toast({
        title: 'Settings Saved',
        description: 'Your account preferences have been updated.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      })
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      })
      return
    }
    if (passwordForm.new.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'New password must be at least 8 characters long.',
        variant: 'destructive',
      })
      return
    }
    setPasswordLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setPasswordForm({ current: '', new: '', confirm: '' })
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactor(enabled)
    toast({
      title: enabled ? '2FA Enabled' : '2FA Disabled',
      description: enabled
        ? 'Two-factor authentication is now active on your account.'
        : 'Two-factor authentication has been turned off.',
    })
  }

  const handleToggleAccount = (provider: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.provider === provider ? { ...a, connected: !a.connected } : a
      )
    )
    const account = accounts.find((a) => a.provider === provider)
    toast({
      title: account?.connected ? `${account.label} Disconnected` : `${account?.label} Connected`,
      description: account?.connected
        ? `Your ${account?.label} account has been disconnected.`
        : `Your ${account?.label} account has been linked successfully.`,
    })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type DELETE to confirm account deletion.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Account Deletion Requested',
      description: 'Your account will be deleted within 30 days. Contact support to cancel.',
      variant: 'destructive',
    })
    setDeleteConfirm('')
  }

  // ── Render ──

  const initials = getInitials(personalForm.name || 'U')
  const joinDate = 'January 15, 2024'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account preferences</p>
      </div>

      {/* ── Profile Header ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarFallback className="bg-amber-500 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-slate-500 hover:text-amber-500 transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0 pt-1 sm:pt-0 sm:pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                    {personalForm.name || 'User'}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${roleBadgeStyle(displayRole)}`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {roleLabel(displayRole)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${planBadgeStyle(displayPlan)}`}
                    >
                      {displayPlan} Plan
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {personalForm.email}
                  </span>
                  <span className="hidden sm:inline text-muted-foreground/40">&bull;</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {joinDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {displayCredits} credits remaining
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Personal Information ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="profile-name"
                  placeholder="Your full name"
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="you@example.com"
                  value={personalForm.email}
                  onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-company" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Company
                </Label>
                <Input
                  id="profile-company"
                  placeholder="Your company name"
                  value={personalForm.company}
                  onChange={(e) => setPersonalForm({ ...personalForm, company: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-jobtitle" className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  Job Title
                </Label>
                <Input
                  id="profile-jobtitle"
                  placeholder="Your job title"
                  value={personalForm.jobTitle}
                  onChange={(e) => setPersonalForm({ ...personalForm, jobTitle: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-location" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  id="profile-location"
                  placeholder="City, State"
                  value={personalForm.location}
                  onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSavePersonal}
                disabled={personalLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {personalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Account Settings ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </div>
            <CardDescription>Customize your regional and display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Timezone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Date Format
                </Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((df) => (
                      <SelectItem key={df.value} value={df.value}>
                        {df.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSettings}
                disabled={settingsLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {settingsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Security ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Security</CardTitle>
            </div>
            <CardDescription>Manage your password and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Two-Factor Auth */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Two-Factor Authentication</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {twoFactor
                    ? '2FA is enabled. Your account is protected with an extra security layer.'
                    : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    twoFactor
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                      : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
                  }
                >
                  {twoFactor ? 'Enabled' : 'Disabled'}
                </Badge>
                <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Connected Accounts ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Connected Accounts</CardTitle>
            </div>
            <CardDescription>Manage your third-party account connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((account) => {
              const Icon = account.icon
              return (
                <div
                  key={account.provider}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${account.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{account.label}</p>
                      {account.connected && account.email ? (
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        account.connected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30'
                      }
                    >
                      {account.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                    <Button
                      variant={account.connected ? 'outline' : 'default'}
                      size="sm"
                      className={
                        account.connected
                          ? 'text-xs hover:text-red-600 hover:border-red-300'
                          : 'text-xs bg-amber-500 hover:bg-amber-600 text-white'
                      }
                      onClick={() => handleToggleAccount(account.provider)}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.25 }}>
        <Card className="border-0 shadow-sm border-red-200 dark:border-red-500/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <p className="font-medium text-sm text-red-700 dark:text-red-300">Delete Account</p>
                  </div>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Permanently delete your account and all associated data, including leads,
                    campaigns, and export history. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                  <Label
                    htmlFor="delete-confirm"
                    className="text-xs text-red-600 dark:text-red-400 font-medium"
                  >
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="h-10 border-red-300 dark:border-red-500/30 focus-visible:ring-red-500 bg-white dark:bg-slate-900"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs shrink-0"
                  disabled={deleteConfirm !== 'DELETE'}
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete My Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
