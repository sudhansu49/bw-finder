'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Loader2,
  Plus,
  MapPin,
  Phone,
  Building2,
  Filter,
  Globe,
  Unplug,
  Star,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  ListFilter,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = [
  'Salon',
  'Beauty Parlour',
  'Spa',
  'Gym',
  'Restaurant',
  'Clinic',
  'Hotel',
  'Real Estate',
  'Dentist',
  'Lawyer',
  'School',
  'Mechanic',
  'Plumber',
  'Electrician',
  'Bakery',
  'Accountant',
  'Other',
]

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'UAE',
  'Singapore',
  'Germany',
  'France',
  'Brazil',
  'Mexico',
  'South Africa',
  'Nigeria',
  'Kenya',
  'Other',
]

interface Business {
  id?: string
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
}

interface SearchJobInfo {
  id: string
  status: string
  resultsCount: number
  duplicatesFound: number
  sourcesUsed: string
  fallback?: boolean
  fallbackLevel?: string
  fallbackReason?: string
  error?: string
}

export function SearchView() {
  const { user, setCurrentView, openBusinessDetail } = useAppStore()
  const { toast } = useToast()
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [customCountry, setCustomCountry] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Business[]>([])
  const [showNoWebsiteOnly, setShowNoWebsiteOnly] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchJobInfo, setSearchJobInfo] = useState<SearchJobInfo | null>(null)
  const [addedLeads, setAddedLeads] = useState<Set<string>>(new Set())
  const [addingLead, setAddingLead] = useState<string | null>(null)
  const [searchProgress, setSearchProgress] = useState<string>('')
  const [elapsedTime, setElapsedTime] = useState(0)

  const effectiveCountry = country === 'Other' ? customCountry : country
  const effectiveCategory = category === 'Other' ? customCategory : category

  const handleSearch = async () => {
    if (!effectiveCountry && !customCountry) {
      toast({ title: 'Please select or enter a country', variant: 'destructive' })
      return
    }
    if (!effectiveCategory && !customCategory) {
      toast({ title: 'Please select or enter a business category', variant: 'destructive' })
      return
    }

    setLoading(true)
    setSearched(true)
    setSearchJobInfo(null)
    setSearchProgress('Searching business directories...')
    setElapsedTime(0)

    // Progress timer
    const progressInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    // Progress messages rotation
    const progressMessages = [
      'Searching business directories...',
      'Scanning Google Maps listings...',
      'Checking Justdial & Sulekha...',
      'Extracting business details...',
      'AI analyzing results...',
      'Scoring leads...',
    ]
    let msgIndex = 0
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % progressMessages.length
      setSearchProgress(progressMessages[msgIndex])
    }, 5000)

    try {
      // Use AbortController with a generous 2-minute timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const res = await fetch('/api/businesses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: effectiveCountry,
          state: state.trim(),
          city: city.trim(),
          category: effectiveCategory,
          userId: user?.id || '',
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = res.ok ? await res.json() : null
      const businesses = data?.businesses || []
      const jobInfo = data?.searchJob || null

      setResults(businesses)
      setSearchJobInfo(jobInfo)

      if (businesses.length > 0) {
        if (jobInfo?.fallback) {
          toast({
            title: 'Showing Cached Results',
            description: `Found ${businesses.length} businesses from database. Live search is rate-limited — try again in 30s for fresh results.`,
            duration: 6000,
          })
        } else {
          toast({
            title: 'Search Complete!',
            description: `Found ${businesses.length} businesses in ${elapsedTime + 1}s. ${jobInfo?.duplicatesFound || 0} duplicates were merged.`,
          })
        }
      } else if (jobInfo?.error) {
        toast({
          title: 'Search Temporarily Unavailable',
          description: jobInfo.error || 'Please try again in a few seconds.',
          variant: 'destructive',
          duration: 5000,
        })
      } else {
        toast({
          title: 'No Results Found',
          description: 'Try a different category or location.',
          duration: 4000,
        })
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        toast({
          title: 'Search Timed Out',
          description: 'The search is taking too long. Please try again.',
          variant: 'destructive',
          duration: 5000,
        })
      } else {
        toast({
          title: 'Search Failed',
          description: 'Network error. Please try again.',
          variant: 'destructive',
        })
      }
      setResults([])
    } finally {
      setLoading(false)
      setSearchProgress('')
      clearInterval(progressInterval)
      clearInterval(msgInterval)
    }
  }

  const handleAddAsLead = async (business: Business) => {
    if (!business.id || addedLeads.has(business.id)) return

    setAddingLead(business.id || business.name)
    try {
      let businessId = business.id

      if (!businessId) {
        const businessRes = await fetch('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: business.name,
            category: business.category,
            address: business.address || '',
            city: business.city || '',
            state: business.state || '',
            country: business.country || '',
            phone: business.phone || '',
            email: business.email || '',
            website: business.website || null,
            hasWebsite: business.hasWebsite,
            facebookUrl: business.facebookUrl || null,
            instagramUrl: business.instagramUrl || null,
            linkedinUrl: business.linkedinUrl || null,
          }),
        })
        if (businessRes.ok) {
          const businessData = await businessRes.json()
          businessId = businessData.business?.id || businessData.id
        }
      }

      if (businessId) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            businessId,
            userId: user?.id || '',
            status: 'New',
            priority: business.hasWebsite ? 'low' : 'medium',
            estimatedValue: business.hasWebsite ? 800 : 1500,
            notes: `Lead from discovery search: ${business.name} in ${business.city || ''}, ${business.country || ''}`,
          }),
        })
      }

      if (business.id) {
        setAddedLeads(prev => new Set([...prev, business.id!]))
      }

      toast({
        title: 'Lead Added!',
        description: `${business.name} has been added to your leads pipeline.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: `Failed to add ${business.name} as lead.`,
        variant: 'destructive',
      })
    } finally {
      setAddingLead(null)
    }
  }

  const handleAddAllNoWebsiteAsLeads = async () => {
    const noWebsiteBusinesses = filteredResults.filter(b => !b.hasWebsite && b.id && !addedLeads.has(b.id))
    let added = 0

    for (const business of noWebsiteBusinesses) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            businessId: business.id,
            userId: user?.id || '',
            status: 'New',
            priority: 'medium',
            estimatedValue: 1500,
            notes: `Bulk lead from discovery: ${business.name}`,
          }),
        })
        if (business.id) {
          setAddedLeads(prev => new Set([...prev, business.id!]))
        }
        added++
      } catch {
        // Skip failed ones
      }
    }

    toast({
      title: `${added} Leads Added!`,
      description: `Added ${added} businesses without websites to your leads pipeline.`,
    })
  }

  // Website status badge component
  const WebsiteStatusBadge = ({ status, hasWebsite }: { status?: string | null, hasWebsite: boolean }) => {
    if (status === 'HAS_WEBSITE') {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200">
          <Globe className="h-3 w-3 mr-1" />
          Website Exists
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
    // NO_WEBSITE or not detected yet
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-semibold border border-red-200">
        <Unplug className="h-3 w-3 mr-1" />
        No Website
      </Badge>
    )
  }

  // Lead score color
  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'text-slate-400'
    if (score >= 70) return 'text-emerald-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-red-500'
  }

  const getScoreBg = (score: number | null | undefined) => {
    if (!score) return 'bg-slate-50'
    if (score >= 70) return 'bg-emerald-50'
    if (score >= 40) return 'bg-amber-50'
    return 'bg-red-50'
  }

  const filteredResults = showNoWebsiteOnly
    ? results.filter((b) => b.websiteStatus !== 'HAS_WEBSITE')
    : results

  const noWebsiteCount = results.filter((b) => !b.hasWebsite).length
  const withWebsiteCount = results.filter((b) => b.hasWebsite).length

  const openDetail = (business: Business) => {
    openBusinessDetail(business)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Discovery Engine</h1>
        <p className="text-muted-foreground">Find local businesses without websites across any location</p>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-amber-500" />
            Search Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {country === 'Other' && (
                <Input
                  placeholder="Enter country name"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="h-10"
                />
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">State / Province</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra, California"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  placeholder="e.g. Mumbai, New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Business Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category === 'Other' && (
                <Input
                  placeholder="Enter business category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="h-10"
                />
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={handleSearch}
              disabled={loading || !effectiveCountry || !effectiveCategory}
              className={`h-11 px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold ${
                !loading && effectiveCountry && effectiveCategory ? 'animate-pulse' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discovering... {elapsedTime}s
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Discover Businesses
                </>
              )}
            </Button>
            {searched && !loading && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearched(false)
                  setResults([])
                  setSearchJobInfo(null)
                  setAddedLeads(new Set())
                }}
                className="h-11"
              >
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Progress indicator */}
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500" />
              <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-500" />
            </div>
            <p className="mt-4 text-muted-foreground font-medium">{searchProgress || 'Discovering businesses...'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {elapsedTime < 10 ? 'About 20-30 seconds remaining' : elapsedTime < 20 ? 'About 10-20 seconds remaining' : elapsedTime < 35 ? 'Almost there...' : 'Finishing up...'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Web Search
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Directory Scan
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Data Extraction
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-600 font-medium">{elapsedTime}s elapsed</p>
          </div>
          {/* Results skeleton */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-4 w-20 rounded bg-slate-100" />
                    <div className="h-4 w-24 rounded bg-slate-100" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                    <div className="h-5 w-16 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="space-y-4">
          {/* Results Header & Stats */}
          <div className="flex flex-col gap-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border-0 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{results.length}</p>
                <p className="text-xs text-muted-foreground">Total Found</p>
              </div>
              <div className="bg-white rounded-xl border-0 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{noWebsiteCount}</p>
                <p className="text-xs text-muted-foreground">No Website</p>
              </div>
              <div className="bg-white rounded-xl border-0 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{withWebsiteCount}</p>
                <p className="text-xs text-muted-foreground">Has Website</p>
              </div>
              <div className="bg-white rounded-xl border-0 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {searchJobInfo?.duplicatesFound || 0}
                </p>
                <p className="text-xs text-muted-foreground">Duplicates Merged</p>
              </div>
            </div>

            {/* Fallback / Search Info Banner */}
            {searchJobInfo?.fallback && (
              <div className="flex flex-col gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{searchJobInfo.fallbackReason || 'Live search rate-limited — showing cached results from your database. Try again in 30 seconds for fresh results.'}</span>
                </div>
                {searchJobInfo.fallbackLevel === 'generic_suggestions' && (
                  <span className="ml-5.5 text-amber-600">These are general suggestions — try a different search for more relevant results.</span>
                )}
              </div>
            )}
            {searchJobInfo && searchJobInfo.sourcesUsed && !searchJobInfo.fallback && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 rounded-lg px-4 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span>Sources searched: <span className="font-medium text-amber-700">{searchJobInfo.sourcesUsed}</span></span>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showNoWebsiteOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowNoWebsiteOnly(!showNoWebsiteOnly)}
                    className={showNoWebsiteOnly ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                  >
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    {showNoWebsiteOnly ? 'No Website Only' : 'Filter: No Website'}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {noWebsiteCount > 0 && !showNoWebsiteOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddAllNoWebsiteAsLeads}
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add All No-Website as Leads ({noWebsiteCount})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Social</TableHead>
                        <TableHead>Lead Score</TableHead>
                        <TableHead>Opp. Score</TableHead>
                        <TableHead>Est. Revenue</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredResults.map((business, index) => (
                          <motion.tr
                            key={business.id || business.name + index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`group cursor-pointer hover:bg-slate-50/80 ${!business.hasWebsite ? 'bg-amber-50/30' : ''}`}
                            onClick={() => openDetail(business)}
                          >
                            <TableCell className="w-10">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${business.hasWebsite ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                <Building2 className={`h-4 w-4 ${business.hasWebsite ? 'text-emerald-600' : 'text-amber-600'}`} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-sm">{business.name}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {business.phone || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {business.email ? (
                                <span className="truncate max-w-[120px] block">{business.email}</span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {business.address ? (
                                <span className="truncate max-w-[150px] block">{business.address}</span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{business.city || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{business.state || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{business.country || '-'}</TableCell>
                            <TableCell>
                              {business.googleRating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                  <span className="text-sm">{business.googleRating}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {business.googleReviews || business.reviewCount || '-'}
                            </TableCell>
                            <TableCell>
                              <WebsiteStatusBadge status={business.websiteStatus} hasWebsite={business.hasWebsite} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {business.facebookUrl && (
                                  <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <Facebook className="h-3.5 w-3.5 text-blue-600 hover:text-blue-800" />
                                  </a>
                                )}
                                {business.instagramUrl && (
                                  <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <Instagram className="h-3.5 w-3.5 text-pink-600 hover:text-pink-800" />
                                  </a>
                                )}
                                {business.linkedinUrl && (
                                  <a href={business.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <Linkedin className="h-3.5 w-3.5 text-blue-700 hover:text-blue-900" />
                                  </a>
                                )}
                                {!business.facebookUrl && !business.instagramUrl && !business.linkedinUrl && (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div className={`h-7 w-7 rounded-full ${getScoreBg(business.leadScore)} flex items-center justify-center`}>
                                  <span className={`text-xs font-bold ${getScoreColor(business.leadScore)}`}>
                                    {business.leadScore ?? '-'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div className={`h-7 w-7 rounded-full ${getScoreBg(business.opportunityScore)} flex items-center justify-center`}>
                                  <span className={`text-xs font-bold ${getScoreColor(business.opportunityScore)}`}>
                                    {business.opportunityScore ?? '-'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {business.estimatedMonthlyRevenue
                                ? `$${business.estimatedMonthlyRevenue.toLocaleString()}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {business.sourceDetail || business.source || 'web'}
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
                                {business.id && !business.hasWebsite && (
                                  <Button
                                    size="sm"
                                    variant={addedLeads.has(business.id) ? 'ghost' : 'outline'}
                                    className={`h-7 text-xs ${
                                      addedLeads.has(business.id)
                                        ? 'text-emerald-600'
                                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    }`}
                                    onClick={(e) => { e.stopPropagation(); handleAddAsLead(business) }}
                                    disabled={addingLead === business.id || addedLeads.has(business.id || '')}
                                  >
                                    {addingLead === business.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : addedLeads.has(business.id || '') ? (
                                      <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                      <Plus className="h-3 w-3" />
                                    )}
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

              {filteredResults.length === 0 && results.length === 0 && searchJobInfo?.error && (
                <div className="text-center py-12">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">Search temporarily unavailable</p>
                  <p className="text-sm text-muted-foreground mt-1">{searchJobInfo.error}</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
              {filteredResults.length === 0 && results.length === 0 && !searchJobInfo?.error && searched && (
                <div className="text-center py-12">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                    <Search className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-muted-foreground font-medium">No businesses found</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    We couldn&apos;t find businesses matching your search. Here are some tips:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 max-w-sm mx-auto text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#8226;</span>
                      Try a broader location (just country, skip city)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#8226;</span>
                      Try a different business category
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#8226;</span>
                      Check the spelling of your city or state
                    </li>
                  </ul>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      variant="default"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                      onClick={handleSearch}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearched(false)
                        setResults([])
                        setSearchJobInfo(null)
                        setAddedLeads(new Set())
                      }}
                    >
                      New Search
                    </Button>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Quick search suggestions
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {[
                        { cat: 'Salon', country: 'India' },
                        { cat: 'Restaurant', country: 'United States' },
                        { cat: 'Gym', country: 'United Kingdom' },
                        { cat: 'Dentist', country: 'Canada' },
                        { cat: 'Hotel', country: 'UAE' },
                        { cat: 'Clinic', country: 'Australia' },
                      ].map((suggestion) => (
                        <Badge
                          key={`${suggestion.cat}-${suggestion.country}`}
                          variant="outline"
                          className="cursor-pointer hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors py-1.5 px-3 text-xs"
                          onClick={() => {
                            setCategory(suggestion.cat)
                            setCountry(suggestion.country)
                            setCity('')
                            setState('')
                          }}
                        >
                          {suggestion.cat} in {suggestion.country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {filteredResults.length === 0 && results.length > 0 && showNoWebsiteOnly && (
                <div className="text-center py-12">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">All found businesses have websites!</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different location or category to find businesses without websites</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowNoWebsiteOnly(false)}
                  >
                    Show All Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !searched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50">
            <Search className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Discover Businesses Without Websites</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Enter a country, state, city, and business category to discover local businesses from public directories.
            Find potential clients who need your digital services.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {['Salon', 'Restaurant', 'Gym', 'Clinic', 'Dentist', 'Hotel', 'Real Estate', 'Spa'].map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="cursor-pointer hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors py-1.5 px-3"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Business detail is now shown in the global BusinessDetailDrawer */}
    </div>
  )
}
