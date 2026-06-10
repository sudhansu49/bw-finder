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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Building2,
  MapPin,
  Tag,
  MessageSquare,
  Send,
  Clock,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Phone,
  ArrowRight,
  Edit3,
  Wand2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ── Types ──────────────────────────────────────────────────────────

interface WhatsAppScript {
  id: string
  title: string
  subtitle: string
  message: string
  charCount: number
  tips: string[]
}

interface GeneratedScripts {
  businessName: string
  category: string
  location: string
  generatedAt: string
  scripts: WhatsAppScript[]
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

// ── Script Card Component ────────────────────────────────────────

const stepConfig = {
  cold_intro: {
    step: 1,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-100',
    ring: 'ring-emerald-400',
    dotBg: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-green-600',
    timeline: 'Day 1',
  },
  follow_up_1: {
    step: 2,
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    accentBg: 'bg-amber-100',
    ring: 'ring-amber-400',
    dotBg: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    timeline: 'Day 3-4',
  },
  follow_up_2: {
    step: 3,
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    accentBg: 'bg-blue-100',
    ring: 'ring-blue-400',
    dotBg: 'bg-blue-500',
    gradient: 'from-blue-500 to-indigo-600',
    timeline: 'Day 7-10',
  },
  follow_up_3: {
    step: 4,
    color: 'rose',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    accent: 'text-rose-700',
    accentBg: 'bg-rose-100',
    ring: 'ring-rose-400',
    dotBg: 'bg-rose-500',
    gradient: 'from-rose-500 to-pink-600',
    timeline: 'Day 14',
  },
} as const

function ScriptCard({
  script,
  onCopy,
  onEdit,
  copied,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
}: {
  script: WhatsAppScript
  onCopy: () => void
  onEdit: () => void
  copied: boolean
  isEditing: boolean
  editValue: string
  onEditChange: (v: string) => void
  onEditSave: () => void
  onEditCancel: () => void
}) {
  const config = stepConfig[script.id as keyof typeof stepConfig] || stepConfig.cold_intro

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.step * 0.1 }}
    >
      <Card className={`border-2 ${config.border} overflow-hidden`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                {config.step}
              </div>
              <div>
                <h3 className="font-bold text-base">{script.title}</h3>
                <p className="text-xs text-white/80">{script.subtitle}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {config.timeline}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Message bubble */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                rows={8}
                className="text-sm resize-none border-2 focus:border-emerald-400"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{editValue.length} chars</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onEditCancel}>Cancel</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onEditSave}>
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* WhatsApp-style message bubble */}
              <div className="bg-emerald-50 rounded-2xl rounded-tl-sm p-4 border border-emerald-100 relative">
                <div className="absolute -left-1 top-0 w-3 h-3 bg-emerald-50 border-l border-b border-emerald-100 transform rotate-45 translate-x-1" />
                <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{script.message}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${script.charCount > 1000 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                  {script.charCount} chars
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-500 hover:text-emerald-600"
                    onClick={onEdit}
                  >
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 text-xs ${copied ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
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
          {!isEditing && script.tips.length > 0 && (
            <div className={`rounded-xl ${config.bg} p-3 border ${config.border}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className={`h-3.5 w-3.5 ${config.accent}`} />
                <span className={`text-xs font-semibold ${config.accent}`}>Pro Tips</span>
              </div>
              <ul className="space-y-1">
                {script.tips.map((tip, idx) => (
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

export function WhatsAppView() {
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
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScripts | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [mode, setMode] = useState<'select' | 'custom'>('select')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewScript, setPreviewScript] = useState<WhatsAppScript | null>(null)

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

  // Generate scripts
  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedScripts(null)
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

      const res = await fetch('/api/businesses/whatsapp-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedScripts(data)
        toast({
          title: 'Scripts Generated!',
          description: `4 personalized WhatsApp scripts for ${data.businessName}`,
        })
      } else {
        toast({ title: 'Failed to generate scripts', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error generating scripts', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  // Copy script to clipboard
  const handleCopy = async (script: WhatsAppScript) => {
    try {
      await navigator.clipboard.writeText(script.message)
      setCopiedId(script.id)
      toast({ title: 'Copied to clipboard!', description: `${script.title} message copied` })
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' })
    }
  }

  // Copy all scripts
  const handleCopyAll = async () => {
    if (!generatedScripts) return
    const allText = generatedScripts.scripts.map(s =>
      `--- ${s.title} (${s.subtitle}) ---\n\n${s.message}`
    ).join('\n\n\n')
    try {
      await navigator.clipboard.writeText(allText)
      toast({ title: 'All scripts copied!', description: '4 messages copied to clipboard' })
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' })
    }
  }

  // Edit script
  const handleEdit = (script: WhatsAppScript) => {
    setEditingId(script.id)
    setEditValue(script.message)
  }

  const handleEditSave = () => {
    if (!generatedScripts || !editingId) return
    const updated = { ...generatedScripts }
    const scriptIdx = updated.scripts.findIndex(s => s.id === editingId)
    if (scriptIdx >= 0) {
      updated.scripts[scriptIdx] = {
        ...updated.scripts[scriptIdx],
        message: editValue,
        charCount: editValue.length,
      }
    }
    setGeneratedScripts(updated)
    setEditingId(null)
    setEditValue('')
    toast({ title: 'Script updated!' })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Preview script in phone mockup
  const handlePreview = (script: WhatsAppScript) => {
    setPreviewScript(script)
    setPreviewOpen(true)
  }

  // Reset
  const handleReset = () => {
    setGeneratedScripts(null)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            WhatsApp Script Generator
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered personalized cold outreach scripts for WhatsApp</p>
        </div>
        {generatedScripts && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" /> New Scripts
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCopyAll}>
              <Copy className="h-4 w-4 mr-1" /> Copy All
            </Button>
          </div>
        )}
      </div>

      {/* Stats / Info Cards */}
      {!generatedScripts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">4</p>
                  <p className="text-xs text-muted-foreground">Script Types</p>
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
                  <Wand2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">AI</p>
                  <p className="text-xs text-muted-foreground">Enhanced</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">98%</p>
                  <p className="text-xs text-muted-foreground">WA Open Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generator Form OR Generated Scripts */}
      {!generatedScripts ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Generate WhatsApp Scripts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'select' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setMode('select')}
                >
                  <Building2 className="h-4 w-4 inline mr-1.5" />
                  Select Business
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
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
                      <Building2 className="h-3.5 w-3.5 text-emerald-500" />
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
                      className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-emerald-600" />
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
                      <Building2 className="h-3.5 w-3.5 text-emerald-500" />
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
                      <Tag className="h-3.5 w-3.5 text-emerald-500" />
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
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
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
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${useAI ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <Sparkles className={`h-5 w-5 ${useAI ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">AI Enhancement</p>
                    <p className="text-xs text-muted-foreground">
                      {useAI ? 'LLM will generate hyper-personalized scripts' : 'Uses pre-built templates with personalization'}
                    </p>
                  </div>
                </div>
                <button
                  className={`relative h-7 w-12 rounded-full transition-colors ${useAI ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  onClick={() => setUseAI(!useAI)}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${useAI ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base"
                onClick={handleGenerate}
                disabled={generating || (mode === 'select' && !selectedBusinessId) || (mode === 'custom' && !customName.trim())}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {useAI ? 'AI is crafting your scripts...' : 'Generating scripts...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate WhatsApp Scripts
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Generated Scripts Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 p-5 text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Scripts for {generatedScripts.businessName}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                    <Tag className="h-3 w-3 mr-1" /> {generatedScripts.category}
                  </Badge>
                  <span className="text-sm text-emerald-100 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {generatedScripts.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-[10px] text-emerald-200 uppercase">Scripts</div>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{generatedScripts.scripts.reduce((sum, s) => sum + s.charCount, 0)}</div>
                  <div className="text-[10px] text-emerald-200 uppercase">Total Chars</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-emerald-100 mt-3">{generatedScripts.personalizationNotes}</p>
          </motion.div>

          {/* Timeline & Scripts */}
          <div className="flex items-center gap-2 py-2">
            {generatedScripts.scripts.map((script, idx) => {
              const config = stepConfig[script.id as keyof typeof stepConfig]
              return (
                <div key={script.id} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`h-8 w-8 rounded-full ${config.dotBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                      {config.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{script.title}</p>
                      <p className="text-[10px] text-muted-foreground">{config.timeline}</p>
                    </div>
                  </div>
                  {idx < generatedScripts.scripts.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Script Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedScripts.scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onCopy={() => handleCopy(script)}
                onEdit={() => handleEdit(script)}
                copied={copiedId === script.id}
                isEditing={editingId === script.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
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
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCopyAll}>
                    <Copy className="h-4 w-4 mr-2" /> Copy All Scripts
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated {new Date(generatedScripts.generatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Phone Preview Dialog ──────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-500" />
              WhatsApp Preview
            </DialogTitle>
            <DialogDescription>How this message looks on WhatsApp</DialogDescription>
          </DialogHeader>

          {previewScript && (
            <div className="flex justify-center py-4">
              {/* Phone mockup */}
              <div className="w-[280px] bg-slate-900 rounded-[2rem] p-2 shadow-xl">
                {/* Phone header */}
                <div className="bg-emerald-600 rounded-t-2xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">{generatedScripts?.businessName || 'Business'}</p>
                      <p className="text-emerald-200 text-[10px]">online</p>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="bg-[#e5ddd5] h-[380px] overflow-y-auto p-3 space-y-2" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8c3b9\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}>
                  {/* Your message bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#dcf8c6] rounded-lg rounded-tr-sm p-2.5 max-w-[220px] shadow-sm">
                      <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {previewScript.message}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-slate-500">
                          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-blue-500 text-[9px]">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="bg-slate-100 rounded-b-2xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-slate-400">
                      Type a message
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            {previewScript && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleCopy(previewScript); setPreviewOpen(false) }}>
                <Copy className="h-4 w-4 mr-2" /> Copy & Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
