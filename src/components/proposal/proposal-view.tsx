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
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Building2,
  Loader2,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Package,
  Download,
  Eye,
  Star,
  ArrowRight,
  Zap,
  Crown,
  Shield,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  MessageSquare,
  Search,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrency, useTranslation } from '@/lib/i18n/hooks'

// ── Types ──────────────────────────────────────────────────────────

interface PackageFeature {
  name: string
  included: boolean
  highlight?: boolean
}

interface ProposalPackage {
  name: string
  tier: 'basic' | 'professional' | 'premium'
  price: number
  originalPrice?: number
  timeline: string
  deliveryWeeks: number
  features: PackageFeature[]
  description: string
  recommended?: boolean
}

interface ProposalData {
  businessName: string
  category: string
  city: string | null
  country: string | null
  generatedAt: string
  packages: ProposalPackage[]
  auditSummary: string
  auditScore: number | null
  totalOpportunityValue: number
  servicesFromAudit: string[]
  customMessage: string
  validUntil: string
  companyName: string
  contactEmail: string
  contactPhone: string
}

interface Business {
  id: string
  name: string
  category: string
  city?: string
  country?: string
  phone?: string
  email?: string
  website?: string | null
  hasWebsite: boolean
  websiteStatus?: string | null
  leadScore?: number | null
  opportunityScore?: number | null
  estimatedMonthlyRevenue?: number | null
  auditScore?: number | null
  proposalData?: string | null
  proposalDate?: string | null
}

// ── Package Card Component ────────────────────────────────────────

const tierConfig = {
  basic: {
    gradient: 'from-slate-50 to-slate-100',
    border: 'border-slate-200',
    headerBg: 'bg-slate-50',
    accent: 'text-slate-700',
    accentBg: 'bg-slate-100',
    priceColor: 'text-slate-800',
    icon: Shield,
    iconColor: 'text-slate-500',
    checkColor: 'text-slate-500',
    ring: 'ring-slate-200',
  },
  professional: {
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-300',
    headerBg: 'bg-amber-50',
    accent: 'text-amber-700',
    accentBg: 'bg-amber-100',
    priceColor: 'text-amber-800',
    icon: Zap,
    iconColor: 'text-amber-500',
    checkColor: 'text-amber-500',
    ring: 'ring-amber-400',
  },
  premium: {
    gradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-300',
    headerBg: 'bg-emerald-50',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-100',
    priceColor: 'text-emerald-800',
    icon: Crown,
    iconColor: 'text-emerald-500',
    checkColor: 'text-emerald-500',
    ring: 'ring-emerald-400',
  },
}

