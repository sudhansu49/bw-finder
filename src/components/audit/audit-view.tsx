'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  Search,
  Globe,
  Unplug,
  Building2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowUpDown,
  FileText,
  Download,
  Star,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  TrendingUp,
  Target,
  DollarSign,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Shield,
  MessageSquare,
  Users,
  Facebook,
  Instagram,
  Linkedin,
  Eye,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────

interface AuditItem {
  id: string
  title: string
  status: 'critical' | 'warning' | 'good' | 'opportunity'
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  estimatedValue: number
}

interface AuditReport {
  businessName: string
  category: string
  city: string | null
  country: string | null
  auditDate: string
  overallScore: number
  items: AuditItem[]
  summary: string
  totalOpportunityValue: number
  servicesRecommended: string[]
}

interface Business {
  id: string
  name: string
  category: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  website?: string | null
  hasWebsite: boolean
  websiteStatus?: string | null
  googleRating?: number | null
  googleReviews?: number | null
  reviewCount?: number | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  socialPresence?: number
  leadScore?: number | null
  opportunityScore?: number | null
  estimatedMonthlyRevenue?: number | null
  auditScore?: number | null
  auditDate?: string | null
  source?: string
  sourceDetail?: string | null
}

// ── Helper Functions ───────────────────────────────────────────────

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />
    case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'good': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    case 'opportunity': return <Zap className="h-5 w-5 text-blue-500" />
    default: return <AlertTriangle className="h-5 w-5 text-slate-400" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'critical':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 text-xs font-semibold">Critical Issue</Badge>
    case 'warning':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold">Warning</Badge>
    case 'good':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold">Good</Badge>
    case 'opportunity':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold">Opportunity</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">Unknown</Badge>
  }
}

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case 'high':
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 text-[10px]">High Impact</Badge>
    case 'medium':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 text-[10px]">Medium</Badge>
    case 'low':
      return <Badge className="bg-slate-50 text-slate-600 hover:bg-slate-50 border border-slate-200 text-[10px]">Low</Badge>
    default:
      return null
  }
}

