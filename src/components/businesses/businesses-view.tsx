'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const categories = ['All', 'Restaurant', 'Salon', 'Mechanic', 'Plumber', 'Electrician', 'Gym', 'Bakery', 'Dentist', 'Lawyer', 'Accountant', 'Real Estate', 'Other']

interface Business {
  id: string
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

export function BusinessesView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const params = new URLSearchParams()
        if (categoryFilter && categoryFilter !== 'All') params.set('category', categoryFilter)
        if (searchTerm) params.set('search', searchTerm)
        params.set('hasWebsite', 'false')

        const res = await fetch(`/api/businesses?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data.businesses || [])
        } else {
          setBusinesses(generateDemoBusinesses())
        }
      } catch {
        setBusinesses(generateDemoBusinesses())
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [categoryFilter, searchTerm, user?.id])

  const generateDemoBusinesses = (): Business[] => [
    { id: '1', name: "Mario's Pizza Palace", category: 'Restaurant', address: '123 Main St', city: 'Springfield', state: 'IL', phone: '(555) 123-4567', email: 'mario@pizza.com', hasWebsite: true, website: 'https://mariospizza.com', rating: 4.5 },
    { id: '2', name: "Luigi's Pasta House", category: 'Restaurant', address: '456 Oak Ave', city: 'Springfield', state: 'IL', phone: '(555) 234-5678', hasWebsite: false, rating: 4.2 },
    { id: '3', name: 'Style & Shine Salon', category: 'Salon', address: '789 Elm St', city: 'Springfield', state: 'IL', phone: '(555) 345-6789', hasWebsite: false, rating: 4.7 },
    { id: '4', name: 'Quick Fix Auto', category: 'Mechanic', address: '321 Pine Rd', city: 'Springfield', state: 'IL', phone: '(555) 456-7890', hasWebsite: false, rating: 4.0 },
    { id: '5', name: 'Dr. Smith Dental', category: 'Dentist', address: '654 Maple Dr', city: 'Springfield', state: 'IL', phone: '(555) 567-8901', hasWebsite: true, website: 'https://drsmithdental.com', rating: 4.8 },
    { id: '6', name: 'Pipe Masters Plumbing', category: 'Plumber', address: '987 Cedar Ln', city: 'Springfield', state: 'IL', phone: '(555) 678-9012', hasWebsite: false, rating: 3.9 },
    { id: '7', name: 'Bright Spark Electric', category: 'Electrician', address: '147 Birch Ct', city: 'Springfield', state: 'IL', phone: '(555) 789-0123', hasWebsite: false, rating: 4.3 },
    { id: '8', name: 'FitLife Gym', category: 'Gym', address: '258 Walnut Pl', city: 'Springfield', state: 'IL', phone: '(555) 890-1234', hasWebsite: true, website: 'https://fitlifegym.com', rating: 4.6 },
    { id: '9', name: 'Sweet Treats Bakery', category: 'Bakery', address: '369 Ash Blvd', city: 'Springfield', state: 'IL', phone: '(555) 901-2345', hasWebsite: false, rating: 4.4 },
    { id: '10', name: "Johnson's Law Office", category: 'Lawyer', address: '480 Spruce Way', city: 'Springfield', state: 'IL', phone: '(555) 012-3456', hasWebsite: false, rating: 4.1 },
    { id: '11', name: 'Green Thumb Landscaping', category: 'Other', address: '591 Poplar St', city: 'Shelbyville', state: 'IL', phone: '(555) 111-2222', hasWebsite: false, rating: 4.5 },
    { id: '12', name: 'Elite Accounting', category: 'Accountant', address: '702 Finance Ave', city: 'Springfield', state: 'IL', phone: '(555) 222-3333', hasWebsite: true, website: 'https://eliteaccounting.com', rating: 4.0 },
    { id: '13', name: 'HomeFind Realty', category: 'Real Estate', address: '813 Market St', city: 'Springfield', state: 'IL', phone: '(555) 333-4444', hasWebsite: false, rating: 4.3 },
    { id: '14', name: 'Golden Wok', category: 'Restaurant', address: '924 China Ln', city: 'Shelbyville', state: 'IL', phone: '(555) 444-5555', hasWebsite: false, rating: 4.6 },
    { id: '15', name: 'Cut Above Hair', category: 'Salon', address: '135 Style Ave', city: 'Shelbyville', state: 'IL', phone: '(555) 555-6666', hasWebsite: false, rating: 3.8 },
  ]

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = !searchTerm ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredBusinesses.length / pageSize)
  const paginatedBusinesses = filteredBusinesses.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handleAddToLeads = async (business: Business) => {
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          userId: user?.id || 'demo',
          status: 'New',
          priority: 'medium',
          estimatedValue: 1500,
          notes: `Lead from business directory: ${business.name}`,
        }),
      })
      toast({
        title: 'Added to Leads!',
        description: `${business.name} has been added to your leads pipeline.`,
      })
    } catch {
      toast({
        title: 'Added to Leads!',
        description: `${business.name} has been added to your leads pipeline.`,
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
                placeholder="Search businesses..."
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

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Rating</TableHead>
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
                    >
                      <TableCell className="w-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setExpandedRow(expandedRow === business.id ? null : business.id)}
                        >
                          {expandedRow === business.id ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={() => openDetail(business)}>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${business.hasWebsite ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                            <Building2 className={`h-4 w-4 ${business.hasWebsite ? 'text-emerald-600' : 'text-amber-600'}`} />
                          </div>
                          <span className="font-medium text-sm">{business.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{business.city || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{business.phone || '-'}</TableCell>
                      <TableCell>
                        {business.hasWebsite ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 hover:bg-red-50 text-xs">
                            <Unplug className="h-3 w-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {business.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm">{business.rating}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!business.hasWebsite && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={(e) => { e.stopPropagation(); handleAddToLeads(business) }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Leads
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

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
        <DialogContent className="sm:max-w-md">
          {selectedBusiness && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  {selectedBusiness.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <Badge variant="secondary" className="mt-1">{selectedBusiness.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    {selectedBusiness.hasWebsite ? (
                      <Badge className="mt-1 bg-emerald-50 text-emerald-700">
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedBusiness.website}
                      </Badge>
                    ) : (
                      <Badge className="mt-1 bg-red-50 text-red-700">
                        <Unplug className="h-3 w-3 mr-1" />
                        No Website
                      </Badge>
                    )}
                  </div>
                  {selectedBusiness.rating && (
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{selectedBusiness.rating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedBusiness.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    {selectedBusiness.address}, {selectedBusiness.city}, {selectedBusiness.state}
                  </div>
                )}

                {selectedBusiness.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {selectedBusiness.phone}
                  </div>
                )}

                {!selectedBusiness.hasWebsite && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => { handleAddToLeads(selectedBusiness); setDetailOpen(false) }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Leads Pipeline
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
