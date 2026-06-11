'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, FileSpreadsheet, FileText, FileDown,
  Users, Building2, ClipboardCheck, Kanban,
  Loader2, CheckCircle2, AlertCircle, Eye,
  Filter, Zap, ArrowRight, RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type ExportType = 'leads' | 'businesses' | 'audits' | 'pipeline'
type ExportFormat = 'csv' | 'excel' | 'pdf'

interface ExportHistoryItem {
  id: string
  type: ExportType
  format: ExportFormat
  count: number
  timestamp: Date
}

const DATA_TYPES: { value: ExportType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'leads', label: 'Leads', icon: Users, description: 'All leads with business info, scores & status' },
  { value: 'businesses', label: 'Businesses', icon: Building2, description: 'Complete business directory with contact details' },
  { value: 'audits', label: 'Audit Reports', icon: ClipboardCheck, description: 'Business audit scores, issues & recommendations' },
  { value: 'pipeline', label: 'Pipeline', icon: Kanban, description: 'Sales pipeline with stages, values & scores' },
]

const FORMATS: { value: ExportFormat; label: string; icon: React.ElementType; description: string; extension: string }[] = [
  { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values, universal compatibility', extension: '.csv' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format with auto-sized columns', extension: '.xlsx' },
  { value: 'pdf', label: 'PDF', icon: FileDown, description: 'Formatted report with tables & branding', extension: '.pdf' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new_lead', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

// ─── Client-side Excel Generator ──────────────────────────────────────────

async function generateExcelClient(
  data: Record<string, unknown>[],
  title: string,
  filename: string
): Promise<void> {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => {
    const maxLen = Math.max(
      key.length,
      ...data.map(row => String(row[key] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 50) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
  XLSX.writeFile(wb, filename)
}

// ─── Client-side PDF Generator ────────────────────────────────────────────

async function generatePDFClient(
  data: Record<string, unknown>[],
  title: string,
  filename: string
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header bar
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, 297, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(`BW Finder - ${title}`, 14, 13)

  // Subheader
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Exported: ${new Date().toLocaleString()}  |  ${data.length} records`, 14, 28)

  // Table
  if (data.length > 0) {
    const headers = Object.keys(data[0]).map(h =>
      h.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    )
    const rows = data.map(row =>
      Object.values(row).map(v => String(v ?? ''))
    )

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 33,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235],
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      theme: 'grid',
    })
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `BW Finder  |  Page ${i} of ${pageCount}  |  ${new Date().toLocaleDateString()}`,
      148.5,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    )
  }

  doc.save(filename)
}

export function ExportView() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<ExportType>('leads')
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [statusFilter, setStatusFilter] = useState('all')
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([])
  const [lastExportSuccess, setLastExportSuccess] = useState(false)

  // Fetch record count
  const fetchCount = useCallback(async () => {
    setCountLoading(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          userId: user?.id,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
      })
      const data = await res.json()
      if (data.count !== undefined) {
        setRecordCount(data.count)
      }
    } catch {
      setRecordCount(null)
    } finally {
      setCountLoading(false)
    }
  }, [selectedType, user?.id, statusFilter])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Fetch export data as JSON from server
  const fetchExportData = async (): Promise<{ data: Record<string, unknown>[]; title: string }> => {
    const params = new URLSearchParams({ type: selectedType, format: 'json' })
    if (user?.id) params.set('userId', user.id)
    if (statusFilter !== 'all') params.set('status', statusFilter)

    const res = await fetch(`/api/export?${params.toString()}`)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to fetch export data')
    }
    return await res.json()
  }

  // Handle export
  const handleExport = async () => {
    if (recordCount === 0) {
      toast({ title: 'No Data', description: 'No records found to export.', variant: 'destructive' })
      return
    }

    setExporting(true)
    setLastExportSuccess(false)

    try {
      const dateStr = new Date().toISOString().split('T')[0]

      if (selectedFormat === 'csv') {
        // CSV: download from server directly
        const params = new URLSearchParams({ type: selectedType, format: 'csv' })
        if (user?.id) params.set('userId', user.id)
        if (statusFilter !== 'all') params.set('status', statusFilter)

        const res = await fetch(`/api/export?${params.toString()}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Export failed')
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedType}_export_${dateStr}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Excel/PDF: fetch JSON data, generate client-side
        const { data, title } = await fetchExportData()
        const filename = `${selectedType}_export_${dateStr}`

        if (selectedFormat === 'excel') {
          await generateExcelClient(data, title, `${filename}.xlsx`)
        } else {
          await generatePDFClient(data, title, `${filename}.pdf`)
        }
      }

      // Add to history
      setExportHistory(prev => [{
        id: Date.now().toString(),
        type: selectedType,
        format: selectedFormat,
        count: recordCount || 0,
        timestamp: new Date(),
      }, ...prev].slice(0, 10))

      setLastExportSuccess(true)
      toast({
        title: 'Export Complete',
        description: `${recordCount} records exported as ${selectedFormat.toUpperCase()}`,
      })

      setTimeout(() => setLastExportSuccess(false), 3000)
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const selectedTypeConfig = DATA_TYPES.find(t => t.value === selectedType)!
  const selectedFormatConfig = FORMATS.find(f => f.value === selectedFormat)!
  const showStatusFilter = selectedType === 'leads' || selectedType === 'pipeline'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Export Data</h1>
        <p className="text-muted-foreground">Download your data in CSV, Excel, or PDF format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">What to Export</CardTitle>
                </div>
                <CardDescription>Select the data type you want to export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DATA_TYPES.map((type) => {
                    const Icon = type.icon
                    const isActive = selectedType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => { setSelectedType(type.value); setStatusFilter('all') }}
                        className={`
                          relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                          ${isActive
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }
                        `}
                      >
                        <div className={`
                          mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                          ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isActive ? 'text-amber-900' : 'text-slate-900'}`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Format Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">Export Format</CardTitle>
                </div>
                <CardDescription>Choose the output file format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FORMATS.map((format) => {
                    const Icon = format.icon
                    const isActive = selectedFormat === format.value
                    return (
                      <button
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value)}
                        className={`
                          relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 text-center transition-all duration-200
                          ${isActive
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }
                        `}
                      >
                        <div className={`
                          flex h-12 w-12 items-center justify-center rounded-xl
                          ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}
                        `}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${isActive ? 'text-amber-900' : 'text-slate-900'}`}>
                            {format.label}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {format.extension}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{format.description}</p>
                        {isActive && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          {showStatusFilter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </div>
                  <CardDescription>Filter the data before exporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full sm:w-64">
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Lead Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Summary & Export */}
        <div className="space-y-6">
          {/* Export Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">Export Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Data Type</span>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">{selectedTypeConfig.label}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Format</span>
                  <Badge variant="outline" className="border-amber-300 text-amber-800">
                    {selectedFormatConfig.label} ({selectedFormatConfig.extension})
                  </Badge>
                </div>

                {showStatusFilter && statusFilter !== 'all' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">Status</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-800 capitalize">
                      {statusFilter.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                )}

                <Separator className="bg-amber-200" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Records</span>
                  {countLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  ) : recordCount !== null ? (
                    <span className="text-lg font-bold text-amber-900">{recordCount.toLocaleString()}</span>
                  ) : (
                    <span className="text-sm text-amber-500">Unknown</span>
                  )}
                </div>

                <Separator className="bg-amber-200" />

                <Button
                  onClick={handleExport}
                  disabled={exporting || recordCount === 0}
                  className={`
                    w-full h-12 text-base font-semibold transition-all duration-300
                    ${lastExportSuccess
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }
                  `}
                >
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Exporting...
                    </>
                  ) : lastExportSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Downloaded!
                    </>
                  ) : recordCount === 0 ? (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      No Data
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Export {selectedFormatConfig.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchCount}
                  disabled={countLoading}
                  className="w-full text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                >
                  <RefreshCw className={`mr-2 h-3.5 w-3.5 ${countLoading ? 'animate-spin' : ''}`} />
                  Refresh Count
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Format Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-700">Format Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                  <FileText className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">CSV - Universal</p>
                    <p className="text-[11px] text-green-600">Works with any tool. Best for data import &amp; mail merge.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Excel - Rich Format</p>
                    <p className="text-[11px] text-emerald-600">Auto-sized columns, filters &amp; formatting. Best for analysis.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                  <FileDown className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-800">PDF - Report Style</p>
                    <p className="text-[11px] text-red-600">Branded tables with header/footer. Best for sharing &amp; printing.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export History */}
          {exportHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-700">Recent Exports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                  <AnimatePresence>
                    {exportHistory.map((item) => {
                      const typeConfig = DATA_TYPES.find(t => t.value === item.type)
                      const formatConfig = FORMATS.find(f => f.value === item.format)
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <Download className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700">{typeConfig?.label}</span>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {formatConfig?.extension}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{item.count} records</span>
                            <span className="text-[10px] text-muted-foreground">
                              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
