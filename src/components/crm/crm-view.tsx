'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  StickyNote,
  ListTodo,
  Bell,
  Activity,
  X,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Trophy,
  XCircle,
  Eye,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────

interface PipelineStage {
  id: string
  label: string
  color: string
}

interface Business {
  id: string
  name: string
  category: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  hasWebsite: boolean
  leadScore?: number
  opportunityScore?: number
}

interface LeadTask {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
  completed: boolean
  completedAt?: string | null
  createdAt: string
  user?: { id: string; name: string }
}

interface LeadNote {
  id: string
  content: string
  createdAt: string
  user?: { id: string; name: string }
}

interface Reminder {
  id: string
  title: string
  description?: string | null
  dueDate: string
  completed: boolean
  createdAt: string
  user?: { id: string; name: string }
}

interface ActivityLogItem {
  id: string
  action: string
  details?: string | null
  createdAt: string
  user?: { id: string; name: string }
}

interface Lead {
  id: string
  status: string
  priority: string
  estimatedValue?: number | null
  notes?: string | null
  lastContactedAt?: string | null
  createdAt: string
  updatedAt: string
  business: Business
  user: { id: string; name: string; email: string }
  _count: { leadNotes: number; leadTasks: number; reminders: number; activities: number }
  leadTasks: LeadTask[]
  reminders: Reminder[]
}

interface PipelineData {
  pipeline: Record<string, Lead[]>
  stages: PipelineStage[]
  stats: {
    totalLeads: number
    totalValue: number
    wonValue: number
    conversionRate: number
  }
}

// ── Stage Config ──────────────────────────────────────────────────

const STAGE_ICONS: Record<string, React.ElementType> = {
  new_lead: Sparkles,
  contacted: Phone,
  interested: Eye,
  meeting_scheduled: Calendar,
  proposal_sent: Mail,
  won: Trophy,
  lost: XCircle,
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Lead created',
  status_change: 'Status changed',
  note_added: 'Note added',
  task_added: 'Task added',
  task_completed: 'Task completed',
  reminder_added: 'Reminder set',
}

