'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Settings,
  Zap,
  Search,
  Globe,
  Edit,
  Trash2,
  Shield,
  Mail,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ─── Demo Data ──────────────────────────────────────────────────────────────────

interface BillingEntry {
  id: string
  date: string
  description: string
  amount: string
  amountRaw: number
  status: 'paid' | 'pending' | 'failed'
  invoiceNumber: string
}

const billingHistory: BillingEntry[] = [
  {
    id: '1',
    date: 'Mar 1, 2026',
    description: 'Pro Plan - Monthly Subscription',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'paid',
    invoiceNumber: 'INV-2026-0301',
  },
  {
    id: '2',
    date: 'Feb 28, 2026',
    description: 'Additional Credits - 500 Pack',
    amount: '$25.00',
    amountRaw: 25.0,
    status: 'paid',
    invoiceNumber: 'INV-2026-0228',
  },
  {
    id: '3',
    date: 'Feb 15, 2026',
    description: 'API Overage Charges',
    amount: '$12.40',
    amountRaw: 12.4,
    status: 'paid',
    invoiceNumber: 'INV-2026-0215',
  },
  {
    id: '4',
    date: 'Feb 1, 2026',
    description: 'Pro Plan - Monthly Subscription',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'paid',
    invoiceNumber: 'INV-2026-0201',
  },
  {
    id: '5',
    date: 'Jan 22, 2026',
    description: 'Premium Lead Export - 1,000 Records',
    amount: '$35.00',
    amountRaw: 35.0,
    status: 'pending',
    invoiceNumber: 'INV-2026-0122',
  },
  {
    id: '6',
    date: 'Jan 1, 2026',
    description: 'Pro Plan - Monthly Subscription',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'paid',
    invoiceNumber: 'INV-2026-0101',
  },
  {
    id: '7',
    date: 'Dec 18, 2025',
    description: 'Additional Credits - 1,000 Pack',
    amount: '$45.00',
    amountRaw: 45.0,
    status: 'paid',
    invoiceNumber: 'INV-2025-1218',
  },
  {
    id: '8',
    date: 'Dec 1, 2025',
    description: 'Pro Plan - Monthly Subscription',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'failed',
    invoiceNumber: 'INV-2025-1201',
  },
  {
    id: '9',
    date: 'Dec 3, 2025',
    description: 'Pro Plan - Monthly Subscription (Retry)',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'paid',
    invoiceNumber: 'INV-2025-1203',
  },
  {
    id: '10',
    date: 'Nov 1, 2025',
    description: 'Pro Plan - Monthly Subscription',
    amount: '$79.00',
    amountRaw: 79.0,
    status: 'paid',
    invoiceNumber: 'INV-2025-1101',
  },
]

// ─── Status Badge Helper ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'paid' | 'pending' | 'failed' }) {
  switch (status) {
    case 'paid':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 font-medium">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 font-medium">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function BillingView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [autoRecharge, setAutoRecharge] = useState(true)
  const [billingEmail, setBillingEmail] = useState(user?.email || 'billing@acme.co')
  const [taxId, setTaxId] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  const totalSpend = billingHistory
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amountRaw, 0)

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSavingSettings(false)
    toast({
      title: 'Settings Saved',
      description: 'Your billing settings have been updated.',
    })
  }

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast({
      title: 'Downloading Invoice',
      description: `${invoiceNumber}.pdf is being prepared for download.`,
    })
  }

  const handleAddPaymentMethod = () => {
    toast({
      title: 'Add Payment Method',
      description: 'Payment method form will open shortly.',
    })
  }

  const handleEditCard = () => {
    toast({
      title: 'Edit Card',
      description: 'Card editing form will open shortly.',
    })
  }

  const handleRemoveCard = () => {
    toast({
      title: 'Remove Card',
      description: 'Are you sure? This action cannot be undone.',
      variant: 'destructive',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-muted-foreground">Manage your payments, invoices, and usage</p>
      </div>

      {/* ─── Billing Overview Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">No outstanding balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Next Payment</span>
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">Apr 1</p>
              <p className="text-xs text-muted-foreground mt-1">Pro Plan renewal — $79.00</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground mt-1">Expires 12/2027</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Monthly Spend</span>
                <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months total</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Main Content Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Billing History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Payment Method</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPaymentMethod}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add New
                  </Button>
                </div>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Visa •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires Dec 2027</p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 text-xs">
                      Default
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCard}
                      className="text-xs text-muted-foreground hover:text-slate-900"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCard}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Billing History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Billing History</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {billingHistory.length} transactions
                  </Badge>
                </div>
                <CardDescription>View and download your past invoices</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="pl-6">Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="pr-6 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((entry) => (
                        <TableRow key={entry.id} className="group">
                          <TableCell className="pl-6 text-sm text-muted-foreground">
                            {entry.date}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-900 max-w-[220px] truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-slate-900">
                            {entry.amount}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={entry.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                            {entry.invoiceNumber}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(entry.invoiceNumber)}
                              className="text-xs text-muted-foreground hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity h-8"
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column — Usage & Settings */}
        <div className="space-y-6">
          {/* Usage This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Usage This Month</CardTitle>
                </div>
                <CardDescription>Your resource consumption for March 2026</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Credits Used */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900">Credits Used</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900">7,450</span> / 10,000
                    </span>
                  </div>
                  <Progress value={74.5} className="h-2 [&>div]:bg-amber-500" />
                  <p className="text-xs text-muted-foreground">2,550 credits remaining</p>
                </div>

                <Separator />

                {/* API Calls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900">API Calls</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900">3,281</span> / 5,000
                    </span>
                  </div>
                  <Progress value={65.6} className="h-2 [&>div]:bg-amber-500" />
                  <p className="text-xs text-muted-foreground">1,719 API calls remaining</p>
                </div>

                <Separator />

                {/* Searches Performed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-900">Searches Performed</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-slate-900">186</span> / 500
                    </span>
                  </div>
                  <Progress value={37.2} className="h-2 [&>div]:bg-amber-500" />
                  <p className="text-xs text-muted-foreground">314 searches remaining</p>
                </div>

                <Separator />

                {/* Usage Warning */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Credits running low</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      You&apos;ve used 74% of your monthly credits. Consider upgrading your plan or
                      purchasing additional credits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Payment Settings</CardTitle>
                </div>
                <CardDescription>Configure your billing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Auto-recharge */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-slate-900">Auto-recharge</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically buy 1,000 credits when balance drops below 500
                    </p>
                  </div>
                  <Switch
                    checked={autoRecharge}
                    onCheckedChange={setAutoRecharge}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                <Separator />

                {/* Billing Email */}
                <div className="space-y-2">
                  <Label htmlFor="billing-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Billing Email
                  </Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="billing@company.com"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Invoices and receipts will be sent here
                  </p>
                </div>

                <Separator />

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label htmlFor="tax-id" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Tax ID / VAT Number
                  </Label>
                  <Input
                    id="tax-id"
                    placeholder="e.g. US123456789"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Added to your invoices for tax purposes
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
