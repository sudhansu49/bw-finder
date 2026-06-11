'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Search,
  BookOpen,
  Target,
  Zap,
  Mail,
  CreditCard,
  Settings,
  LifeBuoy,
  MessageSquare,
  FileText,
  Video,
  Users,
  Globe,
  Code,
  ExternalLink,
  Send,
  Clock,
  Headphones,
  Sparkles,
  BarChart3,
  ClipboardCheck,
  AlertCircle,
  Ticket,
  Plus,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

// ─── Data ────────────────────────────────────────────────────────────────────

const quickLinks = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn the basics of BW Finder and set up your first lead search in minutes.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Target,
    title: 'Lead Finder',
    description: 'Discover businesses without websites using our powerful search and filters.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Sparkles,
    title: 'AI Scoring',
    description: 'Understand how AI Lead Scoring prioritizes your hottest prospects automatically.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: Mail,
    title: 'Outreach',
    description: 'Create and manage email & WhatsApp campaigns to reach potential clients.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Manage your subscription, view invoices, and update payment methods.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Update your profile, security options, and application preferences.',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
  },
]

const faqItems = [
  {
    question: 'How do I find businesses without websites?',
    answer:
      'Navigate to the Lead Finder from your dashboard. Enter a location (city, state, or country) and select a business category. BW Finder scans our extensive database and Google Maps data to identify businesses that lack a web presence. You can further filter results by rating, review count, and distance to narrow down the most promising leads.',
  },
  {
    question: 'What is AI Lead Scoring?',
    answer:
      'AI Lead Scoring uses machine learning to analyze each business and assign a score from 0-100 based on their likelihood of needing web services. The algorithm considers factors like online visibility gaps, review sentiment, competitor presence, and business maturity. Higher scores indicate businesses that are more likely to convert, helping you prioritize your outreach efforts effectively.',
  },
  {
    question: 'How do I generate proposals?',
    answer:
      'Once you\'ve identified a promising lead, click the "Generate Proposal" button on their detail page. BW Finder will automatically create a professional, customizable proposal that includes a website audit summary, recommended services, pricing estimates, and timeline. You can edit any section before exporting as a PDF to send directly to the prospect.',
  },
  {
    question: 'Can I export my leads?',
    answer:
      'Yes! On the Leads page, select the leads you want to export using the checkboxes, then click the "Export" button. You can export to CSV or Excel format. Pro and Agency plans also support CRM integrations, allowing you to push leads directly to HubSpot, Salesforce, or Pipedrive with one click.',
  },
  {
    question: 'How do I upgrade my plan?',
    answer:
      'Go to Settings → Billing & Subscription and click "Upgrade Plan." You\'ll see a comparison of all available tiers (Starter, Pro, Agency). Select your desired plan and complete the payment. Your new credits and features will be available immediately, and any remaining balance from your current plan is prorated automatically.',
  },
  {
    question: "What's included in the Pro plan?",
    answer:
      'The Pro plan includes 500 lead credits per month, AI Lead Scoring, unlimited proposal generation, email outreach campaigns (up to 1,000 emails/month), WhatsApp campaign support, CRM integration, CSV/Excel exports, priority support with 4-hour response SLA, and access to the API. It\'s designed for growing agencies and freelancers who need a complete lead generation toolkit.',
  },
  {
    question: 'How do outreach campaigns work?',
    answer:
      'From the Outreach section, you can create email or WhatsApp campaigns. Select leads from your saved list, choose or create a message template, set your sending schedule, and launch. BW Finder tracks open rates, click-through rates, and replies so you can measure effectiveness. You can also set up automated follow-up sequences that trigger based on recipient behavior.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. BW Finder operates on a month-to-month basis with no long-term contracts. You can cancel your subscription at any time from Settings → Billing & Subscription. When you cancel, you\'ll retain access to your current plan features until the end of your billing cycle. Your data and saved leads are preserved for 90 days in case you decide to resubscribe.',
  },
  {
    question: 'How are lead credits consumed?',
    answer:
      'Each business you view in full detail (including AI Score and contact information) consumes one lead credit. Basic search results and listing views are free and don\'t count against your quota. Credits reset on your billing date each month, and unused credits do not roll over. You can purchase additional credit packs anytime from the Billing section.',
  },
  {
    question: 'Is there an API available?',
    answer:
      'Yes, our REST API is available on Pro and Agency plans. You can use it to programmatically search for businesses, retrieve lead details, and integrate BW Finder data into your own applications. API documentation, SDKs, and rate limit details are available in the API Reference section of our Resources.',
  },
]

const resources = [
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Comprehensive guides and how-tos',
    href: '#',
  },
  {
    icon: Code,
    title: 'API Reference',
    description: 'Endpoints, SDKs, and integration docs',
    href: '#',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step walkthrough videos',
    href: '#',
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Connect with other BW Finder users',
    href: '#',
  },
  {
    icon: Globe,
    title: 'Blog',
    description: 'Tips, strategies, and industry insights',
    href: '#',
  },
  {
    icon: ClipboardCheck,
    title: 'Changelog',
    description: 'Latest product updates and features',
    href: '#',
  },
]

// ─── Ticket Types ──────────────────────────────────────────────────────────

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string | null
  createdAt: string
  updatedAt: string
  assignee?: { id: string; name: string; avatar: string | null } | null
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
}

function formatTicketDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatTicketStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HelpView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFaq, setFilteredFaq] = useState(faqItems)

  // Ticket state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPriority, setFormPriority] = useState('medium')
  const [formCategory, setFormCategory] = useState('general')

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    const userId = user?.id
    if (!userId) {
      setTicketsLoading(false)
      return
    }

    setTicketsLoading(true)
    try {
      const res = await fetch(`/api/user/tickets?userId=${userId}&limit=10`)
      if (!res.ok) {
        throw new Error('Failed to fetch tickets')
      }
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
      // Don't show toast on initial load failure - just show empty state
    } finally {
      setTicketsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredFaq(faqItems)
      return
    }
    const lower = query.toLowerCase()
    setFilteredFaq(
      faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(lower) ||
          item.answer.toLowerCase().includes(lower)
      )
    )
  }

  const handleSubmitTicket = async () => {
    if (!formSubject.trim() || !formDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both subject and description.',
        variant: 'destructive',
      })
      return
    }

    const userId = user?.id
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a ticket.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: userId,
          subject: formSubject.trim(),
          description: formDescription.trim(),
          priority: formPriority,
          category: formCategory,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to submit ticket')
      }

      toast({
        title: 'Ticket Submitted',
        description: 'Your support ticket has been submitted successfully. We\'ll get back to you soon!',
      })

      // Reset form
      setFormSubject('')
      setFormDescription('')
      setFormPriority('medium')
      setFormCategory('general')
      setDialogOpen(false)

      // Refresh tickets list
      fetchTickets()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit ticket. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header & Search ───────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="text-center space-y-6 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Help Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Find answers, learn features, and get the support you need
          </p>
        </div>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="How can we help you?"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-13 pl-12 pr-4 text-base rounded-xl border-slate-200 shadow-sm focus-visible:ring-amber-500/30 focus-visible:border-amber-400"
          />
          {searchQuery && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-50 text-amber-700 border-amber-200 text-xs"
            >
              {filteredFaq.length} result{filteredFaq.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* ── Quick Links Grid ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card
                key={link.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 h-10 w-10 rounded-xl ${link.bg} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${link.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* ── FAQ Section ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Frequently Asked Questions
        </h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="px-6">
              {filteredFaq.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-sm font-medium text-slate-800 hover:text-amber-600 hover:no-underline text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaq.length === 0 && searchQuery && (
              <div className="py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term or browse the categories above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Contact Support & Resources ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Contact Support */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </div>
              <CardDescription>
                Our team is here to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900">Email Support</p>
                  <p className="text-sm text-amber-600 font-medium mt-0.5">
                    support@bwfinder.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For detailed inquiries and account-related issues
                  </p>
                </div>
              </div>

              {/* Live Chat */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900">Live Chat</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                    >
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Mon–Fri, 9 AM – 6 PM EST
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get instant answers from our support agents
                  </p>
                </div>
              </div>

              {/* Response SLA */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-sky-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900">Response Time</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-sky-500" />
                      <span className="text-xs font-medium text-slate-700">
                        Pro: 4 hrs
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-700">
                        Starter: 24 hrs
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average first response during business hours
                  </p>
                </div>
              </div>

              <Separator />

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11 rounded-xl">
                    <Send className="mr-2 h-4 w-4" />
                    Submit a Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-amber-500" />
                      Submit a Support Ticket
                    </DialogTitle>
                    <DialogDescription>
                      Describe your issue and we&apos;ll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-subject">Subject *</Label>
                      <Input
                        id="ticket-subject"
                        placeholder="Brief summary of your issue"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-description">Description *</Label>
                      <Textarea
                        id="ticket-description"
                        placeholder="Provide details about your issue, what you've tried, and any error messages..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="rounded-lg min-h-[120px] resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-priority">Priority</Label>
                        <Select value={formPriority} onValueChange={setFormPriority}>
                          <SelectTrigger id="ticket-priority" className="rounded-lg">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ticket-category">Category</Label>
                        <Select value={formCategory} onValueChange={setFormCategory}>
                          <SelectTrigger id="ticket-category" className="rounded-lg">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="feature_request">Feature Request</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitTicket}
                      disabled={submitting || !formSubject.trim() || !formDescription.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Resources</CardTitle>
              </div>
              <CardDescription>
                Self-service learning materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <a
                    key={resource.title}
                    href={resource.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {resource.description}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-amber-500 transition-colors shrink-0" />
                  </a>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── My Tickets Section ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            My Tickets
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg"
            onClick={fetchTickets}
          >
            Refresh
          </Button>
        </div>

        {ticketsLoading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : tickets.length > 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-4 text-sm font-medium text-muted-foreground">Subject</th>
                      <th className="p-4 text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="p-4 text-sm font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.description}</p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${PRIORITY_STYLES[ticket.priority] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${STATUS_STYLES[ticket.status] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {formatTicketStatus(ticket.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).replace(/_/g, ' ') : '—'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatTicketDate(ticket.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Ticket className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No support tickets yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &ldquo;Submit a Ticket&rdquo; above to get help from our team
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 text-xs rounded-lg"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900">
              Still need help?
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {user
                ? `Hi ${user.name.split(' ')[0]}, our team is ready to assist you with anything from setup to advanced strategies.`
                : 'Our team is ready to assist you with anything from setup to advanced strategies.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Live Chat
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