const getAuditScoreColor = (score: number | null | undefined) => {
  if (score == null) return 'text-slate-400'
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getAuditScoreBg = (score: number | null | undefined) => {
  if (score == null) return 'bg-slate-50'
  if (score >= 80) return 'bg-emerald-50'
  if (score >= 60) return 'bg-amber-50'
  if (score >= 40) return 'bg-orange-50'
  return 'bg-red-50'
}

const getAuditScoreRing = (score: number | null | undefined) => {
  if (score == null) return 'border-slate-200'
  if (score >= 80) return 'border-emerald-500'
  if (score >= 60) return 'border-amber-500'
  if (score >= 40) return 'border-orange-500'
  return 'border-red-500'
}

const getAuditProgressColor = (score: number | null | undefined) => {
  if (score == null) return 'bg-slate-200'
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

const getItemIcon = (id: string) => {
  switch (id) {
    case 'website_missing': return <Globe className="h-5 w-5" />
    case 'seo_missing': return <Search className="h-5 w-5" />
    case 'booking_missing': return <ClipboardCheck className="h-5 w-5" />
    case 'lead_capture_missing': return <Users className="h-5 w-5" />
    case 'google_ranking_opportunity': return <BarChart3 className="h-5 w-5" />
    case 'whatsapp_opportunity': return <MessageSquare className="h-5 w-5" />
    default: return <AlertTriangle className="h-5 w-5" />
  }
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Not audited'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Not audited'
  }
}

// ── Main Component ─────────────────────────────────────────────────

export function AuditView() {
  const { user, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState<string>('auditScore')
  const [auditing, setAuditing] = useState(false)
  const [auditingAll, setAuditingAll] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const categories = ['All', 'Restaurant', 'Salon', 'Beauty Parlour', 'Spa', 'Gym', 'Clinic', 'Hotel', 'Real Estate', 'Dentist', 'Lawyer', 'School', 'Mechanic', 'Accountant', 'Other']

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const params = new URLSearchParams()
        params.set('limit', '200')
        const res = await fetch(`/api/businesses?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data.businesses || [])
        }
      } catch {
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [user?.id])

  // Filter and sort
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = !searchTerm ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'auditScore') return (a.auditScore ?? 101) - (b.auditScore ?? 101) // Lower score = more issues = better lead
    if (sortBy === 'leadScore') return (b.leadScore || 0) - (a.leadScore || 0)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'category') return a.category.localeCompare(b.category)
    return 0
  })

  // Audit stats
  const auditedCount = businesses.filter(b => b.auditScore != null).length
  const avgAuditScore = auditedCount > 0
    ? Math.round(businesses.filter(b => b.auditScore != null).reduce((sum, b) => sum + (b.auditScore || 0), 0) / auditedCount)
    : 0
  const criticalBusinesses = businesses.filter(b => b.auditScore != null && b.auditScore! < 40).length

  // Run audit for single business
  const handleAudit = async (business: Business) => {
    setAuditing(true)
    try {
      const res = await fetch('/api/businesses/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds: [business.id], useAI: true }),
      })
      if (res.ok) {
        const data = await res.json()
        toast({
          title: 'Audit Complete!',
          description: `Business audit generated for ${business.name}.`,
        })
        // Refresh the business list
        const bizRes = await fetch(`/api/businesses?limit=200`)
        if (bizRes.ok) {
          const bizData = await bizRes.json()
          setBusinesses(bizData.businesses || [])
        }
      } else {
        toast({ title: 'Audit Failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Audit Failed', variant: 'destructive' })
    } finally {
      setAuditing(false)
    }
  }

  // Run audit for all businesses
  const handleAuditAll = async () => {
    setAuditingAll(true)
    try {
      const unauditedIds = businesses.filter(b => b.auditScore == null).map(b => b.id)
      if (unauditedIds.length === 0) {
        toast({ title: 'All businesses already audited!' })
        setAuditingAll(false)
        return
      }
      const res = await fetch('/api/businesses/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditAll: true, useAI: false }),
      })
      if (res.ok) {
        toast({
          title: 'Bulk Audit Complete!',
          description: `Generated audit reports for all businesses.`,
        })
        const bizRes = await fetch(`/api/businesses?limit=200`)
        if (bizRes.ok) {
          const bizData = await bizRes.json()
          setBusinesses(bizData.businesses || [])
        }
      }
    } catch {
      toast({ title: 'Bulk Audit Failed', variant: 'destructive' })
    } finally {
      setAuditingAll(false)
    }
  }

  // View audit report
  const handleViewReport = async (business: Business) => {
    setSelectedBusiness(business)
    setLoadingReport(true)
    setReportOpen(true)
    setExpandedItems(new Set())

    try {
      const res = await fetch(`/api/businesses/audit?businessId=${business.id}`)
      if (res.ok) {
        const data = await res.json()
        setAuditReport(data.report)
        // Update the business in our list with the audit score
        setBusinesses(prev => prev.map(b =>
          b.id === business.id
            ? { ...b, auditScore: data.business?.auditScore ?? b.auditScore, auditDate: data.business?.auditDate ?? b.auditDate }
            : b
        ))
      } else {
        toast({ title: 'Failed to load audit report', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Failed to load audit report', variant: 'destructive' })
    } finally {
      setLoadingReport(false)
    }
  }

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const criticalItems = auditReport?.items.filter(i => i.status === 'critical') || []
  const warningItems = auditReport?.items.filter(i => i.status === 'warning') || []
  const opportunityItems = auditReport?.items.filter(i => i.status === 'opportunity') || []
  const goodItems = auditReport?.items.filter(i => i.status === 'good') || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-amber-500" />
            AI Business Audit
          </h1>
          <p className="text-muted-foreground">Generate professional audit reports for businesses</p>
        </div>
        <Button
          onClick={handleAuditAll}
          disabled={auditingAll || businesses.length === 0}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          {auditingAll ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Auditing All...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Audit All Businesses</>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{businesses.length}</p>
                <p className="text-xs text-muted-foreground">Total Businesses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{auditedCount}</p>
                <p className="text-xs text-muted-foreground">Audited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalBusinesses}</p>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{avgAuditScore}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                <p className="text-xs text-muted-foreground">Avg Audit Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-44 h-10 justify-between">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      {sortBy === 'auditScore' ? 'Audit Score' : sortBy === 'leadScore' ? 'Lead Score' : sortBy === 'name' ? 'Name' : sortBy === 'category' ? 'Category' : 'Sort By'}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setSortBy('auditScore')} className={sortBy === 'auditScore' ? 'bg-amber-50 text-amber-700' : ''}>Audit Score</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('leadScore')} className={sortBy === 'leadScore' ? 'bg-amber-50 text-amber-700' : ''}>Lead Score</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')} className={sortBy === 'name' ? 'bg-amber-50 text-amber-700' : ''}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('category')} className={sortBy === 'category' ? 'bg-amber-50 text-amber-700' : ''}>Category</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Website</TableHead>
                    <TableHead className="text-center">Audit Score</TableHead>
                    <TableHead className="text-center">Lead</TableHead>
                    <TableHead>Last Audit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredBusinesses.map((business) => (
                      <motion.tr
                        key={business.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group cursor-pointer hover:bg-slate-50"
                        onClick={() => handleViewReport(business)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${business.auditScore != null ? getAuditScoreBg(business.auditScore) : 'bg-slate-50'}`}>
                              <Building2 className={`h-4 w-4 ${business.auditScore != null ? getAuditScoreColor(business.auditScore) : 'text-slate-400'}`} />
                            </div>
                            <span className="font-medium text-sm max-w-[160px] truncate">{business.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[business.city, business.country].filter(Boolean).join(', ') || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {business.websiteStatus === 'HAS_WEBSITE' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] font-semibold border border-emerald-200">
                              <Globe className="h-3 w-3 mr-1" /> Yes
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px] font-semibold border border-red-200">
                              <Unplug className="h-3 w-3 mr-1" /> No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {business.auditScore != null ? (
                            <div className="flex items-center justify-center">
                              <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full border-2 text-xs font-bold ${getAuditScoreRing(business.auditScore)} ${getAuditScoreColor(business.auditScore)} ${getAuditScoreBg(business.auditScore)}`}>
                                {business.auditScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not audited</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {business.leadScore != null ? (
                            <span className={`text-xs font-bold ${business.leadScore >= 70 ? 'text-emerald-600' : business.leadScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                              {business.leadScore}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(business.auditDate).split(',')[0]}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {business.auditScore == null ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                disabled={auditing}
                                onClick={(e) => { e.stopPropagation(); handleAudit(business) }}
                              >
                                {auditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                Audit
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-amber-700 hover:bg-amber-50"
                                onClick={(e) => { e.stopPropagation(); handleViewReport(business) }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Report
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </ScrollArea>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No businesses found. Discover some first!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Audit Report Dialog ──────────────────────────────────── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          {loadingReport ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500" />
              <p className="mt-4 text-muted-foreground font-medium">Generating audit report...</p>
              <p className="text-sm text-muted-foreground mt-1">Analyzing digital presence and opportunities</p>
            </div>
          ) : selectedBusiness && auditReport ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Business Audit Report
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Business Header */}
                <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-amber-50/30 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${getAuditScoreBg(auditReport.overallScore)}`}>
                        <Building2 className={`h-6 w-6 ${getAuditScoreColor(auditReport.overallScore)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{selectedBusiness.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary">{selectedBusiness.category}</Badge>
                          {selectedBusiness.city && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{selectedBusiness.city}{selectedBusiness.country && `, ${selectedBusiness.country}`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {selectedBusiness.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedBusiness.phone}</span>}
                          {selectedBusiness.googleRating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />{selectedBusiness.googleRating}
                              <span>({selectedBusiness.googleReviews || selectedBusiness.reviewCount || 0})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audit Score Circle */}
                    <div className="flex flex-col items-center">
                      <div className={`h-20 w-20 rounded-full border-4 flex items-center justify-center ${getAuditScoreRing(auditReport.overallScore)} ${getAuditScoreBg(auditReport.overallScore)}`}>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getAuditScoreColor(auditReport.overallScore)}`}>{auditReport.overallScore}</p>
                          <p className="text-[9px] text-muted-foreground font-medium">/ 100</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-1.5">Audit Score</p>
                      <p className="text-[10px] text-muted-foreground">
                        {auditReport.overallScore >= 80 ? 'Good shape' : auditReport.overallScore >= 60 ? 'Needs work' : auditReport.overallScore >= 40 ? 'Major gaps' : 'Urgent issues'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issue Summary */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3 text-center bg-red-50">
                    <p className="text-xl font-bold text-red-600">{criticalItems.length}</p>
                    <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide">Critical</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center bg-amber-50">
                    <p className="text-xl font-bold text-amber-600">{warningItems.length}</p>
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Warning</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center bg-blue-50">
                    <p className="text-xl font-bold text-blue-600">{opportunityItems.length}</p>
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Opportunity</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center bg-emerald-50">
                    <p className="text-xl font-bold text-emerald-600">{goodItems.length}</p>
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Good</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="rounded-xl border bg-white p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Executive Summary
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{auditReport.summary}</p>
                </div>

                <Separator />

                {/* Audit Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Detailed Findings</h4>
                  {auditReport.items.map((item) => {
                    const isExpanded = expandedItems.has(item.id)
                    return (
                      <motion.div
                        key={item.id}
                        initial={false}
                        className={`rounded-xl border overflow-hidden transition-colors ${
                          item.status === 'critical' ? 'border-red-200 bg-red-50/30' :
                          item.status === 'warning' ? 'border-amber-200 bg-amber-50/30' :
                          item.status === 'opportunity' ? 'border-blue-200 bg-blue-50/30' :
                          'border-emerald-200 bg-emerald-50/30'
                        }`}
                      >
                        {/* Item Header */}
                        <button
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors"
                          onClick={() => toggleItem(item.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              item.status === 'critical' ? 'bg-red-100 text-red-600' :
                              item.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                              item.status === 'opportunity' ? 'bg-blue-100 text-blue-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                              {getItemIcon(item.id)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-slate-900">{item.title}</span>
                                {getStatusBadge(item.status)}
                                {getImpactBadge(item.impact)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-sm font-semibold text-amber-600">${item.estimatedValue.toLocaleString()}</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0">
                                <Separator className="mb-3" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Analysis</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Recommendation</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{item.recommendation}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-medium text-amber-700">Estimated Project Value: ${item.estimatedValue.toLocaleString()}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                <Separator />

                {/* Services Recommended */}
                <div className="rounded-xl border bg-amber-50/50 p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Recommended Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {auditReport.servicesRecommended.map((service, idx) => (
                      <Badge key={idx} className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-sm py-1 px-3">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Total Opportunity Value */}
                <div className="rounded-xl border bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-100">Total Opportunity Value</p>
                      <p className="text-3xl font-bold mt-1">${auditReport.totalOpportunityValue.toLocaleString()}</p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-amber-100 mt-2">
                    Estimated value of recommended digital services for {selectedBusiness.name}
                  </p>
                </div>

                {/* Generate Proposal Button */}
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  onClick={() => {
                    setReportOpen(false)
                    setCurrentView('user-proposal')
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Website Proposal
                </Button>

                {/* Audit Date */}
                <p className="text-xs text-muted-foreground text-center">
                  Audit generated on {formatDate(auditReport.auditDate)}
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
