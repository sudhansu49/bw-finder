'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Unplug,
  Star,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Target,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardCheck,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Shield,
  BarChart3,
  CreditCard,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessData {
  id: string
  name: string
  category: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  hasWebsite: boolean
  websiteStatus?: string | null
  googleRating?: number | null
  googleReviews?: number | null
  reviewCount?: number | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  socialPresence: number
  leadScore?: number | null
  opportunityScore?: number | null
  estimatedMonthlyRevenue?: number | null
  source?: string
  sourceDetail?: string | null
  notes?: string | null
  auditScore?: number | null
  auditDate?: string | null
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWebsiteStatusConfig(status: string | null | undefined) {
  switch (status) {
    case 'NO_WEBSITE':
      return { label: 'No Website', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: Unplug }
    case 'SOCIAL_ONLY':
      return { label: 'Social Only', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Globe }
    case 'HAS_WEBSITE':
      return { label: 'Has Website', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Globe }
    default:
      return { label: 'Unknown', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Globe }
  }
}

function getScoreColor(score: number | null | undefined): string {
  if (!score) return 'text-slate-400'
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBg(score: number | null | undefined): string {
  if (!score) return 'bg-slate-100'
  if (score >= 80) return 'bg-emerald-50'
  if (score >= 60) return 'bg-amber-50'
  if (score >= 40) return 'bg-orange-50'
  return 'bg-red-50'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BusinessDetailDrawer() {
  const { selectedBusiness, businessDetailOpen, setBusinessDetailOpen, setSelectedBusiness, user, setCurrentView } = useAppStore()
  const { toast } = useToast()

  const [addingLead, setAddingLead] = useState(false)
  const [leadAdded, setLeadAdded] = useState(false)
  const [leadPriority, setLeadPriority] = useState('medium')
  const [leadValue, setLeadValue] = useState('')
  const [leadNotes, setLeadNotes] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const business = selectedBusiness as BusinessData | null

  // Reset state when business changes
  useEffect(() => {
    if (business) {
      setLeadAdded(false)
      setAddingLead(false)
      setLeadPriority('medium')
      setLeadValue('')
      setLeadNotes('')
      setActiveTab('overview')
    }
  }, [business?.id])

  const handleAddToLeads = useCallback(async () => {
    if (!business || !user) return
    setAddingLead(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          status: 'new_lead',
          priority: leadPriority,
          estimatedValue: leadValue ? Number(leadValue) : null,
          notes: leadNotes || `Added from business search - ${business.category} in ${business.city || business.state || business.country || 'Unknown'}`,
        }),
      })

      if (res.ok) {
        setLeadAdded(true)
        toast({
          title: 'Added to Leads! 🎯',
          description: `${business.name} added to your pipeline`,
        })
      } else {
        const data = await res.json()
        // If lead already exists for this business
        if (data.error?.includes('already')) {
          setLeadAdded(true)
          toast({ title: 'Already in Pipeline', description: `${business.name} is already a lead` })
        } else {
          throw new Error(data.error || 'Failed to add lead')
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add lead',
        variant: 'destructive',
      })
    } finally {
      setAddingLead(false)
    }
  }, [business, user, leadPriority, leadValue, leadNotes, toast])

  const handleGoToCRM = useCallback(() => {
    setBusinessDetailOpen(false)
    setCurrentView('user-crm')
  }, [setBusinessDetailOpen, setCurrentView])

  const handleClose = useCallback(() => {
    setBusinessDetailOpen(false)
  }, [setBusinessDetailOpen])

  if (!business) return null

  const wsConfig = getWebsiteStatusConfig(business.websiteStatus)
  const WsIcon = wsConfig.icon

  return (
    <Sheet open={businessDetailOpen} onOpenChange={setBusinessDetailOpen}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-bold leading-tight truncate">
                  {business.name}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {business.category}
                  </Badge>
                  <Badge className={`text-[10px] h-5 ${wsConfig.bg} ${wsConfig.color} border ${wsConfig.border}`}>
                    <WsIcon className="h-2.5 w-2.5 mr-0.5" />
                    {wsConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2 mt-4">
            {leadAdded ? (
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleGoToCRM}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View in CRM
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleAddToLeads}
                disabled={addingLead}
              >
                {addingLead ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add to Leads
              </Button>
            )}
            <Button variant="outline" size="icon" className="shrink-0" onClick={() => { setBusinessDetailOpen(false); setCurrentView('user-audit') }}>
              <TooltipWrap label="AI Audit">
                <ClipboardCheck className="h-4 w-4" />
              </TooltipWrap>
            </Button>
            <Button variant="outline" size="icon" className="shrink-0" onClick={() => { setBusinessDetailOpen(false); setCurrentView('user-proposal') }}>
              <TooltipWrap label="Proposal">
                <FileText className="h-4 w-4" />
              </TooltipWrap>
            </Button>
            <Button variant="outline" size="icon" className="shrink-0" onClick={() => { setBusinessDetailOpen(false); setCurrentView('user-whatsapp') }}>
              <TooltipWrap label="WhatsApp">
                <MessageSquare className="h-4 w-4" />
              </TooltipWrap>
            </Button>
          </div>

          {/* Add Lead Form (collapsible) */}
          {!leadAdded && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Priority</Label>
                      <Select value={leadPriority} onValueChange={setLeadPriority}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Est. Value (₹)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 15000"
                        className="h-8 text-xs"
                        value={leadValue}
                        onChange={(e) => setLeadValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      placeholder="Add notes about this lead..."
                      className="text-xs min-h-[60px]"
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </SheetHeader>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
          <div className="px-6 pt-2 border-b bg-white dark:bg-slate-900 shrink-0">
            <TabsList className="bg-transparent h-10 p-0 w-full justify-start gap-0">
              <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none px-3">
                Overview
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none px-3">
                Contact
              </TabsTrigger>
              <TabsTrigger value="scoring" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none px-3">
                Scoring
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none px-3">
                Social
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-5 mt-0">
              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl p-3 text-center ${getScoreBg(business.leadScore)}`}>
                  <Target className={`h-4 w-4 mx-auto mb-1 ${getScoreColor(business.leadScore)}`} />
                  <p className={`text-xl font-bold ${getScoreColor(business.leadScore)}`}>
                    {business.leadScore ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Lead Score</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${getScoreBg(business.opportunityScore)}`}>
                  <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${getScoreColor(business.opportunityScore)}`} />
                  <p className={`text-xl font-bold ${getScoreColor(business.opportunityScore)}`}>
                    {business.opportunityScore ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Opportunity</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-800">
                  <BarChart3 className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                    {business.estimatedMonthlyRevenue
                      ? `₹${(business.estimatedMonthlyRevenue / 1000).toFixed(0)}k`
                      : '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Est. Revenue</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Business Information</h3>
                <div className="space-y-2.5">
                  {business.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{business.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {[business.city, business.state, business.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {!business.address && (business.city || business.state || business.country) && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {[business.city, business.state, business.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <a href={`tel:${business.phone}`} className="text-sm text-amber-600 hover:underline">{business.phone}</a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${business.email}`} className="text-sm text-amber-600 hover:underline">{business.email}</a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                        {business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Website Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Website Status</h3>
                <div className={`rounded-xl p-4 border ${wsConfig.border} ${wsConfig.bg}`}>
                  <div className="flex items-center gap-3">
                    <WsIcon className={`h-5 w-5 ${wsConfig.color}`} />
                    <div>
                      <p className={`text-sm font-semibold ${wsConfig.color}`}>{wsConfig.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {business.websiteStatus === 'NO_WEBSITE' && 'This business has no online presence - great opportunity!'}
                        {business.websiteStatus === 'SOCIAL_ONLY' && 'Only social media profiles found - needs a proper website'}
                        {business.websiteStatus === 'HAS_WEBSITE' && 'Business has a website - may need redesign/SEO services'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Rating */}
              {(business.googleRating || business.googleReviews) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Google Presence</h3>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    {business.googleRating && (
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{business.googleRating}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Rating</p>
                      </div>
                    )}
                    {business.googleReviews && (
                      <div className="text-center">
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{business.googleReviews}</span>
                        <p className="text-[10px] text-muted-foreground">Reviews</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: {business.sourceDetail || business.source || 'web_search'}</span>
                <span>Added {new Date(business.createdAt).toLocaleDateString()}</span>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="p-6 space-y-5 mt-0">
              <div className="space-y-3">
                {business.phone && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{business.phone}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open(`tel:${business.phone}`)}>
                      <Phone className="h-3 w-3 mr-1" /> Call
                    </Button>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{business.email}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open(`mailto:${business.email}`)}>
                      <Mail className="h-3 w-3 mr-1" /> Email
                    </Button>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Website</p>
                        <p className="text-sm font-medium">{business.website}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open(business.website!, '_blank')}>
                      <ExternalLink className="h-3 w-3 mr-1" /> Visit
                    </Button>
                  </div>
                )}
                {business.address && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{business.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {[business.city, business.state, business.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!business.phone && !business.email && !business.website && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-muted-foreground">No contact info available</p>
                    <p className="text-xs text-muted-foreground">Try searching for more details</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Scoring Tab */}
            <TabsContent value="scoring" className="p-6 space-y-5 mt-0">
              {/* Lead Score Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lead Score Breakdown</h3>

                <div className={`rounded-xl p-5 text-center ${getScoreBg(business.leadScore)}`}>
                  <p className={`text-4xl font-bold ${getScoreColor(business.leadScore)}`}>
                    {business.leadScore ?? '—'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                  <div className="w-full bg-white/50 dark:bg-slate-700/50 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (business.leadScore ?? 0) >= 80 ? 'bg-emerald-500' :
                        (business.leadScore ?? 0) >= 60 ? 'bg-amber-500' :
                        (business.leadScore ?? 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${business.leadScore ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Score Factors */}
                <div className="space-y-2">
                  {[
                    { label: 'No Website', value: !business.hasWebsite, points: 30 },
                    { label: 'Social Only', value: business.websiteStatus === 'SOCIAL_ONLY', points: 20 },
                    { label: 'Has Phone', value: !!business.phone, points: 10 },
                    { label: 'Has Email', value: !!business.email, points: 10 },
                    { label: 'Google Rating < 4', value: (business.googleRating ?? 5) < 4, points: 15 },
                    { label: 'Social Presence', value: business.socialPresence > 0, points: business.socialPresence * 5 },
                  ].map((factor) => (
                    <div key={factor.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2">
                        {factor.value ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="text-sm">{factor.label}</span>
                      </div>
                      <Badge variant="secondary" className={`text-xs ${factor.value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        +{factor.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Opportunity Score */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Opportunity Score</h3>
                <div className={`rounded-xl p-5 text-center ${getScoreBg(business.opportunityScore)}`}>
                  <p className={`text-4xl font-bold ${getScoreColor(business.opportunityScore)}`}>
                    {business.opportunityScore ?? '—'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                  <div className="w-full bg-white/50 dark:bg-slate-700/50 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (business.opportunityScore ?? 0) >= 80 ? 'bg-emerald-500' :
                        (business.opportunityScore ?? 0) >= 60 ? 'bg-amber-500' :
                        (business.opportunityScore ?? 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${business.opportunityScore ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Revenue */}
              {business.estimatedMonthlyRevenue && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Estimated Revenue</h3>
                    <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-500/10 text-center">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        ₹{business.estimatedMonthlyRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">per month (estimated)</p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="p-6 space-y-5 mt-0">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Social Media Presence</h3>

                {/* Social Score */}
                <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Social Presence Score</p>
                    <p className="text-xs text-muted-foreground">Based on connected platforms</p>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{business.socialPresence}/3</div>
                </div>

                {/* Platform Cards */}
                {[
                  { name: 'Facebook', url: business.facebookUrl, icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                  { name: 'Instagram', url: business.instagramUrl, icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-500/10' },
                  { name: 'LinkedIn', url: business.linkedinUrl, icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                ].map((platform) => (
                  <div key={platform.name} className={`rounded-xl p-4 border ${platform.url ? 'border-slate-200 dark:border-slate-700' : 'border-dashed border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${platform.url ? platform.bg : 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center`}>
                          <platform.icon className={`h-5 w-5 ${platform.url ? platform.color : 'text-slate-300'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{platform.name}</p>
                          {platform.url ? (
                            <p className="text-xs text-amber-600 truncate max-w-[200px]">{platform.url}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not found</p>
                          )}
                        </div>
                      </div>
                      {platform.url && (
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(platform.url!, '_blank')}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// ─── Tooltip Wrapper ──────────────────────────────────────────────────────────

function TooltipWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return <span title={label}>{children}</span>
}