// ── Lead Card ────────────────────────────────────────────────────

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const priority = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.medium
  const hasTasks = lead.leadTasks && lead.leadTasks.length > 0
  const hasReminders = lead.reminders && lead.reminders.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-white">
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">
              {lead.business.name}
            </h4>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${priority.bg} ${priority.color} border-0`}>
              {priority.label}
            </Badge>
          </div>

          {/* Category & Location */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              <Tag className="h-2.5 w-2.5 mr-0.5" />
              {lead.business.category}
            </Badge>
            {lead.business.city && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {lead.business.city}
              </span>
            )}
          </div>

          {/* Value */}
          {lead.estimatedValue && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                ₹{lead.estimatedValue.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Indicators */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            {lead.business.leadScore != null && (
              <span className="text-[10px] text-muted-foreground">
                Score: <span className="font-semibold text-slate-700">{lead.business.leadScore}</span>
              </span>
            )}
            {hasTasks && (
              <span className="text-[10px] text-blue-600 flex items-center gap-0.5">
                <ListTodo className="h-2.5 w-2.5" />
                {lead.leadTasks.length}
              </span>
            )}
            {hasReminders && (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <Bell className="h-2.5 w-2.5" />
                {lead.reminders.length}
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ChevronRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Pipeline Column ──────────────────────────────────────────────

function PipelineColumn({
  stage,
  leads,
  onLeadClick,
}: {
  stage: PipelineStage
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}) {
  const Icon = STAGE_ICONS[stage.id] || Circle
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-white border border-slate-200">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stage.color + '20' }}>
          <Icon className="h-4 w-4" style={{ color: stage.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-900 truncate">{stage.label}</h3>
          <p className="text-[10px] text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} · ₹{totalValue.toLocaleString('en-IN')}
          </p>
        </div>
        <Badge variant="secondary" className="h-5 text-[10px] px-1.5" style={{ backgroundColor: stage.color + '15', color: stage.color }}>
          {leads.length}
        </Badge>
      </div>

      {/* Lead Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 custom-scrollbar">
        <AnimatePresence>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </AnimatePresence>
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Icon className="h-8 w-8 mb-2 opacity-20" style={{ color: stage.color }} />
            <p className="text-xs">No leads here yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Lead Detail Panel ────────────────────────────────────────────

function LeadDetailPanel({
  lead,
  onClose,
  onRefresh,
}: {
  lead: Lead
  onClose: () => void
  onRefresh: () => void
}) {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('details')
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [tasks, setTasks] = useState<LeadTask[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activities, setActivities] = useState<ActivityLogItem[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)

  // Form states
  const [newNote, setNewNote] = useState('')
  const [newTask, setNewTask] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')
  const [newReminder, setNewReminder] = useState('')
  const [newReminderDue, setNewReminderDue] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(lead.status)
  const [selectedPriority, setSelectedPriority] = useState(lead.priority)
  const [estimatedValue, setEstimatedValue] = useState(lead.estimatedValue?.toString() || '')

  // Load lead details
  useEffect(() => {
    const loadDetails = async () => {
      setLoadingDetails(true)
      try {
        const [notesRes, tasksRes, remindersRes, activitiesRes] = await Promise.all([
          fetch(`/api/crm/notes?leadId=${lead.id}`),
          fetch(`/api/crm/tasks?leadId=${lead.id}`),
          fetch(`/api/crm/reminders?leadId=${lead.id}`),
          fetch(`/api/crm/activities?leadId=${lead.id}`),
        ])
        if (notesRes.ok) setNotes((await notesRes.json()).notes || [])
        if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || [])
        if (remindersRes.ok) setReminders((await remindersRes.json()).reminders || [])
        if (activitiesRes.ok) setActivities((await activitiesRes.json()).activities || [])
      } catch {
        // Silent fail
      } finally {
        setLoadingDetails(false)
      }
    }
    loadDetails()
  }, [lead.id])

  // Update lead
  const handleUpdateLead = async () => {
    try {
      const res = await fetch('/api/crm/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          status: selectedStatus,
          priority: selectedPriority,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          userId: user?.id || 'demo',
        }),
      })
      if (res.ok) {
        toast({ title: 'Lead updated!' })
        onRefresh()
      }
    } catch {
      toast({ title: 'Failed to update lead', variant: 'destructive' })
    }
  }

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const res = await fetch('/api/crm/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, userId: user?.id || 'demo', content: newNote.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(prev => [data.note, ...prev])
        setNewNote('')
        toast({ title: 'Note added!' })
      }
    } catch {
      toast({ title: 'Failed to add note', variant: 'destructive' })
    }
  }

  // Add task
  const handleAddTask = async () => {
    if (!newTask.trim()) return
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          userId: user?.id || 'demo',
          title: newTask.trim(),
          dueDate: newTaskDue || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => [data.task, ...prev])
        setNewTask('')
        setNewTaskDue('')
        toast({ title: 'Task added!' })
      }
    } catch {
      toast({ title: 'Failed to add task', variant: 'destructive' })
    }
  }

  // Toggle task
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed: !completed }),
      })
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed, completedAt: !completed ? new Date().toISOString() : null } : t))
        toast({ title: completed ? 'Task reopened' : 'Task completed!' })
      }
    } catch {
      toast({ title: 'Failed to update task', variant: 'destructive' })
    }
  }

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/crm/tasks?taskId=${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        toast({ title: 'Task deleted' })
      }
    } catch {
      toast({ title: 'Failed to delete task', variant: 'destructive' })
    }
  }

  // Add reminder
  const handleAddReminder = async () => {
    if (!newReminder.trim() || !newReminderDue) return
    try {
      const res = await fetch('/api/crm/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          userId: user?.id || 'demo',
          title: newReminder.trim(),
          dueDate: newReminderDue,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setReminders(prev => [data.reminder, ...prev])
        setNewReminder('')
        setNewReminderDue('')
        toast({ title: 'Reminder set!' })
      }
    } catch {
      toast({ title: 'Failed to add reminder', variant: 'destructive' })
    }
  }

  // Complete reminder
  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch('/api/crm/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId, completed: true }),
      })
      if (res.ok) {
        setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, completed: true } : r))
        toast({ title: 'Reminder completed' })
      }
    } catch {
      toast({ title: 'Failed to update reminder', variant: 'destructive' })
    }
  }

  // Delete reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`/api/crm/reminders?reminderId=${reminderId}`, { method: 'DELETE' })
      if (res.ok) {
        setReminders(prev => prev.filter(r => r.id !== reminderId))
        toast({ title: 'Reminder deleted' })
      }
    } catch {
      toast({ title: 'Failed to delete reminder', variant: 'destructive' })
    }
  }

  const priority = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.medium
  const biz = lead.business

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 truncate">{biz.name}</h2>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              <Tag className="h-2.5 w-2.5 mr-0.5" /> {biz.category}
            </Badge>
            {biz.city && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {biz.city}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-4">
          <TabsList className="h-10 bg-transparent p-0 gap-4">
            <TabsTrigger value="details" className="text-xs data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 pb-0">Details</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 pb-0">
              Notes{notes.length > 0 && ` (${notes.length})`}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 pb-0">
              Tasks{tasks.length > 0 && ` (${tasks.filter(t => !t.completed).length})`}
            </TabsTrigger>
            <TabsTrigger value="reminders" className="text-xs data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 pb-0">
              Reminders{reminders.length > 0 && ` (${reminders.filter(r => !r.completed).length})`}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 pb-0">Activity</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Details Tab */}
          <TabsContent value="details" className="p-4 space-y-4 mt-0">
            {/* Business Info */}
            <Card className="border-0 shadow-none bg-slate-50">
              <CardContent className="p-3 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Info</h4>
                <div className="space-y-1.5">
                  {biz.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{biz.phone}</span>
                    </div>
                  )}
                  {biz.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{biz.email}</span>
                    </div>
                  )}
                  {biz.leadScore != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                      <span>Lead Score: <span className="font-semibold">{biz.leadScore}/100</span></span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editable Fields */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pipeline Stage</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New Lead</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Value (₹)</Label>
                <Input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="e.g. 24999"
                  className="h-9"
                />
              </div>

              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={handleUpdateLead}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="p-4 space-y-3 mt-0">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="text-sm resize-none min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote()
                }}
              />
              <Button
                size="sm"
                className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {notes.map((note) => (
                <Card key={note.id} className="border border-slate-200">
                  <CardContent className="p-3">
                    <p className="text-sm text-slate-800 whitespace-pre-line">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{note.user?.name || 'You'}</span>
                      <span>·</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No notes yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="p-4 space-y-3 mt-0">
            <Card className="border border-slate-200">
              <CardContent className="p-3 space-y-2">
                <Input
                  placeholder="Add a task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask()
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleAddTask}
                    disabled={!newTask.trim()}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 group">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No tasks yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="p-4 space-y-3 mt-0">
            <Card className="border border-slate-200">
              <CardContent className="p-3 space-y-2">
                <Input
                  placeholder="Reminder title..."
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={newReminderDue}
                    onChange={(e) => setNewReminderDue(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleAddReminder}
                    disabled={!newReminder.trim() || !newReminderDue}
                  >
                    Set
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-1.5">
              {reminders.map((reminder) => {
                const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date()
                return (
                  <div key={reminder.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 group">
                    <button onClick={() => handleCompleteReminder(reminder.id)}>
                      {reminder.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                      ) : (
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${reminder.completed ? 'line-through text-muted-foreground' : 'text-slate-800'}`}>
                        {reminder.title}
                      </p>
                      <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                        <Clock className="h-2.5 w-2.5" />
                        {isOverdue ? 'Overdue: ' : ''}{new Date(reminder.dueDate).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
              {reminders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No reminders set</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-4 mt-0">
            <div className="space-y-1">
              {activities.map((activity, idx) => {
                let details: Record<string, string> = {}
                try { details = JSON.parse(activity.details || '{}') } catch {}

                return (
                  <div key={activity.id} className="flex items-start gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5" />
                      {idx < activities.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <p className="text-sm text-slate-800">
                        <span className="font-medium">{ACTION_LABELS[activity.action] || activity.action}</span>
                        {details.from && details.to && (
                          <span className="text-muted-foreground"> · {details.from} → {details.to}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {activity.user?.name || 'You'} · {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No activity yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}

// ── Main CRM Component ────────────────────────────────────────────

export function CRMView() {
  const { user } = useAppStore()
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch('/api/crm/pipeline')
      if (res.ok) {
        const data = await res.json()
        setPipelineData(data)
      }
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline, user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!pipelineData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load pipeline data
      </div>
    )
  }

  const { pipeline, stages, stats } = pipelineData

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Kanban className="h-5 w-5 text-white" />
            </div>
            CRM Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your sales pipeline</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₹{stats.totalValue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₹{stats.wonValue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Won Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
        <div className="flex gap-4 min-h-[400px]">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={pipeline[stage.id] || []}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel Overlay */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={(e) => {
                // Only close if clicking the backdrop itself, not child elements
                if (e.target === e.currentTarget) setSelectedLead(null)
              }}
            />
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onRefresh={fetchPipeline}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
