'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Filter,
  Calendar,
  ArrowUpRight,
  Trash2,
  Pencil,
  Send,
  PhoneCall,
  MessagesSquare,
  Handshake,
  TrendingUp,
  Inbox,
  ChevronDown,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const outreachTypes = ['Email', 'Phone', 'WhatsApp', 'Meeting'] as const
type OutreachType = typeof outreachTypes[number]

const typeIcons: Record<OutreachType, React.ElementType> = {
  Email: Mail,
  Phone: Phone,
  WhatsApp: MessageSquare,
  Meeting: Users,
}

const typeColors: Record<OutreachType, { bg: string; text: string }> = {
  Email: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Phone: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  WhatsApp: { bg: 'bg-green-50', text: 'text-green-600' },
  Meeting: { bg: 'bg-purple-50', text: 'text-purple-600' },
}

// Stats card config
const statCardConfig = [
  { key: 'total', label: 'Total Outreach', icon: Inbox, gradientFrom: 'from-amber-400', gradientTo: 'to-amber-600', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  { key: 'email', label: 'Emails Sent', icon: Send, gradientFrom: 'from-blue-400', gradientTo: 'to-blue-600', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
  { key: 'phone', label: 'Calls Made', icon: PhoneCall, gradientFrom: 'from-emerald-400', gradientTo: 'to-emerald-600', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessagesSquare, gradientFrom: 'from-green-400', gradientTo: 'to-green-600', iconBg: 'bg-green-50', iconText: 'text-green-600' },
  { key: 'meeting', label: 'Meetings', icon: Handshake, gradientFrom: 'from-purple-400', gradientTo: 'to-purple-600', iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
  { key: 'responseRate', label: 'Response Rate', icon: TrendingUp, gradientFrom: 'from-orange-400', gradientTo: 'to-orange-600', iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
] as const

interface OutreachEntry {
  id: string
  leadId: string
  lead?: { business: { name: string; category: string } }
  businessName: string
  type: OutreachType
  subject: string
  notes?: string
  outcome?: string
  date: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const PAGE_SIZE = 10

export function OutreachView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [entries, setEntries] = useState<OutreachEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<OutreachEntry | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [newEntry, setNewEntry] = useState({
    leadId: '',
    type: 'Email' as OutreachType,
    subject: '',
    notes: '',
    outcome: '',
  })
  const [editEntry, setEditEntry] = useState({
    type: 'Email' as OutreachType,
    subject: '',
    notes: '',
    outcome: '',
  })
  const [leads, setLeads] = useState<{ id: string; business: { name: string } }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const userId = user?.id || 'demo'
      const [outreachRes, leadsRes] = await Promise.all([
        fetch(`/api/outreach?userId=${userId}&limit=100`),
        fetch(`/api/leads?userId=${userId}&limit=100`),
      ])

      if (outreachRes.ok) {
        const data = await outreachRes.json()
        const outreachData = (data.outreach || []).map((e: Record<string, unknown>) => ({
          id: e.id as string,
          leadId: e.leadId as string,
          lead: e.lead as { business: { name: string; category: string } } | undefined,
          businessName: (e.lead as { business: { name: string } })?.business?.name || 'Unknown',
          type: (e.type as string ? (e.type as string).charAt(0).toUpperCase() + (e.type as string).slice(1).toLowerCase() : 'Email') as OutreachType,
          subject: (e.subject as string) || '',
          notes: (e.notes as string) || undefined,
          outcome: (e.outcome as string) || undefined,
          date: (e.createdAt as string) || new Date().toISOString(),
        }))
        setEntries(outreachData)
      } else {
        setEntries(generateDemoEntries())
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json()
        setLeads(data.leads || [])
      } else {
        setLeads([
          { id: '1', business: { name: "Mario's Pizza" } },
          { id: '2', business: { name: 'Style Studio' } },
          { id: '3', business: { name: 'Quick Fix Auto' } },
          { id: '4', business: { name: 'Sweet Treats Bakery' } },
        ])
      }
    } catch {
      setEntries(generateDemoEntries())
      setLeads([
        { id: '1', business: { name: "Mario's Pizza" } },
        { id: '2', business: { name: 'Style Studio' } },
        { id: '3', business: { name: 'Quick Fix Auto' } },
      ])
      toast({
        title: 'Connection Error',
        description: 'Could not fetch outreach data. Showing demo entries.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const generateDemoEntries = (): OutreachEntry[] => [
    { id: '1', leadId: '1', businessName: "Mario's Pizza", type: 'Email', subject: 'Website Redesign Proposal', notes: 'Sent initial proposal for a new website', outcome: 'Interested', date: '2024-01-22T10:30:00' },
    { id: '2', leadId: '3', businessName: 'Quick Fix Auto', type: 'Phone', subject: 'Follow-up Call', notes: 'Discussed their current online presence challenges', outcome: 'Positive', date: '2024-01-21T14:00:00' },
    { id: '3', leadId: '7', businessName: 'Sweet Treats Bakery', type: 'WhatsApp', subject: 'Price Discussion', notes: 'They want to negotiate on the social media package', outcome: 'Counter-offer', date: '2024-01-20T09:15:00' },
    { id: '4', leadId: '4', businessName: 'Bright Smile Dental', type: 'Meeting', subject: 'Contract Signing', notes: 'Final meeting to sign the contract', outcome: 'Won', date: '2024-01-19T11:00:00' },
    { id: '5', leadId: '2', businessName: 'Style Studio', type: 'Email', subject: 'Intro Email', notes: 'Sent introduction email about our services', outcome: 'No Response', date: '2024-01-18T16:30:00' },
    { id: '6', leadId: '3', businessName: 'Quick Fix Auto', type: 'Email', subject: 'Full Package Proposal', notes: 'Detailed proposal for website + SEO + social media', outcome: 'Reviewing', date: '2024-01-17T10:00:00' },
    { id: '7', leadId: '8', businessName: "Johnson's Law", type: 'Phone', subject: 'Cold Call', notes: 'Initial cold call, they seemed interested at first', outcome: 'Lost to competitor', date: '2024-01-16T13:45:00' },
    { id: '8', leadId: '5', businessName: 'FitLife Gym', type: 'WhatsApp', subject: 'SEO Discussion', notes: 'Discussed SEO optimization for their existing site', outcome: 'Interested', date: '2024-01-15T15:20:00' },
  ]

  // ─── Computed Stats ─────────────────────────────────────────────────────────
  const stats = {
    total: entries.length,
    email: entries.filter((e) => e.type === 'Email').length,
    phone: entries.filter((e) => e.type === 'Phone').length,
    whatsapp: entries.filter((e) => e.type === 'WhatsApp').length,
    meeting: entries.filter((e) => e.type === 'Meeting').length,
    responseRate: entries.length > 0
      ? Math.round(
          (entries.filter(
            (e) =>
              e.outcome &&
              e.outcome.toLowerCase() !== 'no-response' &&
              e.outcome.toLowerCase() !== 'no response'
          ).length /
            entries.length) *
            100
        )
      : 0,
  }

  // ─── Add Entry Handler ──────────────────────────────────────────────────────
  const handleAddEntry = async () => {
    setSubmitting(true)
    try {
      const selectedLead = leads.find((l) => l.id === newEntry.leadId)
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: newEntry.leadId,
          userId: user?.id || 'demo',
          type: newEntry.type.toLowerCase(),
          subject: newEntry.subject,
          notes: newEntry.notes || undefined,
          outcome: newEntry.outcome || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const created = data.outreach
        const newOutreachEntry: OutreachEntry = {
          id: created?.id || 'new-' + Date.now(),
          leadId: newEntry.leadId,
          businessName: selectedLead?.business?.name || created?.lead?.business?.name || 'Unknown',
          type: newEntry.type,
          subject: newEntry.subject,
          notes: newEntry.notes || undefined,
          outcome: newEntry.outcome || undefined,
          date: created?.createdAt || new Date().toISOString(),
        }
        setEntries((prev) => [newOutreachEntry, ...prev])
        toast({
          title: 'Outreach Added!',
          description: `${newEntry.type} outreach logged for ${newOutreachEntry.businessName}`,
        })
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast({
          title: 'Failed to Add',
          description: errorData.error || 'Could not create outreach entry. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Could not reach the server. Please check your connection.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }

    setNewEntry({ leadId: '', type: 'Email', subject: '', notes: '', outcome: '' })
    setAddDialogOpen(false)
  }

  // ─── Edit Entry Handler ─────────────────────────────────────────────────────
  const handleEditEntry = async () => {
    if (!selectedEntry) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/outreach/${selectedEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editEntry.type.toLowerCase(),
          subject: editEntry.subject,
          notes: editEntry.notes || null,
          outcome: editEntry.outcome || null,
        }),
      })

      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === selectedEntry.id
              ? {
                  ...e,
                  type: editEntry.type,
                  subject: editEntry.subject,
                  notes: editEntry.notes || undefined,
                  outcome: editEntry.outcome || undefined,
                }
              : e
          )
        )
        toast({
          title: 'Outreach Updated',
          description: `${editEntry.type} entry for ${selectedEntry.businessName} updated successfully.`,
        })
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast({
          title: 'Update Failed',
          description: errorData.error || 'Could not update entry. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Could not reach the server. Please check your connection.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }

    setEditDialogOpen(false)
    setSelectedEntry(null)
  }

  // ─── Delete Entry Handler ───────────────────────────────────────────────────
  const handleDeleteEntry = async () => {
    if (!selectedEntry) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/outreach/${selectedEntry.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id))
        toast({
          title: 'Outreach Deleted',
          description: `${selectedEntry.type} entry for ${selectedEntry.businessName} removed.`,
        })
      } else {
        // Even if API fails (e.g., demo data), remove from local state
        setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id))
        toast({
          title: 'Outreach Removed',
          description: 'Entry removed from view.',
        })
      }
    } catch {
      // Remove locally on network error too
      setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id))
      toast({
        title: 'Outreach Removed',
        description: 'Entry removed from view.',
      })
    } finally {
      setSubmitting(false)
    }

    setDeleteDialogOpen(false)
    setSelectedEntry(null)
  }

  const openEditDialog = (entry: OutreachEntry) => {
    setSelectedEntry(entry)
    setEditEntry({
      type: entry.type,
      subject: entry.subject,
      notes: entry.notes || '',
      outcome: entry.outcome || '',
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (entry: OutreachEntry) => {
    setSelectedEntry(entry)
    setDeleteDialogOpen(true)
  }

  // ─── Filtered & Grouped ─────────────────────────────────────────────────────
  const filteredEntries =
    typeFilter === 'All'
      ? entries
      : entries.filter((e) => e.type === typeFilter)

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEntries.length

  // Group visible entries by date
  const groupedByDate = visibleEntries.reduce((groups, entry) => {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {} as Record<string, OutreachEntry[]>)

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        {/* Timeline skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <Card className="flex-1 border-0 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Outreach</h1>
          <p className="text-muted-foreground">Track all your outreach activities</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Outreach
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Outreach</DialogTitle>
              <DialogDescription>Record a new outreach activity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Lead</Label>
                <Select value={newEntry.leadId} onValueChange={(v) => setNewEntry({ ...newEntry, leadId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-sm text-muted-foreground">No leads found</p>
                        <p className="text-xs text-muted-foreground mt-1">Add leads from the Lead Finder first, then log outreach here.</p>
                      </div>
                    ) : (
                      leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.business?.name || `Lead ${lead.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {leads.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    You need at least one lead before logging outreach. Go to Lead Finder to discover businesses.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Outreach Type</Label>
                <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as OutreachType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outreachTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="What was this outreach about?"
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add details about this outreach..."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Input
                  placeholder="e.g., Interested, No Response, Call Back"
                  value={newEntry.outcome}
                  onChange={(e) => setNewEntry({ ...newEntry, outcome: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleAddEntry}
                disabled={!newEntry.leadId || !newEntry.subject.trim() || submitting}
              >
                {submitting ? 'Saving...' : 'Log Outreach'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statCardConfig.map((cfg) => {
          const Icon = cfg.icon
          const value = cfg.key === 'responseRate' ? `${stats[cfg.key]}%` : stats[cfg.key as keyof typeof stats]
          return (
            <motion.div key={cfg.key} variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className={`h-1 bg-gradient-to-r ${cfg.gradientFrom} ${cfg.gradientTo}`} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">{cfg.label}</p>
                      <p className="text-2xl font-bold tracking-tight">{value}</p>
                    </div>
                    <div className={`h-9 w-9 rounded-xl ${cfg.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-4 w-4 ${cfg.iconText}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">Filter:</span>
        {['All', ...outreachTypes].map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 ${typeFilter === type ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
            onClick={() => {
              setTypeFilter(type)
              setVisibleCount(PAGE_SIZE)
            }}
          >
            {type !== 'All' && (() => {
              const Icon = typeIcons[type as OutreachType]
              return <Icon className="h-3 w-3 mr-1" />
            })()}
            {type}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No outreach activities yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            {typeFilter !== 'All'
              ? `You haven't logged any ${typeFilter} outreach yet. Try a different filter or add a new entry.`
              : 'Start building your outreach pipeline by logging your first contact with a lead.'}
          </p>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Your First Outreach
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, dateEntries]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{date}</h3>
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">{dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'}</span>
                  </div>

                  <div className="space-y-3 ml-2">
                    {dateEntries.map((entry) => {
                      const Icon = typeIcons[entry.type] || Mail
                      const colors = typeColors[entry.type] || typeColors.Email
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-4"
                        >
                          {/* Timeline connector */}
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-xl ${colors.bg} dark:${colors.bg.replace('50', '900/30')} flex items-center justify-center shrink-0`}>
                              <Icon className={`h-5 w-5 ${colors.text}`} />
                            </div>
                            <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-1" />
                          </div>

                          {/* Content */}
                          <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm truncate">{entry.businessName}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {entry.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{entry.subject}</p>
                                  {entry.notes && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {entry.outcome && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        entry.outcome.toLowerCase().includes('won')
                                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : entry.outcome.toLowerCase().includes('lost')
                                          ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                          : entry.outcome.toLowerCase().includes('interested')
                                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                      }`}
                                    >
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                      {entry.outcome}
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-1 mt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600"
                                      onClick={() => openEditDialog(entry)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                      onClick={() => openDeleteDialog(entry)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="text-sm"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Load More ({filteredEntries.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Outreach</DialogTitle>
            <DialogDescription>
              Update notes or outcome for {selectedEntry?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Outreach Type</Label>
              <Select value={editEntry.type} onValueChange={(v) => setEditEntry({ ...editEntry, type: v as OutreachType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outreachTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={editEntry.subject}
                onChange={(e) => setEditEntry({ ...editEntry, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editEntry.notes}
                onChange={(e) => setEditEntry({ ...editEntry, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Input
                value={editEntry.outcome}
                onChange={(e) => setEditEntry({ ...editEntry, outcome: e.target.value })}
                placeholder="e.g., Interested, No Response, Call Back"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleEditEntry}
              disabled={!editEntry.subject.trim() || submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outreach Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {selectedEntry?.type} outreach to {selectedEntry?.businessName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