function PackageCard({ pkg, onSelect }: { pkg: ProposalPackage; onSelect: () => void }) {
  const { format: formatCurr, symbol: currSymbol } = useCurrency()
  const { t } = useTranslation()
  const config = tierConfig[pkg.tier]
  const Icon = config.icon
  const includedFeatures = pkg.features.filter(f => f.included)
  const excludedFeatures = pkg.features.filter(f => !f.included)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: pkg.tier === 'basic' ? 0 : pkg.tier === 'professional' ? 0.1 : 0.2 }}
      className={`relative rounded-2xl border-2 ${config.border} bg-white overflow-hidden flex flex-col ${pkg.recommended ? 'shadow-lg shadow-amber-100' : 'shadow-sm'}`}
    >
      {pkg.recommended && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1.5 text-xs font-bold tracking-wider uppercase">
          ★ Recommended
        </div>
      )}

      {/* Header */}
      <div className={`p-5 ${config.headerBg} bg-gradient-to-br ${config.gradient}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`h-8 w-8 rounded-lg ${config.accentBg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">{pkg.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {pkg.originalPrice && (
            <span className="text-sm text-slate-400 line-through">{formatCurr(pkg.originalPrice)}</span>
          )}
          <span className={`text-3xl font-extrabold ${config.priceColor}`}>{formatCurr(pkg.price)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">one-time setup fee</p>
      </div>

      {/* Timeline */}
      <div className={`mx-5 mt-4 mb-3 px-3 py-2 rounded-lg ${config.accentBg} flex items-center justify-center gap-2`}>
        <Clock className={`h-3.5 w-3.5 ${config.iconColor}`} />
        <span className={`text-xs font-semibold ${config.accent}`}>Delivery: {pkg.timeline}</span>
      </div>

      {/* Features */}
      <div className="px-5 flex-1">
        <ul className="space-y-1.5">
          {includedFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.checkColor}`} />
              <span className={`text-xs ${f.highlight ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{f.name}</span>
            </li>
          ))}
          {excludedFeatures.slice(0, 3).map((f, i) => (
            <li key={`ex-${i}`} className="flex items-start gap-2">
              <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-300" />
              <span className="text-xs text-slate-400 line-through">{f.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-5 pt-4">
        <Button
          className={`w-full ${pkg.recommended ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
          onClick={onSelect}
        >
          Select {pkg.name}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

export function ProposalView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const { format: formatCurr, formatCompact, symbol: currSymbol } = useCurrency()
  const { t } = useTranslation()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [loadingProposal, setLoadingProposal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const categories = ['All', 'Restaurant', 'Salon', 'Beauty Parlour', 'Spa', 'Gym', 'Clinic', 'Hotel', 'Real Estate', 'Dentist', 'Lawyer', 'School', 'Other']

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses?limit=200')
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data.businesses || [])
        }
      } catch { setBusinesses([]) }
      finally { setLoading(false) }
    }
    fetchBusinesses()
  }, [user?.id])

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredBusinesses.length / pageSize)
  const paginatedBusinesses = filteredBusinesses.slice((page - 1) * pageSize, page * pageSize)

  const proposalsGenerated = businesses.filter(b => b.proposalData).length

  // Generate proposal
  const handleGenerateProposal = async (business: Business, useAI = false) => {
    setGenerating(business.id)
    try {
      const res = await fetch('/api/businesses/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, useAI }),
      })
      if (res.ok) {
        const data = await res.json()
        setProposal(data.proposal)
        setSelectedBusiness(business)
        setProposalOpen(true)
        toast({ title: 'Proposal Generated!', description: `Proposal for ${business.name} is ready.` })
        // Refresh businesses list
        const bizRes = await fetch('/api/businesses?limit=200')
        if (bizRes.ok) {
          const bizData = await bizRes.json()
          setBusinesses(bizData.businesses || [])
        }
      } else {
        toast({ title: 'Failed to generate proposal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error generating proposal', variant: 'destructive' })
    } finally {
      setGenerating(null)
    }
  }

  // View existing proposal
  const handleViewProposal = async (business: Business) => {
    setSelectedBusiness(business)
    setLoadingProposal(true)
    setProposalOpen(true)
    try {
      const res = await fetch(`/api/businesses/proposal?businessId=${business.id}`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data.proposal)
      } else {
        toast({ title: 'Failed to load proposal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error loading proposal', variant: 'destructive' })
    } finally {
      setLoadingProposal(false)
    }
  }

  // Export PDF
  const handleExportPDF = async (businessId: string) => {
    try {
      toast({ title: 'Generating PDF...', description: 'Your proposal PDF is being prepared.' })
      const res = await fetch(`/api/businesses/proposal/pdf?businessId=${businessId}`)
      if (res.ok) {
        const html = await res.text()
        // Open in new window for printing
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(html)
          printWindow.document.close()
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
        toast({ title: 'PDF Ready!', description: 'Use the print dialog to save as PDF.' })
      } else {
        toast({ title: 'Failed to generate PDF', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error exporting PDF', variant: 'destructive' })
    }
  }

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
            <FileText className="h-6 w-6 text-amber-500" />
            AI Website Proposal
          </h1>
          <p className="text-muted-foreground">Generate professional 3-tier proposals for businesses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{businesses.length}</p>
                <p className="text-xs text-muted-foreground">Businesses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{proposalsGenerated}</p>
                <p className="text-xs text-muted-foreground">Proposals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{businesses.filter(b => !b.hasWebsite).length}</p>
                <p className="text-xs text-muted-foreground">No Website</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{businesses.filter(b => !b.hasWebsite && !b.proposalData).length}</p>
                <p className="text-xs text-muted-foreground">Need Proposal</p>
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
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="pl-10 h-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Proposal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginatedBusinesses.map((business) => (
                      <motion.tr
                        key={business.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => business.proposalData ? handleViewProposal(business) : handleGenerateProposal(business)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${business.proposalData ? 'bg-emerald-50' : business.hasWebsite ? 'bg-slate-50' : 'bg-amber-50'}`}>
                              <Building2 className={`h-4 w-4 ${business.proposalData ? 'text-emerald-600' : 'text-amber-600'}`} />
                            </div>
                            <div>
                              <span className="font-medium text-sm block max-w-[160px] truncate">{business.name}</span>
                              {business.leadScore != null && (
                                <span className="text-[10px] text-muted-foreground">Lead: {business.leadScore}/100</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[business.city, business.country].filter(Boolean).join(', ') || '-'}
                        </TableCell>
                        <TableCell>
                          {business.hasWebsite ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] border border-emerald-200">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px] border border-red-200">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {business.proposalData ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Generated
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {business.proposalData ? (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-700 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); handleViewProposal(business) }}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />View
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-600 hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); handleExportPDF(business.id) }}>
                                  <Download className="h-3.5 w-3.5 mr-1" />PDF
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                  disabled={generating === business.id}
                                  onClick={(e) => { e.stopPropagation(); handleGenerateProposal(business) }}
                                >
                                  {generating === business.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                                  Generate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-amber-600 hover:bg-amber-50"
                                  disabled={generating === business.id}
                                  onClick={(e) => { e.stopPropagation(); handleGenerateProposal(business, true) }}
                                  title="AI-Enhanced Proposal"
                                >
                                  {generating === business.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                </Button>
                              </>
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

          {paginatedBusinesses.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No businesses found. Discover some first!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredBusinesses.length)} of {filteredBusinesses.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="icon"
                className={`h-8 w-8 ${page === i + 1 ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Proposal Dialog ────────────────────────────────────────── */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
          {loadingProposal ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500" />
              <p className="mt-4 text-muted-foreground font-medium">Loading proposal...</p>
            </div>
          ) : proposal && selectedBusiness ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Website Proposal for {proposal.businessName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Audit Summary Banner */}
                <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{proposal.businessName}</h3>
                      <p className="text-sm text-slate-300">{proposal.category}{proposal.city ? ` • ${proposal.city}` : ''}{proposal.country ? `, ${proposal.country}` : ''}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{proposal.auditSummary}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${proposal.auditScore != null && proposal.auditScore < 40 ? 'text-red-400' : proposal.auditScore != null && proposal.auditScore < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {proposal.auditScore ?? '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">Audit Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">
                          {formatCompact(proposal.totalOpportunityValue)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">Opp. Value</div>
                      </div>
                    </div>
                  </div>
                  {proposal.servicesFromAudit.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proposal.servicesFromAudit.map((s, i) => (
                        <span key={i} className="inline-block bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3 Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proposal.packages.map((pkg) => (
                    <PackageCard key={pkg.tier} pkg={pkg} onSelect={() => {}} />
                  ))}
                </div>

                {/* Cover Letter */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-amber-500" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{proposal.customMessage}</p>
                  </CardContent>
                </Card>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleExportPDF(selectedBusiness.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('proposal.downloadPdf')}
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleGenerateProposal(selectedBusiness, true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </Button>
                  <div className="text-xs text-muted-foreground text-center sm:text-right sm:ml-auto">
                    Valid until {new Date(proposal.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
