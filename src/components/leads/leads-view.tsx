'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  Clock,
  User,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  Building2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'

interface Lead {
  id: string
  businessId: string
  business: { name: string; category: string; phone?: string; email?: string }
  status: LeadStatus
  priority: string
  estimatedValue: number
  notes?: string
  lastContactedAt?: string
  createdAt: string
  outreach?: { type: string; subject: string; date: string; outcome?: string }[]
}

const statusColumns: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

const statusConfig: Record<LeadStatus, { color: string; bg: string; border: string }> = {
  New: { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  Contacted: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  Qualified: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Proposal: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  Negotiation: { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  Won: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  Lost: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  high: { color: 'text-red-700', bg: 'bg-red-100' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-100' },
  low: { color: 'text-slate-600', bg: 'bg-slate-100' },
}

const outreachIcons: Record<string, React.ElementType> = {
  Email: Mail,
  Phone: Phone,
  WhatsApp: MessageSquare,
  Meeting: User,
}

export function LeadsView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newLead, setNewLead] = useState({
    businessName: '',
    category: '',
    priority: 'medium',
    estimatedValue: '',
    notes: '',
  })

  const normalizeStatus = (status: string): LeadStatus => {
    const map: Record<string, LeadStatus> = {
      new: 'New', contacted: 'Contacted', qualified: 'Qualified',
      proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
    }
    return map[status.toLowerCase()] || (status.charAt(0).toUpperCase() + status.slice(1)) as LeadStatus
  }

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const userId = user?.id || 'demo'
        const res = await fetch(`/api/leads?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          const normalized = (data.leads || []).map((l: any) => ({
            ...l,
            status: normalizeStatus(l.status),
            estimatedValue: l.estimatedValue || 0,
            business: l.business || { name: 'Unknown', category: 'Other' },
          }))
          setLeads(normalized)
        } else {
          setLeads(generateDemoLeads())
        }
      } catch {
        setLeads(generateDemoLeads())
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [user?.id])

  const generateDemoLeads = (): Lead[] => [
    { id: '1', businessId: 'b1', business: { name: "Mario's Pizza", category: 'Restaurant', phone: '(555) 123-4567' }, status: 'Contacted', priority: 'high', estimatedValue: 2500, notes: 'Interested in website redesign', lastContactedAt: '2024-01-15', createdAt: '2024-01-10', outreach: [{ type: 'Email', subject: 'Website Proposal', date: '2024-01-15', outcome: 'Interested' }] },
    { id: '2', businessId: 'b2', business: { name: 'Style Studio', category: 'Salon', phone: '(555) 345-6789' }, status: 'New', priority: 'medium', estimatedValue: 1800, notes: 'No website currently', createdAt: '2024-01-18' },
    { id: '3', businessId: 'b3', business: { name: 'Quick Fix Auto', category: 'Mechanic', phone: '(555) 456-7890' }, status: 'Proposal', priority: 'high', estimatedValue: 3200, notes: 'Sent proposal for full package', lastContactedAt: '2024-01-20', createdAt: '2024-01-08', outreach: [{ type: 'Email', subject: 'Full Package Proposal', date: '2024-01-20', outcome: 'Reviewing' }, { type: 'Phone', subject: 'Follow-up call', date: '2024-01-17', outcome: 'Positive' }] },
    { id: '4', businessId: 'b4', business: { name: 'Bright Smile Dental', category: 'Dentist', phone: '(555) 567-8901', email: 'info@brightsmile.com' }, status: 'Won', priority: 'high', estimatedValue: 4500, notes: 'Signed contract!', lastContactedAt: '2024-01-22', createdAt: '2024-01-05', outreach: [{ type: 'Meeting', subject: 'Contract signing', date: '2024-01-22', outcome: 'Won' }] },
    { id: '5', businessId: 'b5', business: { name: 'FitLife Gym', category: 'Gym', phone: '(555) 890-1234' }, status: 'Qualified', priority: 'low', estimatedValue: 2000, notes: 'Needs SEO optimization', lastContactedAt: '2024-01-19', createdAt: '2024-01-12' },
    { id: '6', businessId: 'b6', business: { name: 'Pipe Masters', category: 'Plumber', phone: '(555) 678-9012' }, status: 'New', priority: 'low', estimatedValue: 1200, createdAt: '2024-01-20' },
    { id: '7', businessId: 'b7', business: { name: 'Sweet Treats Bakery', category: 'Bakery', phone: '(555) 901-2345' }, status: 'Negotiation', priority: 'medium', estimatedValue: 2800, notes: 'Negotiating price for website + social media', lastContactedAt: '2024-01-21', createdAt: '2024-01-11', outreach: [{ type: 'WhatsApp', subject: 'Price discussion', date: '2024-01-21', outcome: 'Counter-offer' }] },
    { id: '8', businessId: 'b8', business: { name: "Johnson's Law", category: 'Lawyer', phone: '(555) 012-3456' }, status: 'Lost', priority: 'medium', estimatedValue: 3500, notes: 'Chose competitor', lastContactedAt: '2024-01-16', createdAt: '2024-01-06' },
  ]

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    )
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      })
    } catch {
      // Silent fail for demo
    }
  }

  const handleAddLead = async () => {
    try {
      // Create business first
      const businessRes = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLead.businessName,
          category: newLead.category,
          hasWebsite: false,
        }),
      })

      let businessId = 'demo-b-' + Date.now()
      if (businessRes.ok) {
        const data = await businessRes.json()
        businessId = data.business?.id || data.id || businessId
      }

      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          userId: user?.id || 'demo',
          status: 'new',
          priority: newLead.priority,
          estimatedValue: Number(newLead.estimatedValue) || 1500,
          notes: newLead.notes,
        }),
      })

      if (leadRes.ok) {
        const data = await leadRes.json()
        setLeads((prev) => [...prev, data.lead || {
          id: 'new-' + Date.now(),
          businessId,
          business: { name: newLead.businessName, category: newLead.category },
          status: 'New',
          priority: newLead.priority,
          estimatedValue: Number(newLead.estimatedValue) || 1500,
          notes: newLead.notes,
          createdAt: new Date().toISOString(),
        }])
      }

      toast({ title: 'Lead Added!', description: `${newLead.businessName} added to pipeline` })
    } catch {
      const demoLead: Lead = {
        id: 'new-' + Date.now(),
        businessId: 'demo-' + Date.now(),
        business: { name: newLead.businessName, category: newLead.category },
        status: 'New',
        priority: newLead.priority,
        estimatedValue: Number(newLead.estimatedValue) || 1500,
        notes: newLead.notes,
        createdAt: new Date().toISOString(),
      }
      setLeads((prev) => [...prev, demoLead])
      toast({ title: 'Lead Added!', description: `${newLead.businessName} added to pipeline` })
    }

    setNewLead({ businessName: '', category: '', priority: 'medium', estimatedValue: '', notes: '' })
    setAddDialogOpen(false)
  }

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setDetailDialogOpen(true)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Pipeline</h1>
          <p className="text-muted-foreground">{leads.length} leads across {statusColumns.length} stages</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Create a new lead in your pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  placeholder="Enter business name"
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newLead.category} onValueChange={(v) => setNewLead({ ...newLead, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Restaurant', 'Salon', 'Mechanic', 'Plumber', 'Electrician', 'Gym', 'Bakery', 'Dentist', 'Lawyer', 'Accountant', 'Real Estate', 'Other'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newLead.priority} onValueChange={(v) => setNewLead({ ...newLead, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Est. Value ($)</Label>
                  <Input
                    type="number"
                    placeholder="1500"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add any notes about this lead..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleAddLead}
                disabled={!newLead.businessName.trim()}
              >
                Add Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {statusColumns.map((status) => {
          const config = statusConfig[status]
          const columnLeads = leads.filter((l) => l.status === status)
          const totalValue = columnLeads.reduce((sum, l) => sum + l.estimatedValue, 0)

          return (
            <div
              key={status}
              className={`flex-shrink-0 w-72 ${config.bg} rounded-xl border ${config.border}`}
            >
              {/* Column Header */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${config.bg} border-2 ${config.border.replace('border-', 'border-')}`} />
                    <h3 className={`font-semibold text-sm ${config.color}`}>{status}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">{columnLeads.length}</Badge>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${totalValue.toLocaleString()} total
                  </p>
                )}
              </div>

              {/* Lead Cards */}
              <ScrollArea className="h-[calc(70vh-100px)] px-3 pb-3">
                <div className="space-y-3">
                  <AnimatePresence>
                    {columnLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                      >
                        <Card className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0" onClick={() => openDetail(lead)}>
                                  <h4 className="font-medium text-sm truncate">{lead.business.name}</h4>
                                  <p className="text-xs text-muted-foreground">{lead.business.category}</p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {statusColumns
                                      .filter((s) => s !== status)
                                      .map((s) => (
                                        <DropdownMenuItem
                                          key={s}
                                          onClick={() => handleStatusChange(lead.id, s)}
                                        >
                                          Move to {s}
                                        </DropdownMenuItem>
                                      ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${priorityConfig[lead.priority]?.bg || 'bg-slate-100'} ${priorityConfig[lead.priority]?.color || 'text-slate-600'}`}
                                >
                                  {lead.priority}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                  <DollarSign className="h-3 w-3" />
                                  {lead.estimatedValue.toLocaleString()}
                                </div>
                              </div>

                              {lead.lastContactedAt && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(lead.lastContactedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnLeads.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">No leads here yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  {selectedLead.business.name}
                </DialogTitle>
                <DialogDescription>{selectedLead.business.category}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      className={`mt-1 ${statusConfig[selectedLead.status].bg} ${statusConfig[selectedLead.status].color}`}
                    >
                      {selectedLead.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${priorityConfig[selectedLead.priority]?.bg} ${priorityConfig[selectedLead.priority]?.color}`}
                    >
                      {selectedLead.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Value</p>
                    <p className="font-semibold">${selectedLead.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedLead.business.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.business.phone}
                  </div>
                )}

                {selectedLead.business.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.business.email}
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm bg-slate-50 p-3 rounded-lg">{selectedLead.notes}</p>
                  </div>
                )}

                {selectedLead.outreach && selectedLead.outreach.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Outreach History</p>
                    <div className="space-y-2">
                      {selectedLead.outreach.map((o, i) => {
                        const Icon = outreachIcons[o.type] || MessageSquare
                        return (
                          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{o.subject}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{o.type}</span>
                                <span>&bull;</span>
                                <span>{new Date(o.date).toLocaleDateString()}</span>
                                {o.outcome && (
                                  <>
                                    <span>&bull;</span>
                                    <Badge variant="secondary" className="text-xs">{o.outcome}</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Move to</p>
                  <div className="flex flex-wrap gap-2">
                    {statusColumns
                      .filter((s) => s !== selectedLead.status)
                      .map((s) => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          className={`text-xs ${statusConfig[s].color} hover:${statusConfig[s].bg}`}
                          onClick={() => {
                            handleStatusChange(selectedLead.id, s)
                            setSelectedLead({ ...selectedLead, status: s })
                          }}
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />
                          {s}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
