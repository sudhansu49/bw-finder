'use client'

import { useState, useEffect } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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

export function OutreachView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [entries, setEntries] = useState<OutreachEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [newEntry, setNewEntry] = useState({
    leadId: '',
    type: 'Email' as OutreachType,
    subject: '',
    notes: '',
    outcome: '',
  })
  const [leads, setLeads] = useState<{ id: string; business: { name: string } }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user?.id || 'demo'
        const [outreachRes, leadsRes] = await Promise.all([
          fetch(`/api/outreach?userId=${userId}`),
          fetch(`/api/leads?userId=${userId}`),
        ])

        if (outreachRes.ok) {
          const data = await outreachRes.json()
          setEntries(data.outreach || [])
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
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

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

  const handleAddEntry = async () => {
    try {
      const selectedLead = leads.find((l) => l.id === newEntry.leadId)
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: newEntry.leadId,
          userId: user?.id || 'demo',
          type: newEntry.type,
          subject: newEntry.subject,
          notes: newEntry.notes,
          outcome: newEntry.outcome || undefined,
        }),
      })

      const newOutreachEntry: OutreachEntry = {
        id: 'new-' + Date.now(),
        leadId: newEntry.leadId,
        businessName: selectedLead?.business?.name || 'Unknown',
        type: newEntry.type,
        subject: newEntry.subject,
        notes: newEntry.notes,
        outcome: newEntry.outcome || undefined,
        date: new Date().toISOString(),
      }

      setEntries((prev) => [newOutreachEntry, ...prev])
      toast({ title: 'Outreach Added!', description: `${newEntry.type} outreach logged for ${newOutreachEntry.businessName}` })
    } catch {
      const selectedLead = leads.find((l) => l.id === newEntry.leadId)
      const newOutreachEntry: OutreachEntry = {
        id: 'new-' + Date.now(),
        leadId: newEntry.leadId,
        businessName: selectedLead?.business?.name || 'Unknown',
        type: newEntry.type,
        subject: newEntry.subject,
        notes: newEntry.notes,
        outcome: newEntry.outcome || undefined,
        date: new Date().toISOString(),
      }
      setEntries((prev) => [newOutreachEntry, ...prev])
      toast({ title: 'Outreach Added!', description: `${newEntry.type} outreach logged` })
    }

    setNewEntry({ leadId: '', type: 'Email', subject: '', notes: '', outcome: '' })
    setAddDialogOpen(false)
  }

  const filteredEntries = typeFilter === 'All'
    ? entries
    : entries.filter((e) => e.type === typeFilter)

  // Group entries by date
  const groupedByDate = filteredEntries.reduce((groups, entry) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outreach</h1>
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
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.business?.name || `Lead ${lead.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                disabled={!newEntry.leadId || !newEntry.subject.trim()}
              >
                Log Outreach
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">Filter:</span>
        {['All', ...outreachTypes].map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 ${typeFilter === type ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
            onClick={() => setTypeFilter(type)}
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
                  <h3 className="text-sm font-semibold text-slate-700">{date}</h3>
                  <Separator className="flex-1" />
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
                          <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div className="w-px h-full bg-slate-200 mt-1" />
                        </div>

                        {/* Content */}
                        <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{entry.businessName}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {entry.type}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{entry.subject}</p>
                                {entry.notes && (
                                  <p className="text-xs text-muted-foreground">{entry.notes}</p>
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
                                        ? 'bg-green-50 text-green-700'
                                        : entry.outcome.toLowerCase().includes('lost')
                                        ? 'bg-red-50 text-red-700'
                                        : entry.outcome.toLowerCase().includes('interested')
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {entry.outcome}
                                  </Badge>
                                )}
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

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No outreach activities found</p>
              <p className="text-sm text-muted-foreground">Start by logging your first outreach</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
