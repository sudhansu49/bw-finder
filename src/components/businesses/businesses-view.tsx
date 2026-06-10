'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Building2,
  Globe,
  Unplug,
  Phone,
  MapPin,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  CheckCircle2,
  Eye,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Target,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = ['All', 'Restaurant', 'Salon', 'Beauty Parlour', 'Spa', 'Gym', 'Mechanic', 'Plumber', 'Electrician', 'Bakery', 'Dentist', 'Lawyer', 'Accountant', 'Real Estate', 'Hotel', 'Clinic', 'School', 'Other']

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
  source?: string
  sourceDetail?: string | null
  rating?: number
}

// ── Score helper functions ──────────────────────────────────────────

const getScoreColor = (score: number | null | undefined) => {
  if (score == null) return 'text-slate-400'
  if (score >= 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
}

const getScoreBg = (score: number | null | undefined) => {
  if (score == null) return 'bg-slate-50'
  if (score >= 70) return 'bg-emerald-50'
  if (score >= 40) return 'bg-amber-50'
  return 'bg-red-50'
}

const getScoreRingColor = (score: number | null | undefined) => {
  if (score == null) return 'border-slate-200'
  if (score >= 70) return 'border-emerald-500'
  if (score >= 40) return 'border-amber-500'
  return 'border-red-400'
}

const WebsiteBadge = ({ status }: { status?: string | null }) => {
  if (status === 'HAS_WEBSITE') {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200">
        <Globe className="h-3 w-3 mr-1" />
        Website
      </Badge>
    )
  }
  if (status === 'SOCIAL_ONLY') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-semibold border border-red-200">
        <Unplug className="h-3 w-3 mr-1" />
        Social Only
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-semibold border border-red-200">
      <Unplug className="h-3 w-3 mr-1" />
      No Website
    </Badge>
  )
}

