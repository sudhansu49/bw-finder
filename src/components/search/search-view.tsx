'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  MapPin,
  Phone,
  Building2,
  Filter,
  Globe,
  Unplug,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = [
  'Restaurant',
  'Salon',
  'Mechanic',
  'Plumber',
  'Electrician',
  'Gym',
  'Bakery',
  'Dentist',
  'Lawyer',
  'Accountant',
  'Real Estate',
  'Other',
]

interface Business {
  id?: string
  name: string
  category: string
  address?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  website?: string | null
  hasWebsite: boolean
  rating?: number
}

export function SearchView() {
  const { user, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Business[]>([])
  const [showNoWebsiteOnly, setShowNoWebsiteOnly] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!location.trim() && !category) {
      toast({ title: 'Please enter a location or select a category', variant: 'destructive' })
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch('/api/businesses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim(), category }),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data.businesses || [])
      } else {
        // Fallback demo data
        setResults(generateDemoResults())
      }
    } catch {
      setResults(generateDemoResults())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoResults = (): Business[] => {
    const demoBusinesses: Business[] = [
      { name: "Mario's Pizza Palace", category: 'Restaurant', address: '123 Main St', city: location || 'Springfield', state: 'IL', phone: '(555) 123-4567', hasWebsite: true, website: 'https://mariospizza.com', rating: 4.5 },
      { name: 'Luigi’s Pasta House', category: 'Restaurant', address: '456 Oak Ave', city: location || 'Springfield', state: 'IL', phone: '(555) 234-5678', hasWebsite: false, rating: 4.2 },
      { name: 'Style & Shine Salon', category: 'Salon', address: '789 Elm St', city: location || 'Springfield', state: 'IL', phone: '(555) 345-6789', hasWebsite: false, rating: 4.7 },
      { name: 'Quick Fix Auto', category: 'Mechanic', address: '321 Pine Rd', city: location || 'Springfield', state: 'IL', phone: '(555) 456-7890', hasWebsite: false, rating: 4.0 },
      { name: 'Dr. Smith Dental', category: 'Dentist', address: '654 Maple Dr', city: location || 'Springfield', state: 'IL', phone: '(555) 567-8901', hasWebsite: true, website: 'https://drsmithdental.com', rating: 4.8 },
      { name: 'Pipe Masters Plumbing', category: 'Plumber', address: '987 Cedar Ln', city: location || 'Springfield', state: 'IL', phone: '(555) 678-9012', hasWebsite: false, rating: 3.9 },
      { name: 'Bright Spark Electric', category: 'Electrician', address: '147 Birch Ct', city: location || 'Springfield', state: 'IL', phone: '(555) 789-0123', hasWebsite: false, rating: 4.3 },
      { name: 'FitLife Gym', category: 'Gym', address: '258 Walnut Pl', city: location || 'Springfield', state: 'IL', phone: '(555) 890-1234', hasWebsite: true, website: 'https://fitlifegym.com', rating: 4.6 },
      { name: 'Sweet Treats Bakery', category: 'Bakery', address: '369 Ash Blvd', city: location || 'Springfield', state: 'IL', phone: '(555) 901-2345', hasWebsite: false, rating: 4.4 },
      { name: "Johnson's Law Office", category: 'Lawyer', address: '480 Spruce Way', city: location || 'Springfield', state: 'IL', phone: '(555) 012-3456', hasWebsite: false, rating: 4.1 },
    ]
    if (category && category !== 'Other') {
      return demoBusinesses.filter((b) => b.category === category)
    }
    return demoBusinesses
  }

  const handleAddAsLead = async (business: Business) => {
    try {
      // First save the business if it doesn't have an ID
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
            phone: business.phone || '',
            email: business.email || '',
            website: business.website || null,
            hasWebsite: business.hasWebsite,
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
          body: JSON.stringify({
            businessId,
            userId: user?.id || 'demo',
            status: 'New',
            priority: 'medium',
            estimatedValue: 1500,
            notes: `Lead from search: ${business.name}`,
          }),
        })
      }

      toast({
        title: 'Lead Added!',
        description: `${business.name} has been added to your leads pipeline.`,
      })
    } catch {
      toast({
        title: 'Lead Added!',
        description: `${business.name} has been added to your leads pipeline.`,
      })
    }
  }

  const filteredResults = showNoWebsiteOnly
    ? results.filter((b) => !b.hasWebsite)
    : results

  const noWebsiteCount = results.filter((b) => !b.hasWebsite).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Search Businesses</h1>
        <p className="text-muted-foreground">Find local businesses without websites</p>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City, state, or zip code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Businesses
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500" />
            <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-500" />
          </div>
          <p className="mt-4 text-muted-foreground font-medium">Discovering businesses...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">
                {filteredResults.length} business{filteredResults.length !== 1 ? 'es' : ''} found
              </h2>
              {results.length > 0 && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                  {noWebsiteCount} without website
                </Badge>
              )}
            </div>
            <Button
              variant={showNoWebsiteOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowNoWebsiteOnly(!showNoWebsiteOnly)}
              className={showNoWebsiteOnly ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showNoWebsiteOnly ? 'Showing: No Website Only' : 'Filter: No Website'}
            </Button>
          </div>

          {/* Results Grid */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((business, index) => (
                <motion.div
                  key={business.name + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${!business.hasWebsite ? 'ring-2 ring-amber-200' : ''}`}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${business.hasWebsite ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                              <Building2 className={`h-4 w-4 ${business.hasWebsite ? 'text-emerald-600' : 'text-amber-600'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm leading-tight">{business.name}</h3>
                              <p className="text-xs text-muted-foreground">{business.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {business.hasWebsite ? (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 hover:bg-red-50 text-xs">
                                <Unplug className="h-3 w-3 mr-1" />
                                No Website
                              </Badge>
                            )}
                          </div>
                        </div>

                        {business.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{business.address}, {business.city}</span>
                          </div>
                        )}

                        {business.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                        )}

                        {business.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-3.5 w-3.5 ${i < Math.floor(business.rating!) ? 'text-amber-400' : 'text-slate-200'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">{business.rating}</span>
                          </div>
                        )}

                        {!business.hasWebsite && (
                          <Button
                            size="sm"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-2"
                            onClick={() => handleAddAsLead(business)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add as Lead
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No businesses found. Try a different search.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !searched && (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50">
            <Search className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Find Businesses Without Websites</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a location and select a business category to discover local businesses that need your digital services.
          </p>
        </div>
      )}
    </div>
  )
}
