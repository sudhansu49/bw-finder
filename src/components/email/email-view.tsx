'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Building2,
  MapPin,
  Tag,
  Send,
  Clock,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Phone,
  ArrowRight,
  Edit3,
  Wand2,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  Target,
  Type,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────

interface SubjectLine {
  id: string
  subject: string
  style: string
  previewText: string
}

interface EmailContent {
  id: string
  type: string
  title: string
  subtitle: string
  subject: string
  previewText: string
  body: string
  wordCount: number
  tips: string[]
}

interface GeneratedEmails {
  businessName: string
  category: string
  location: string
  generatedAt: string
  subjectLines: SubjectLine[]
  emails: EmailContent[]
  personalizationNotes: string
}

interface Business {
  id: string
  name: string
  category: string
  city?: string
  state?: string
  country?: string
  phone?: string
}

// ── Step Config ──────────────────────────────────────────────────

const emailConfig = {
  cold_email: {
    step: 1,
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
    accentBg: 'bg-violet-100',
    dotBg: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-600',
    timeline: 'Day 1',
    icon: Send,
  },
  follow_up_email: {
    step: 2,
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    accentBg: 'bg-amber-100',
    dotBg: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    timeline: 'Day 3-5',
    icon: MessageSquare,
  },
  proposal_email: {
    step: 3,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-100',
    dotBg: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    timeline: 'After positive reply',
    icon: FileText,
  },
} as const

// ── Subject Line Card ────────────────────────────────────────────