const formatRevenue = (revenue: number | null | undefined) => {
  if (revenue == null) return '-'
  if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(revenue >= 10000 ? 0 : 1)}k`
  }
  return `$${revenue}`
}

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'leadScore', label: 'Lead Score' },
  { value: 'opportunityScore', label: 'Opportunity' },
  { value: 'revenue', label: 'Revenue' },
] as const

export function BusinessesView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [addedLeads, setAddedLeads] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<string>('default')
  const pageSize = 10

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const params = new URLSearchParams()
        if (categoryFilter && categoryFilter !== 'All') params.set('category', categoryFilter)
        if (searchTerm) params.set('search', searchTerm)
        params.set('limit', '200')

        const res = await fetch(`/api/businesses?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data.businesses || [])
        } else {
          setBusinesses([])
        }
      } catch {
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [categoryFilter, searchTerm, user?.id])

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = !searchTerm ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.country?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'leadScore') return (b.leadScore || 0) - (a.leadScore || 0)
    if (sortBy === 'opportunityScore') return (b.opportunityScore || 0) - (a.opportunityScore || 0)
    if (sortBy === 'revenue') return (b.estimatedMonthlyRevenue || 0) - (a.estimatedMonthlyRevenue || 0)
    return 0
  })

  const totalPages = Math.ceil(filteredBusinesses.length / pageSize)
  const paginatedBusinesses = filteredBusinesses.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handleAddToLeads = async (business: Business) => {
    if (addedLeads.has(business.id)) return
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          userId: user?.id || 'demo',
          status: 'New',
          priority: business.hasWebsite ? 'low' : 'medium',
          estimatedValue: business.hasWebsite ? 800 : 1500,
          notes: `Lead from business directory: ${business.name}`,
        }),
      })
      setAddedLeads(prev => new Set([...prev, business.id]))
      toast({
        title: 'Added to Leads!',
        description: `${business.name} has been added to your leads pipeline.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add lead.',
        variant: 'destructive',
      })
    }
  }

  const openDetail = (business: Business) => {
    setSelectedBusiness(business)
    setDetailOpen(true)
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
        <p className="text-muted-foreground">{filteredBusinesses.length} businesses in directory</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or country..."
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-44 h-10 justify-between">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      {sortOptions.find(o => o.value === sortBy)?.label || 'Sort By'}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setPage(1) }}
                    className={sortBy === option.value ? 'bg-amber-50 text-amber-700 font-medium' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[960px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-center">Lead</TableHead>
                    <TableHead className="text-center">Opp.</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Social</TableHead>
                    <TableHead>Source</TableHead>
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
                        className="group cursor-pointer hover:bg-slate-50"
                        onClick={() => openDetail(business)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${business.leadScore != null ? getScoreBg(business.leadScore) : business.hasWebsite ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                              <Building2 className={`h-4 w-4 ${business.leadScore != null ? getScoreColor(business.leadScore) : business.hasWebsite ? 'text-emerald-600' : 'text-amber-600'}`} />
                            </div>
                            <span className="font-medium text-sm max-w-[160px] truncate">{business.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{business.city || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{business.country || '-'}</TableCell>
                        <TableCell>
                          <WebsiteBadge status={business.websiteStatus} />
                        </TableCell>
                        <TableCell className="text-center">
                          {business.leadScore != null ? (
                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full border-2 text-xs font-bold ${getScoreRingColor(business.leadScore)} ${getScoreColor(business.leadScore)}`}>
                              {business.leadScore}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {business.opportunityScore != null ? (
                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full border-2 text-xs font-bold ${getScoreRingColor(business.opportunityScore)} ${getScoreColor(business.opportunityScore)}`}>
                              {business.opportunityScore}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-semibold ${business.estimatedMonthlyRevenue != null ? getScoreColor(business.leadScore || business.opportunityScore) : 'text-muted-foreground'}`}>
                            {formatRevenue(business.estimatedMonthlyRevenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {business.facebookUrl && <Facebook className="h-3.5 w-3.5 text-blue-600" />}
                            {business.instagramUrl && <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                            {business.linkedinUrl && <Linkedin className="h-3.5 w-3.5 text-blue-700" />}
                            {!business.facebookUrl && !business.instagramUrl && !business.linkedinUrl && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {business.sourceDetail || business.source || 'manual'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); openDetail(business) }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {!addedLeads.has(business.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                onClick={(e) => { e.stopPropagation(); handleAddToLeads(business) }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Lead
                              </Button>
                            )}
                            {addedLeads.has(business.id) && (
                              <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Added
                              </Badge>
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
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No businesses found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredBusinesses.length)} of {filteredBusinesses.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'default' : 'outline'}
                size="icon"
                className={`h-8 w-8 ${page === i + 1 ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Business Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedBusiness && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  {selectedBusiness.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <WebsiteBadge status={selectedBusiness.websiteStatus} />
                  <Badge variant="secondary">{selectedBusiness.category}</Badge>
                  {selectedBusiness.sourceDetail && (
                    <Badge variant="outline" className="text-xs">via {selectedBusiness.sourceDetail}</Badge>
                  )}
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Lead Score Card */}
                  <div className={`rounded-xl border p-3 text-center ${getScoreBg(selectedBusiness.leadScore)}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Lead</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedBusiness.leadScore)}`}>
                      {selectedBusiness.leadScore ?? '-'}
                    </div>
                    {selectedBusiness.leadScore != null && (
                      <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${selectedBusiness.leadScore >= 70 ? 'bg-emerald-500' : selectedBusiness.leadScore >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${selectedBusiness.leadScore}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Opportunity Score Card */}
                  <div className={`rounded-xl border p-3 text-center ${getScoreBg(selectedBusiness.opportunityScore)}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Opp.</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedBusiness.opportunityScore)}`}>
                      {selectedBusiness.opportunityScore ?? '-'}
                    </div>
                    {selectedBusiness.opportunityScore != null && (
                      <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${selectedBusiness.opportunityScore >= 70 ? 'bg-emerald-500' : selectedBusiness.opportunityScore >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${selectedBusiness.opportunityScore}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Revenue Card */}
                  <div className="rounded-xl border p-3 text-center bg-amber-50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Rev/mo</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatRevenue(selectedBusiness.estimatedMonthlyRevenue)}
                    </div>
                    {selectedBusiness.estimatedMonthlyRevenue != null && (
                      <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.min(100, (selectedBusiness.estimatedMonthlyRevenue / 50000) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Rating */}
                {selectedBusiness.googleRating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedBusiness.googleRating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="font-medium ml-1">{selectedBusiness.googleRating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({selectedBusiness.googleReviews || selectedBusiness.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                <Separator />

                {/* Contact Details */}
                <div className="space-y-2">
                  {selectedBusiness.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      {selectedBusiness.phone}
                    </div>
                  )}
                  {selectedBusiness.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      {selectedBusiness.email}
                    </div>
                  )}
                  {(selectedBusiness.address || selectedBusiness.city) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      {[selectedBusiness.address, selectedBusiness.city, selectedBusiness.state, selectedBusiness.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {selectedBusiness.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                      <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {selectedBusiness.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {(selectedBusiness.facebookUrl || selectedBusiness.instagramUrl || selectedBusiness.linkedinUrl) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Social Media</p>
                      {selectedBusiness.facebookUrl && (
                        <a href={selectedBusiness.facebookUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Facebook className="h-4 w-4" /> {selectedBusiness.facebookUrl}
                        </a>
                      )}
                      {selectedBusiness.instagramUrl && (
                        <a href={selectedBusiness.instagramUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                          <Instagram className="h-4 w-4" /> {selectedBusiness.instagramUrl}
                        </a>
                      )}
                      {selectedBusiness.linkedinUrl && (
                        <a href={selectedBusiness.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                          <Linkedin className="h-4 w-4" /> {selectedBusiness.linkedinUrl}
                        </a>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Add to Leads */}
                {!selectedBusiness.hasWebsite && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => { handleAddToLeads(selectedBusiness); setDetailOpen(false) }}
                    disabled={addedLeads.has(selectedBusiness.id)}
                  >
                    {addedLeads.has(selectedBusiness.id) ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" /> Already Added as Lead</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" /> Add to Leads Pipeline</>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
