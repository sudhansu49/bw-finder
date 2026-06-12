'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Area, AreaChart, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import {
  Building2,
  DollarSign,
  Receipt,
  Target,
  Tag,
  MapPin,
  Activity,
  Heart,
  FileText,
  BarChart3,
  LifeBuoy,
  Megaphone,
  Mail,
  Smartphone,
  TrendingUp,
  Puzzle,
  Brain,
  ToggleLeft,
  Settings,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  Send,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react'

// ─── Shared Animation ─────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

function PageHeader({ icon: Icon, title, description, color = 'amber', action }: {
  icon: React.ElementType
  title: string
  description: string
  color?: string
  action?: React.ReactNode
}) {
  const bgMap: Record<string, string> = {
    amber: 'bg-amber-100',
    emerald: 'bg-emerald-100',
    orange: 'bg-orange-100',
    rose: 'bg-rose-100',
    teal: 'bg-teal-100',
    slate: 'bg-slate-100',
  }
  const textMap: Record<string, string> = {
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600',
    rose: 'text-rose-600',
    teal: 'text-teal-600',
    slate: 'text-slate-600',
  }

  return (
    <motion.div {...fadeIn}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${bgMap[color]} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${textMap[color]}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </motion.div>
  )
}

function KPIDashboard({ items }: { items: { title: string; value: string; icon: React.ReactNode; gradient: string }[] }) {
  return (
    <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" animate="show">
      {items.map((kpi) => (
        <motion.div key={kpi.title} variants={staggerItem}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${kpi.gradient}`} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                {kpi.icon}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENCIES
// ═══════════════════════════════════════════════════════════════════════════════

const mockAgencies = [
  { id: '1', name: 'Acme Digital', owner: 'John Smith', members: 8, leads: 245, plan: 'Enterprise', status: 'active' },
  { id: '2', name: 'Growth Hub', owner: 'Sarah Johnson', members: 5, leads: 187, plan: 'Pro', status: 'active' },
  { id: '3', name: 'LeadGen Pro', owner: 'Mike Chen', members: 12, leads: 423, plan: 'Enterprise', status: 'active' },
  { id: '4', name: 'SmallBiz Co', owner: 'Lisa Brown', members: 2, leads: 56, plan: 'Starter', status: 'suspended' },
  { id: '5', name: 'WebFind Agency', owner: 'Tom Wilson', members: 4, leads: 132, plan: 'Pro', status: 'active' },
]

export function AdminAgencies() {
  const [search, setSearch] = useState('')

  const filtered = mockAgencies.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.owner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader icon={Building2} title="Agencies" description="Manage platform agencies and teams" color="emerald" />

      <KPIDashboard items={[
        { title: 'Total Agencies', value: '24', icon: <Building2 className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Active', value: '21', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, gradient: 'from-teal-400 to-teal-600' },
        { title: 'Total Members', value: '87', icon: <Users className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Total Leads', value: '1,043', icon: <Target className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Agencies</CardTitle>
          <CardDescription>{filtered.length} agencies found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead className="hidden sm:table-cell">Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Members</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{agency.name}</p>
                        <p className="text-xs text-muted-foreground">{agency.owner}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={agency.plan === 'Enterprise' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : agency.plan === 'Pro' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                        {agency.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{agency.members}</TableCell>
                    <TableCell>{agency.leads}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={agency.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}>
                        {agency.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const mockPayments = [
  { id: '1', user: 'John Smith', amount: 99, status: 'completed', method: 'Credit Card', date: '2025-03-01' },
  { id: '2', user: 'Sarah Johnson', amount: 49, status: 'completed', method: 'Credit Card', date: '2025-03-01' },
  { id: '3', user: 'Mike Chen', amount: 199, status: 'completed', method: 'Wire Transfer', date: '2025-02-28' },
  { id: '4', user: 'Lisa Brown', amount: 29, status: 'failed', method: 'Credit Card', date: '2025-02-28' },
  { id: '5', user: 'Tom Wilson', amount: 99, status: 'pending', method: 'PayPal', date: '2025-02-27' },
  { id: '6', user: 'Emily Davis', amount: 49, status: 'completed', method: 'Credit Card', date: '2025-02-27' },
]

export function AdminPayments() {
  return (
    <div className="space-y-6">
      <PageHeader icon={DollarSign} title="Payments" description="View and manage payment history" color="emerald" />

      <KPIDashboard items={[
        { title: 'Total Payments', value: '$4,231', icon: <DollarSign className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'This Month', value: '$1,245', icon: <TrendingUp className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Failed', value: '3', icon: <XCircle className="h-5 w-5 text-red-600" />, gradient: 'from-red-400 to-red-600' },
        { title: 'Pending', value: '5', icon: <Clock className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription>{mockPayments.length} recent payments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{p.user}</TableCell>
                    <TableCell className="font-bold">${p.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{p.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const mockTransactions = [
  { id: '1', user: 'John Smith', type: 'subscription', amount: 99, status: 'success', description: 'Pro Plan - Monthly', date: '2025-03-01T10:30:00Z' },
  { id: '2', user: 'Sarah Johnson', type: 'credit_purchase', amount: 25, status: 'success', description: '250 credits purchase', date: '2025-03-01T09:15:00Z' },
  { id: '3', user: 'Mike Chen', type: 'subscription', amount: 199, status: 'success', description: 'Enterprise Plan - Monthly', date: '2025-02-28T14:22:00Z' },
  { id: '4', user: 'Lisa Brown', type: 'refund', amount: -29, status: 'success', description: 'Starter plan refund', date: '2025-02-28T11:45:00Z' },
  { id: '5', user: 'Tom Wilson', type: 'credit_purchase', amount: 50, status: 'pending', description: '500 credits purchase', date: '2025-02-27T16:30:00Z' },
]

export function AdminTransactions() {
  return (
    <div className="space-y-6">
      <PageHeader icon={Receipt} title="Transactions" description="View all platform transactions" color="amber" />

      <KPIDashboard items={[
        { title: 'Total Transactions', value: '156', icon: <Receipt className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Revenue', value: '$12,431', icon: <DollarSign className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Refunds', value: '$231', icon: <AlertTriangle className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Pending', value: '8', icon: <Clock className="h-5 w-5 text-rose-600" />, gradient: 'from-rose-400 to-rose-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Transactions</CardTitle>
          <CardDescription>{mockTransactions.length} recent transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm font-medium">{t.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {t.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.amount >= 0 ? '+' : ''}${t.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{t.description}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════════════════════

const mockLeads = [
  { id: '1', business: 'Sunrise Bakery', category: 'Restaurant', city: 'New York', website: false, user: 'John Smith', date: '2025-03-01' },
  { id: '2', business: 'Quick Fix Auto', category: 'Auto Repair', city: 'Chicago', website: true, user: 'Sarah Johnson', date: '2025-03-01' },
  { id: '3', business: 'Downtown Dental', category: 'Healthcare', city: 'LA', website: false, user: 'Mike Chen', date: '2025-02-28' },
  { id: '4', business: 'Smith Real Estate', category: 'Real Estate', city: 'Houston', website: false, user: 'Lisa Brown', date: '2025-02-28' },
  { id: '5', business: 'Fashion Forward', category: 'Retail', city: 'Miami', website: true, user: 'Tom Wilson', date: '2025-02-27' },
]

export function AdminLeads() {
  return (
    <div className="space-y-6">
      <PageHeader icon={Target} title="All Leads" description="Platform-wide leads overview" color="amber" />

      <KPIDashboard items={[
        { title: 'Total Leads', value: '2,431', icon: <Target className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'No Website', value: '1,876', icon: <Globe className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Has Website', value: '555', icon: <CheckCircle2 className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'This Week', value: '234', icon: <TrendingUp className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Leads</CardTitle>
          <CardDescription>Latest leads across all users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">City</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="hidden lg:table-cell">User</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm font-medium">{lead.business}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{lead.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{lead.city}</TableCell>
                    <TableCell>
                      {lead.website ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{lead.user}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{lead.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

const mockCategories = [
  { id: '1', name: 'Restaurant', leads: 452, growth: 12 },
  { id: '2', name: 'Retail', leads: 387, growth: 8 },
  { id: '3', name: 'Healthcare', leads: 298, growth: -2 },
  { id: '4', name: 'Real Estate', leads: 256, growth: 15 },
  { id: '5', name: 'Auto Repair', leads: 198, growth: 5 },
  { id: '6', name: 'Legal Services', leads: 167, growth: 20 },
  { id: '7', name: 'Beauty & Spa', leads: 145, growth: -1 },
]

export function AdminCategories() {
  const [addOpen, setAddOpen] = useState(false)
  const [newCat, setNewCat] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tag}
        title="Categories"
        description="Manage business categories"
        color="orange"
        action={
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        }
      />

      <KPIDashboard items={[
        { title: 'Total Categories', value: '24', icon: <Tag className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Active Leads', value: '1,903', icon: <Target className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Avg per Category', value: '79', icon: <BarChart3 className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Growing', value: '18', icon: <TrendingUp className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-sm font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.leads}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${cat.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new business category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input placeholder="e.g., Fitness & Gym" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const mockLocations = [
  { id: '1', city: 'New York', state: 'NY', leads: 1245, businesses: 342 },
  { id: '2', city: 'Los Angeles', state: 'CA', leads: 987, businesses: 287 },
  { id: '3', city: 'Chicago', state: 'IL', leads: 756, businesses: 198 },
  { id: '4', city: 'Houston', state: 'TX', leads: 634, businesses: 167 },
  { id: '5', city: 'Phoenix', state: 'AZ', leads: 512, businesses: 134 },
  { id: '6', city: 'Miami', state: 'FL', leads: 478, businesses: 121 },
]

export function AdminLocations() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MapPin}
        title="Locations"
        description="Manage cities and regions"
        color="rose"
        action={
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Location
          </Button>
        }
      />

      <KPIDashboard items={[
        { title: 'Total Cities', value: '89', icon: <MapPin className="h-5 w-5 text-rose-600" />, gradient: 'from-rose-400 to-rose-600' },
        { title: 'Total Leads', value: '4,612', icon: <Target className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Businesses', value: '1,249', icon: <Building2 className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Top Region', value: 'Northeast', icon: <Globe className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Locations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead className="hidden sm:table-cell">Businesses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLocations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="text-sm font-medium">{loc.city}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{loc.state}</TableCell>
                    <TableCell>{loc.leads.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{loc.businesses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>Add a new city or region</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>City</Label><Input placeholder="City name" /></div>
            <div className="space-y-2"><Label>State</Label><Input placeholder="State" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(false)}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// API USAGE
// ═══════════════════════════════════════════════════════════════════════════════

const apiUsageData = [
  { day: 'Mon', requests: 1245, errors: 12, latency: 145 },
  { day: 'Tue', requests: 1512, errors: 8, latency: 132 },
  { day: 'Wed', requests: 1387, errors: 15, latency: 156 },
  { day: 'Thu', requests: 1656, errors: 5, latency: 128 },
  { day: 'Fri', requests: 1498, errors: 9, latency: 141 },
  { day: 'Sat', requests: 756, errors: 3, latency: 118 },
  { day: 'Sun', requests: 634, errors: 2, latency: 112 },
]

export function AdminApiUsage() {
  const config = {
    requests: { label: 'Requests', color: '#f59e0b' },
    errors: { label: 'Errors', color: '#ef4444' },
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="API Usage" description="Monitor API requests and performance" color="amber" />

      <KPIDashboard items={[
        { title: 'Total Requests', value: '8,688', icon: <Activity className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Error Rate', value: '0.6%', icon: <AlertTriangle className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Avg Latency', value: '133ms', icon: <Zap className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Uptime', value: '99.9%', icon: <Heart className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Requests & Errors</CardTitle>
            <CardDescription>Weekly API request volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={config} className="h-[280px] w-full">
              <BarChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="requests" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="errors" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Latency</CardTitle>
            <CardDescription>Average response time in ms</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={{ latency: { label: 'Latency', color: '#10b981' } }} className="h-[280px] w-full">
              <AreaChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="latency" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { endpoint: '/api/businesses/search', calls: '4,231', avgLatency: '120ms', status: 'healthy' },
              { endpoint: '/api/leads', calls: '2,876', avgLatency: '98ms', status: 'healthy' },
              { endpoint: '/api/businesses/audit', calls: '1,245', avgLatency: '340ms', status: 'degraded' },
              { endpoint: '/api/export', calls: '334', avgLatency: '890ms', status: 'healthy' },
            ].map((ep) => (
              <div key={ep.endpoint} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{ep.endpoint}</code>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{ep.calls} calls</span>
                  <span className="text-muted-foreground">{ep.avgLatency}</span>
                  <Badge variant="outline" className={ep.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                    {ep.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM HEALTH
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminSystemHealth() {
  const healthItems = [
    { name: 'API Server', status: 'operational', uptime: '99.98%', latency: '45ms', icon: Globe },
    { name: 'Database', status: 'operational', uptime: '99.99%', latency: '12ms', icon: Activity },
    { name: 'Search Engine', status: 'operational', uptime: '99.95%', latency: '78ms', icon: Search },
    { name: 'Email Service', status: 'degraded', uptime: '98.5%', latency: '340ms', icon: Mail },
    { name: 'File Storage', status: 'operational', uptime: '99.99%', latency: '23ms', icon: Heart },
    { name: 'Queue Worker', status: 'operational', uptime: '99.97%', latency: '56ms', icon: Zap },
  ]

  return (
    <div className="space-y-6">
      <PageHeader icon={Heart} title="System Health" description="Monitor system status and performance" color="rose" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthItems.map((h) => (
          <Card key={h.name} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{h.name}</h3>
                </div>
                <Badge variant="outline" className={h.status === 'operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                  <div className={`h-1.5 w-1.5 rounded-full mr-1 ${h.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {h.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Uptime</p>
                  <p className="font-semibold">{h.uptime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Latency</p>
                  <p className="font-semibold">{h.latency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">System Metrics</CardTitle>
          <CardDescription>Real-time system resource usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'CPU Usage', value: 42, color: 'bg-emerald-500' },
            { label: 'Memory Usage', value: 67, color: 'bg-amber-500' },
            { label: 'Disk Usage', value: 34, color: 'bg-emerald-500' },
            { label: 'Network I/O', value: 28, color: 'bg-emerald-500' },
          ].map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{m.label}</span>
                <span className="font-medium">{m.value}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.color} transition-all duration-500`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

const mockAuditLogs = [
  { id: '1', user: 'admin@bwfinder.com', action: 'user.role.update', target: 'john@example.com', ip: '192.168.1.1', date: '2025-03-01T10:30:00Z' },
  { id: '2', user: 'admin@bwfinder.com', action: 'subscription.cancel', target: 'sarah@example.com', ip: '192.168.1.1', date: '2025-03-01T09:15:00Z' },
  { id: '3', user: 'super@bwfinder.com', action: 'credits.add', target: 'mike@example.com', ip: '10.0.0.1', date: '2025-02-28T14:22:00Z' },
  { id: '4', user: 'admin@bwfinder.com', action: 'user.ban', target: 'lisa@example.com', ip: '192.168.1.1', date: '2025-02-28T11:45:00Z' },
  { id: '5', user: 'system', action: 'cron.cleanup', target: 'expired_sessions', ip: '127.0.0.1', date: '2025-02-27T00:00:00Z' },
]

export function AdminAuditLogs() {
  const [actionFilter, setActionFilter] = useState('all')

  const filtered = actionFilter === 'all' ? mockAuditLogs : mockAuditLogs.filter((l) => l.action.startsWith(actionFilter))

  return (
    <div className="space-y-6">
      <PageHeader icon={FileText} title="Audit Logs" description="Track all administrative actions" color="slate" />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="credits">Credits</SelectItem>
                <SelectItem value="cron">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Logs</CardTitle>
          <CardDescription>{filtered.length} log entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden sm:table-cell">Target</TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm font-medium font-mono">{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-mono text-xs">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">{log.target}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">{log.ip}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminReports() {
  const reportItems = [
    { name: 'Monthly Revenue Report', description: 'Revenue breakdown by source', type: 'Financial', lastRun: '2 hours ago', icon: DollarSign },
    { name: 'User Growth Report', description: 'User signups and retention', type: 'Growth', lastRun: '1 day ago', icon: Users },
    { name: 'Churn Analysis', description: 'Subscription churn metrics', type: 'Financial', lastRun: '3 days ago', icon: TrendingUp },
    { name: 'API Performance', description: 'API latency and error rates', type: 'Technical', lastRun: '6 hours ago', icon: Activity },
    { name: 'Lead Generation', description: 'Leads by category and location', type: 'Growth', lastRun: '1 day ago', icon: Target },
    { name: 'Credits Usage', description: 'Credit consumption patterns', type: 'Financial', lastRun: '12 hours ago', icon: Zap },
  ]

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Reports" description="Generate and view platform reports" color="amber" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportItems.map((report) => (
          <Card key={report.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <report.icon className="h-5 w-5 text-amber-600" />
                </div>
                <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
              </div>
              <h3 className="font-semibold mb-1">{report.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last run: {report.lastRun}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPORT
// ═══════════════════════════════════════════════════════════════════════════════

const mockTickets = [
  { id: '1', subject: 'Cannot export leads', user: 'john@example.com', priority: 'high', status: 'open', date: '2025-03-01' },
  { id: '2', subject: 'Billing issue - double charged', user: 'sarah@example.com', priority: 'urgent', status: 'open', date: '2025-03-01' },
  { id: '3', subject: 'API rate limit too low', user: 'mike@example.com', priority: 'medium', status: 'in_progress', date: '2025-02-28' },
  { id: '4', subject: 'Feature request: Dark mode', user: 'lisa@example.com', priority: 'low', status: 'resolved', date: '2025-02-27' },
  { id: '5', subject: 'Credits not updating', user: 'tom@example.com', priority: 'high', status: 'open', date: '2025-02-27' },
]

export function AdminSupport() {
  return (
    <div className="space-y-6">
      <PageHeader icon={LifeBuoy} title="Support Tickets" description="Manage customer support requests" color="orange" />

      <KPIDashboard items={[
        { title: 'Open Tickets', value: '12', icon: <AlertTriangle className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'In Progress', value: '8', icon: <Clock className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Resolved Today', value: '5', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Avg Response', value: '2.4h', icon: <Zap className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Tickets</CardTitle>
          <CardDescription>{mockTickets.length} tickets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">User</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm font-medium">{t.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-200' : t.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : t.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={t.status === 'open' ? 'bg-orange-50 text-orange-700 border-orange-200' : t.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{t.user}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{t.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const mockAnnouncements = [
  { id: '1', title: 'New Feature: AI Lead Scoring', status: 'published', audience: 'all', date: '2025-03-01' },
  { id: '2', title: 'Maintenance Window - March 15', status: 'draft', audience: 'all', date: '2025-02-28' },
  { id: '3', title: 'Pro Plan Price Update', status: 'published', audience: 'pro', date: '2025-02-25' },
]

export function AdminAnnouncements() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Announcements"
        description="Manage platform announcements"
        color="amber"
        action={
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Announcement
          </Button>
        }
      />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Announcements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnnouncements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={a.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{a.audience}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{a.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Create a platform announcement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Announcement title" /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Write your announcement..." rows={4} /></div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="pro">Pro Users</SelectItem>
                  <SelectItem value="enterprise">Enterprise Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setAddOpen(false)}>
              <Send className="h-4 w-4 mr-2" /> Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL BROADCAST
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminEmailBroadcast() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')

  return (
    <div className="space-y-6">
      <PageHeader icon={Mail} title="Email Broadcast" description="Send mass email to users" color="amber" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Email subject line..." value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea placeholder="Write your email content..." rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="pro">Pro Users</SelectItem>
                    <SelectItem value="enterprise">Enterprise Users</SelectItem>
                    <SelectItem value="churned">Churned Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Send className="h-4 w-4 mr-2" /> Send Broadcast
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Audience Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">2,431</div>
              <p className="text-sm text-muted-foreground">users will receive this email</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent Broadcasts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { subject: 'March Newsletter', sent: '2,198', date: 'Mar 1' },
                { subject: 'Feature Update', sent: '1,876', date: 'Feb 15' },
                { subject: 'Holiday Offer', sent: '2,312', date: 'Feb 1' },
              ].map((b) => (
                <div key={b.subject} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{b.subject}</p>
                    <p className="text-xs text-muted-foreground">{b.date}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{b.sent} sent</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP BROADCAST
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminWhatsappBroadcast() {
  const [message, setMessage] = useState('')
  const [template, setTemplate] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader icon={Smartphone} title="WhatsApp Broadcast" description="Send WhatsApp messages to users" color="emerald" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Message</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Type your WhatsApp message..." rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-muted-foreground">{message.length}/1000 characters</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Send className="h-4 w-4 mr-2" /> Send Broadcast
                </Button>
                <Button variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base">WhatsApp Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Messages Sent', value: '1,234' },
              { label: 'Delivered', value: '1,198' },
              { label: 'Read', value: '876' },
              { label: 'Response Rate', value: '23%' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminMarketing() {
  return (
    <div className="space-y-6">
      <PageHeader icon={TrendingUp} title="Marketing" description="Marketing campaigns and analytics" color="amber" />

      <KPIDashboard items={[
        { title: 'Active Campaigns', value: '4', icon: <TrendingUp className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Email Open Rate', value: '34%', icon: <Mail className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'Click Rate', value: '12%', icon: <Target className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Conversions', value: '156', icon: <Zap className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Spring Sale 2025', status: 'Running', channel: 'Email', reach: '2,431', conversions: 89 },
            { name: 'Pro Upgrade Push', status: 'Running', channel: 'Email + WhatsApp', reach: '1,876', conversions: 45 },
            { name: 'New User Onboarding', status: 'Running', channel: 'Email', reach: '342', conversions: 22 },
            { name: 'Win-back Campaign', status: 'Paused', channel: 'Email', reach: '567', conversions: 0 },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${c.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.channel} &bull; {c.reach} reached</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={c.status === 'Running' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                  {c.status}
                </Badge>
                <span className="text-sm font-medium">{c.conversions} conv.</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminIntegrations() {
  const integrations = [
    { name: 'Stripe', description: 'Payment processing', status: 'connected', icon: DollarSign },
    { name: 'Google Maps', description: 'Location data & geocoding', status: 'connected', icon: MapPin },
    { name: 'SendGrid', description: 'Email delivery service', status: 'connected', icon: Mail },
    { name: 'Twilio', description: 'WhatsApp & SMS messaging', status: 'connected', icon: Smartphone },
    { name: 'OpenAI', description: 'AI-powered features', status: 'connected', icon: Brain },
    { name: 'Slack', description: 'Team notifications', status: 'disconnected', icon: ExternalLink },
  ]

  return (
    <div className="space-y-6">
      <PageHeader icon={Puzzle} title="Integrations" description="Manage third-party service integrations" color="teal" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <Card key={int.name} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <int.icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{int.name}</h3>
                    <p className="text-xs text-muted-foreground">{int.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={int.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                  <div className={`h-1.5 w-1.5 rounded-full mr-1 ${int.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {int.status}
                </Badge>
                <Button variant="outline" size="sm">
                  {int.status === 'connected' ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI USAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminAiUsage() {
  const aiData = [
    { day: 'Mon', tokens: 24500, cost: 4.90, requests: 312 },
    { day: 'Tue', tokens: 31200, cost: 6.24, requests: 389 },
    { day: 'Wed', tokens: 28700, cost: 5.74, requests: 356 },
    { day: 'Thu', tokens: 35600, cost: 7.12, requests: 445 },
    { day: 'Fri', tokens: 29800, cost: 5.96, requests: 378 },
    { day: 'Sat', tokens: 15600, cost: 3.12, requests: 198 },
    { day: 'Sun', tokens: 13400, cost: 2.68, requests: 167 },
  ]

  const config = {
    tokens: { label: 'Tokens', color: '#f59e0b' },
    cost: { label: 'Cost ($)', color: '#10b981' },
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Brain} title="AI Usage" description="Monitor AI feature consumption and costs" color="amber" />

      <KPIDashboard items={[
        { title: 'Total Tokens', value: '178.8k', icon: <Brain className="h-5 w-5 text-amber-600" />, gradient: 'from-amber-400 to-amber-600' },
        { title: 'Total Cost', value: '$35.76', icon: <DollarSign className="h-5 w-5 text-emerald-600" />, gradient: 'from-emerald-400 to-emerald-600' },
        { title: 'API Requests', value: '2,245', icon: <Activity className="h-5 w-5 text-orange-600" />, gradient: 'from-orange-400 to-orange-600' },
        { title: 'Avg per Request', value: '79.6', icon: <Zap className="h-5 w-5 text-teal-600" />, gradient: 'from-teal-400 to-teal-600' },
      ]} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Token Usage This Week</CardTitle>
          <CardDescription>Daily AI token consumption</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={config} className="h-[300px] w-full">
            <BarChart data={aiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tokens" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI Features Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { feature: 'Lead Scoring', tokens: '45.2k', cost: '$9.04', pct: 25 },
            { feature: 'Email Generation', tokens: '38.7k', cost: '$7.74', pct: 22 },
            { feature: 'WhatsApp Scripts', tokens: '35.6k', cost: '$7.12', pct: 20 },
            { feature: 'Website Detection', tokens: '32.1k', cost: '$6.42', pct: 18 },
            { feature: 'Audit Reports', tokens: '27.2k', cost: '$5.44', pct: 15 },
          ].map((f) => (
            <div key={f.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.feature}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{f.tokens} tokens</span>
                  <span>{f.cost}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

const mockFlags = [
  { id: '1', name: 'ai_lead_scoring', description: 'AI-powered lead scoring feature', enabled: true, rollout: 100 },
  { id: '2', name: 'whatsapp_broadcast', description: 'WhatsApp broadcast messaging', enabled: true, rollout: 75 },
  { id: '3', name: 'dark_mode', description: 'Dark mode theme support', enabled: true, rollout: 100 },
  { id: '4', name: 'new_dashboard', description: 'Redesigned dashboard experience', enabled: false, rollout: 0 },
  { id: '5', name: 'api_rate_limit_v2', description: 'New API rate limiting system', enabled: false, rollout: 10 },
  { id: '6', name: 'bulk_export', description: 'Bulk data export feature', enabled: true, rollout: 50 },
]

export function AdminFeatureFlags() {
  const [flags, setFlags] = useState(mockFlags)

  const toggleFlag = (id: string) => {
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled, rollout: !f.enabled ? 100 : 0 } : f))
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={ToggleLeft} title="Feature Flags" description="Control feature rollouts and availability" color="orange" />

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Feature Flags</CardTitle>
          <CardDescription>{flags.length} flags configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono font-semibold">{flag.name}</code>
                  <Badge variant="outline" className={flag.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                    {flag.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{flag.description}</p>
                {flag.enabled && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full flex-1 max-w-[200px] overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${flag.rollout}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{flag.rollout}% rollout</span>
                  </div>
                )}
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={() => toggleFlag(flag.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader icon={Settings} title="Admin Settings" description="Configure platform settings" color="slate" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="BW Finder" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@bwfinder.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Default Plan</Label>
              <Select defaultValue="free">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Credit Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Credits (New User)</Label>
              <Input defaultValue="50" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Lead Cost (Credits)</Label>
              <Input defaultValue="1" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Search Cost (Credits)</Label>
              <Input defaultValue="0.5" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Allow Credit Purchases</Label>
              <Switch defaultChecked />
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">IP Whitelist</p>
                <p className="text-xs text-muted-foreground">Restrict admin access by IP</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'New user signup', desc: 'When a new user registers' },
              { label: 'Payment received', desc: 'When a payment is processed' },
              { label: 'Subscription canceled', desc: 'When a subscription is canceled' },
              { label: 'High error rate', desc: 'When API errors exceed threshold' },
              { label: 'Support ticket', desc: 'When a new ticket is created' },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