function SubjectLineCard({
  sl,
  onCopy,
  copied,
}: {
  sl: SubjectLine
  onCopy: () => void
  copied: boolean
}) {
  const styleColors: Record<string, string> = {
    'Direct': 'bg-red-100 text-red-700',
    'Curiosity': 'bg-blue-100 text-blue-700',
    'Casual': 'bg-green-100 text-green-700',
    'Data-driven': 'bg-purple-100 text-purple-700',
    'Personal': 'bg-orange-100 text-orange-700',
    'Value-offer': 'bg-teal-100 text-teal-700',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm transition-all"
    >
      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
        <Type className="h-4 w-4 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${styleColors[sl.style] || 'bg-slate-100 text-slate-700'}`}>
            {sl.style}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{sl.subject}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{sl.previewText}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 shrink-0 ${copied ? 'text-violet-600' : 'text-slate-400 hover:text-violet-600 opacity-0 group-hover:opacity-100'}`}
        onClick={onCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </motion.div>
  )
}

// ── Email Card ────────────────────────────────────────────────────

function EmailCard({
  email,
  onCopy,
  onEdit,
  copied,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
  onPreview,
}: {
  email: EmailContent
  onCopy: () => void
  onEdit: () => void
  copied: boolean
  isEditing: boolean
  editValue: string
  onEditChange: (v: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  onPreview: () => void
}) {
  const config = emailConfig[email.id as keyof typeof emailConfig] || emailConfig.cold_email
  const IconComp = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.step * 0.12 }}
    >
      <Card className={`border-2 ${config.border} overflow-hidden`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <IconComp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{email.title}</h3>
                <p className="text-xs text-white/80">{email.subtitle}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {config.timeline}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Subject Line */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm font-medium text-slate-900">{email.subject}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(email.subject)
                }}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
          </div>

          {/* Preview Text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview Text</Label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 italic">{email.previewText}</p>
            </div>
          </div>

          <Separator />

          {/* Email Body */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                rows={16}
                className="text-sm resize-none border-2 focus:border-violet-400 font-mono"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{editValue.split(/\s+/).filter(Boolean).length} words</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onEditCancel}>Cancel</Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={onEditSave}>
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Email preview container */}
              <div className="relative">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Email client header mockup */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-14">From:</span>
                      <span className="text-xs text-slate-700">[Your Name] &lt;you@company.com&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-14">To:</span>
                      <span className="text-xs text-slate-700">{email.id === 'proposal_email' ? 'business@email.com' : 'owner@business.com'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-14">Subject:</span>
                      <span className="text-xs font-semibold text-slate-900">{email.subject}</span>
                    </div>
                  </div>
                  {/* Email body */}
                  <div className="p-5">
                    <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-[system-ui]">
                      {email.body}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{email.wordCount} words</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-violet-600"
                    onClick={onPreview}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Full View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-violet-600"
                    onClick={onEdit}
                  >
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 text-xs ${copied ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'}`}
                    onClick={onCopy}
                  >
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {!isEditing && email.tips.length > 0 && (
            <div className={`rounded-xl ${config.bg} p-3 border ${config.border}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className={`h-3.5 w-3.5 ${config.accent}`} />
                <span className={`text-xs font-semibold ${config.accent}`}>Pro Tips</span>
              </div>
              <ul className="space-y-1">
                {email.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${config.dotBg} mt-1.5`} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

export function EmailView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [useAI, setUseAI] = useState(false)
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmails | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [mode, setMode] = useState<'select' | 'custom'>('select')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEmail, setPreviewEmail] = useState<EmailContent | null>(null)

  const categories = ['Restaurant', 'Salon', 'Beauty Parlour', 'Spa', 'Gym', 'Clinic', 'Hotel', 'Real Estate', 'Dentist', 'Lawyer', 'School', 'Mechanic', 'Accountant', 'Bakery', 'Other']

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses?limit=200')
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data.businesses || [])
        }
      } catch {
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [user?.id])

  // Get selected business details
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId)

  // Generate emails
  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedEmails(null)
    try {
      const body: Record<string, string | boolean> = { useAI }
      if (mode === 'select' && selectedBusinessId) {
        body.businessId = selectedBusinessId
      } else {
        if (!customName.trim()) {
          toast({ title: 'Business name is required', variant: 'destructive' })
          setGenerating(false)
          return
        }
        body.businessName = customName.trim()
        body.category = customCategory.trim()
        body.location = customLocation.trim()
      }

      const res = await fetch('/api/businesses/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedEmails(data)
        toast({
          title: 'Emails Generated!',
          description: `Personalized email sequences for ${data.businessName}`,
        })
      } else {
        toast({ title: 'Failed to generate emails', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error generating emails', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  // Copy email body to clipboard
  const handleCopy = async (email: EmailContent) => {
    try {
      const fullEmail = `Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}`
      await navigator.clipboard.writeText(fullEmail)
      setCopiedId(email.id)
      toast({ title: 'Copied to clipboard!', description: `${email.title} copied with subject` })
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' })
    }
  }

  // Copy subject line
  const handleCopySubject = async (sl: SubjectLine) => {
    try {
      const text = `${sl.subject}\nPreview: ${sl.previewText}`
      await navigator.clipboard.writeText(text)
      setCopiedId(sl.id)
      toast({ title: 'Subject line copied!' })
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' })
    }
  }

  // Copy all emails
  const handleCopyAll = async () => {
    if (!generatedEmails) return

    let allText = `=== EMAIL OUTREACH FOR ${generatedEmails.businessName.toUpperCase()} ===\n`
    allText += `Category: ${generatedEmails.category} | Location: ${generatedEmails.location}\n`
    allText += `Generated: ${new Date(generatedEmails.generatedAt).toLocaleString()}\n\n`

    allText += `--- SUBJECT LINES ---\n\n`
    for (const sl of generatedEmails.subjectLines) {
      allText += `[${sl.style}] ${sl.subject}\nPreview: ${sl.previewText}\n\n`
    }

    for (const email of generatedEmails.emails) {
      allText += `\n--- ${email.title.toUpperCase()} ---\n`
      allText += `When: ${email.subtitle}\n`
      allText += `Subject: ${email.subject}\n`
      allText += `Preview: ${email.previewText}\n\n`
      allText += `${email.body}\n\n`
    }

    try {
      await navigator.clipboard.writeText(allText)
      toast({ title: 'All emails copied!', description: 'Complete email sequence copied to clipboard' })
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' })
    }
  }

  // Edit email
  const handleEdit = (email: EmailContent) => {
    setEditingId(email.id)
    setEditValue(email.body)
  }

  const handleEditSave = () => {
    if (!generatedEmails || !editingId) return
    const updated = { ...generatedEmails }
    const emailIdx = updated.emails.findIndex(e => e.id === editingId)
    if (emailIdx >= 0) {
      updated.emails[emailIdx] = {
        ...updated.emails[emailIdx],
        body: editValue,
        wordCount: editValue.split(/\s+/).filter(Boolean).length,
      }
    }
    setGeneratedEmails(updated)
    setEditingId(null)
    setEditValue('')
    toast({ title: 'Email updated!' })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Preview email
  const handlePreview = (email: EmailContent) => {
    setPreviewEmail(email)
    setPreviewOpen(true)
  }

  // Reset
  const handleReset = () => {
    setGeneratedEmails(null)
    setSelectedBusinessId('')
    setCustomName('')
    setCustomCategory('')
    setCustomLocation('')
    setEditingId(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            Email Generator
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered personalized cold email sequences for outreach</p>
        </div>
        {generatedEmails && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" /> New Emails
            </Button>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCopyAll}>
              <Copy className="h-4 w-4 mr-1" /> Copy All
            </Button>
          </div>
        )}
      </div>

      {/* Stats / Info Cards */}
      {!generatedEmails && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">3</p>
                  <p className="text-xs text-muted-foreground">Email Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-amber-600" />
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
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Type className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">6</p>
                  <p className="text-xs text-muted-foreground">Subject Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">21%</p>
                  <p className="text-xs text-muted-foreground">Avg Reply Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generator Form OR Generated Emails */}
      {!generatedEmails ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                Generate Email Sequence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'select' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setMode('select')}
                >
                  <Building2 className="h-4 w-4 inline mr-1.5" />
                  Select Business
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setMode('custom')}
                >
                  <Edit3 className="h-4 w-4 inline mr-1.5" />
                  Custom Details
                </button>
              </div>

              {mode === 'select' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-violet-500" />
                      Select Business
                    </Label>
                    <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a business from your database..." />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map((biz) => (
                          <SelectItem key={biz.id} value={biz.id}>
                            <div className="flex items-center gap-2">
                              <span>{biz.name}</span>
                              <span className="text-xs text-muted-foreground">({biz.category})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview selected business */}
                  {selectedBusiness && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl border border-violet-200 bg-violet-50/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-900">{selectedBusiness.name}</h4>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" /> {selectedBusiness.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[selectedBusiness.city, selectedBusiness.country].filter(Boolean).join(', ') || 'Unknown'}
                            </span>
                            {selectedBusiness.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {selectedBusiness.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-violet-500" />
                      Business Name
                    </Label>
                    <Input
                      placeholder="e.g. Mario's Pizza"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-violet-500" />
                      Category
                    </Label>
                    <Select value={customCategory} onValueChange={setCustomCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-violet-500" />
                      Location
                    </Label>
                    <Input
                      placeholder="e.g. Mumbai, India"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* AI Enhancement Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${useAI ? 'bg-violet-100' : 'bg-slate-100'}`}>
                    <Sparkles className={`h-5 w-5 ${useAI ? 'text-violet-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">AI Enhancement</p>
                    <p className="text-xs text-muted-foreground">
                      {useAI ? 'LLM will generate hyper-personalized emails' : 'Uses pre-built templates with personalization'}
                    </p>
                  </div>
                </div>
                <button
                  className={`relative h-7 w-12 rounded-full transition-colors ${useAI ? 'bg-violet-500' : 'bg-slate-300'}`}
                  onClick={() => setUseAI(!useAI)}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${useAI ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base"
                onClick={handleGenerate}
                disabled={generating || (mode === 'select' && !selectedBusinessId) || (mode === 'custom' && !customName.trim())}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {useAI ? 'AI is crafting your emails...' : 'Generating emails...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Email Sequence
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Generated Emails Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Emails for {generatedEmails.businessName}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                    <Tag className="h-3 w-3 mr-1" /> {generatedEmails.category}
                  </Badge>
                  <span className="text-sm text-violet-100 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {generatedEmails.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-[10px] text-violet-200 uppercase">Subjects</div>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-[10px] text-violet-200 uppercase">Emails</div>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{generatedEmails.emails.reduce((sum, e) => sum + e.wordCount, 0)}</div>
                  <div className="text-[10px] text-violet-200 uppercase">Words</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-violet-100 mt-3">{generatedEmails.personalizationNotes}</p>
          </motion.div>

          {/* Timeline */}
          <div className="flex items-center gap-2 py-2">
            {generatedEmails.emails.map((email, idx) => {
              const config = emailConfig[email.id as keyof typeof emailConfig]
              const IconComp = config.icon
              return (
                <div key={email.id} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`h-8 w-8 rounded-full ${config.dotBg} text-white flex items-center justify-center shrink-0`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{email.title}</p>
                      <p className="text-[10px] text-muted-foreground">{config.timeline}</p>
                    </div>
                  </div>
                  {idx < generatedEmails.emails.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Subject Lines Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-500" />
                  Subject Lines
                </CardTitle>
                <Badge variant="secondary" className="text-xs">6 options</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedEmails.subjectLines.map((sl) => (
                  <SubjectLineCard
                    key={sl.id}
                    sl={sl}
                    onCopy={() => handleCopySubject(sl)}
                    copied={copiedId === sl.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Cards */}
          <div className="grid grid-cols-1 gap-4">
            {generatedEmails.emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onCopy={() => handleCopy(email)}
                onEdit={() => handleEdit(email)}
                copied={copiedId === email.id}
                isEditing={editingId === email.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onPreview={() => handlePreview(email)}
              />
            ))}
          </div>

          {/* Bottom Actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Generate New
                  </Button>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCopyAll}>
                    <Copy className="h-4 w-4 mr-2" /> Copy All Emails
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated {new Date(generatedEmails.generatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Full Email Preview Dialog ──────────────────────────── */}
      {previewOpen && previewEmail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold text-slate-900">Email Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleCopy(previewEmail)
                    setPreviewOpen(false)
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy & Close
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Email client mockup */}
            <div className="overflow-y-auto max-h-[70vh]">
              {/* Email header */}
              <div className="border-b px-6 py-4 space-y-2 bg-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 font-bold text-sm">Y</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">[Your Name]</span>
                      <span className="text-xs text-muted-foreground">Today at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">you@company.com</span>
                  </div>
                </div>
                <div className="pl-13">
                  <p className="text-base font-semibold text-slate-900">{previewEmail.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Preview: {previewEmail.previewText}</p>
                </div>
              </div>

              {/* Email body */}
              <div className="px-6 py-5 bg-white">
                <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-[system-ui]">
                  {previewEmail.body}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
