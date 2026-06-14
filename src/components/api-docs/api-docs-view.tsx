'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Code2,
  FileJson,
  FileSpreadsheet,
  Download,
  Zap,
  Users,
  ClipboardCheck,
  FileText,
  Kanban,
  BarChart3,
  Shield,
  Building2,
  BookOpen,
} from 'lucide-react'

interface OpenAPISpec {
  info: { title: string; description: string; version: string }
  tags: { name: string; description: string }[]
  paths: Record<string, Record<string, EndpointSpec>>
}

interface EndpointSpec {
  tags?: string[]
  summary: string
  description?: string
  operationId: string
  parameters?: { name: string; in: string; required?: boolean; schema: { type: string; enum?: string[]; default?: string | number }; description?: string }[]
  requestBody?: { required?: boolean; content: Record<string, { schema: { type: string; required?: string[]; properties: Record<string, { type: string; description?: string; example?: string }> } }> }
  responses?: Record<string, { description: string }>
}

const methodColors: Record<string, { bg: string; text: string; border: string }> = {
  get: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  post: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  patch: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  put: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  delete: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const tagIcons: Record<string, React.ElementType> = {
  Search: Zap,
  Leads: Users,
  Audit: ClipboardCheck,
  Proposal: FileText,
  CRM: Kanban,
  Export: Download,
  Analytics: BarChart3,
  Auth: Shield,
  Businesses: Building2,
}

const tagColors: Record<string, string> = {
  Search: 'bg-amber-500',
  Leads: 'bg-emerald-500',
  Audit: 'bg-orange-500',
  Proposal: 'bg-rose-500',
  CRM: 'bg-purple-500',
  Export: 'bg-teal-500',
  Analytics: 'bg-cyan-500',
  Auth: 'bg-slate-500',
  Businesses: 'bg-blue-500',
}

export function ApiDocsView() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set())
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const res = await fetch('/api/docs')
        if (res.ok) {
          const data = await res.json()
          setSpec(data)
          // Expand all tags by default
          setExpandedTags(new Set(data.tags?.map((t: { name: string }) => t.name) || []))
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchSpec()
  }, [])

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleTag = (tag: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load API documentation
      </div>
    )
  }

  // Group endpoints by tag
  const endpointsByTag: Record<string, { path: string; method: string; spec: EndpointSpec }[]> = {}
  for (const tag of spec.tags || []) {
    endpointsByTag[tag.name] = []
  }

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, endpointSpec] of Object.entries(methods)) {
      const epTags = endpointSpec.tags || ['Other']
      for (const tag of epTags) {
        if (!endpointsByTag[tag]) endpointsByTag[tag] = []
        endpointsByTag[tag].push({ path, method, spec: endpointSpec })
      }
    }
  }

  // Filter by search
  const filteredTags = spec.tags?.filter(tag => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const hasMatchingEndpoint = endpointsByTag[tag.name]?.some(ep =>
      ep.spec.summary?.toLowerCase().includes(q) ||
      ep.path.toLowerCase().includes(q) ||
      ep.spec.operationId?.toLowerCase().includes(q) ||
      ep.spec.description?.toLowerCase().includes(q)
    )
    return tag.name.toLowerCase().includes(q) || hasMatchingEndpoint
  }) || []

  const totalEndpoints = Object.values(spec.paths || {}).reduce(
    (sum, methods) => sum + Object.keys(methods).length, 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            API Documentation
          </h1>
          <p className="text-muted-foreground mt-1">{spec.info.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="text-xs">v{spec.info.version}</Badge>
            <span className="text-xs text-muted-foreground">{totalEndpoints} endpoints</span>
            <span className="text-xs text-muted-foreground">{spec.tags?.length || 0} groups</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard('/api/docs', 'spec-url')}
            className="gap-2"
          >
            {copiedId === 'spec-url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            OpenAPI Spec
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/api/docs', '_blank')}
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            Raw JSON
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Base URL', value: '/api', icon: Code2 },
          { label: 'Auth', value: 'Session', icon: Shield },
          { label: 'Format', value: 'JSON', icon: FileJson },
          { label: 'Export', value: 'CSV/JSON', icon: FileSpreadsheet },
          { label: 'Spec', value: 'OpenAPI 3.0', icon: BookOpen },
          { label: 'Version', value: spec.info.version, icon: Zap },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <item.icon className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-4">
        {filteredTags.map(tag => {
          const endpoints = endpointsByTag[tag.name] || []
          if (endpoints.length === 0) return null

          const TagIcon = tagIcons[tag.name] || Code2
          const isExpanded = expandedTags.has(tag.name)

          // Filter endpoints by search
          const filteredEndpoints = searchQuery
            ? endpoints.filter(ep => {
                const q = searchQuery.toLowerCase()
                return ep.spec.summary?.toLowerCase().includes(q) ||
                  ep.path.toLowerCase().includes(q) ||
                  ep.spec.operationId?.toLowerCase().includes(q)
              })
            : endpoints

          if (filteredEndpoints.length === 0) return null

          return (
            <motion.div
              key={tag.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-sm overflow-hidden">
                {/* Tag Header */}
                <button
                  onClick={() => toggleTag(tag.name)}
                  className="w-full"
                >
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${tagColors[tag.name] || 'bg-slate-500'} flex items-center justify-center`}>
                        <TagIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-semibold">{tag.name}</h3>
                        <p className="text-xs text-muted-foreground">{tag.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{filteredEndpoints.length}</Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Endpoints */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t">
                        {filteredEndpoints.map((ep, idx) => {
                          const method = ep.method.toUpperCase()
                          const methodLower = ep.method.toLowerCase()
                          const colors = methodColors[methodLower] || methodColors.get
                          const endpointKey = `${ep.method}-${ep.path}`
                          const isEndpointExpanded = expandedEndpoints.has(endpointKey)

                          return (
                            <div key={endpointKey} className={idx > 0 ? 'border-t' : ''}>
                              {/* Endpoint Row */}
                              <button
                                onClick={() => toggleEndpoint(endpointKey)}
                                className="w-full"
                              >
                                <div className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors">
                                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} border min-w-[64px] text-center`}>
                                    {method}
                                  </span>
                                  <code className="text-sm font-mono text-slate-700 flex-1 text-left">{ep.path}</code>
                                  <span className="text-sm text-muted-foreground hidden sm:block max-w-[300px] truncate">{ep.spec.summary}</span>
                                  {isEndpointExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Detail */}
                              <AnimatePresence>
                                {isEndpointExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 space-y-4">
                                      {/* Description */}
                                      {ep.spec.description && (
                                        <p className="text-sm text-muted-foreground bg-slate-50 rounded-lg p-3">
                                          {ep.spec.description}
                                        </p>
                                      )}

                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Parameters */}
                                        {ep.spec.parameters && ep.spec.parameters.length > 0 && (
                                          <div>
                                            <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                                            <div className="border rounded-lg overflow-hidden">
                                              <table className="w-full text-sm">
                                                <thead>
                                                  <tr className="bg-slate-50">
                                                    <th className="text-left p-2 font-medium">Name</th>
                                                    <th className="text-left p-2 font-medium">In</th>
                                                    <th className="text-left p-2 font-medium">Type</th>
                                                    <th className="text-left p-2 font-medium">Required</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {ep.spec.parameters.map((param) => (
                                                    <tr key={param.name} className="border-t">
                                                      <td className="p-2">
                                                        <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{param.name}</code>
                                                        {param.schema.enum && (
                                                          <div className="flex flex-wrap gap-1 mt-1">
                                                            {param.schema.enum.map(v => (
                                                              <Badge key={v} variant="secondary" className="text-[10px] px-1 py-0">{v}</Badge>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </td>
                                                      <td className="p-2 text-xs text-muted-foreground">{param.in}</td>
                                                      <td className="p-2 text-xs">{param.schema.type}{param.schema.default !== undefined ? ` = ${param.schema.default}` : ''}</td>
                                                      <td className="p-2">
                                                        {param.required ? (
                                                          <Badge className="text-[10px] bg-red-50 text-red-600 border-red-200">Required</Badge>
                                                        ) : (
                                                          <span className="text-xs text-muted-foreground">Optional</span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}

                                        {/* Request Body */}
                                        {ep.spec.requestBody && (
                                          <div>
                                            <h4 className="text-sm font-semibold mb-2">
                                              Request Body
                                              {ep.spec.requestBody.required && (
                                                <Badge className="ml-2 text-[10px] bg-red-50 text-red-600 border-red-200">Required</Badge>
                                              )}
                                            </h4>
                                            <div className="border rounded-lg overflow-hidden">
                                              <div className="bg-slate-50 p-2 border-b">
                                                <span className="text-xs font-medium">Content-Type: application/json</span>
                                              </div>
                                              <div className="p-3">
                                                {ep.spec.requestBody.content?.['application/json']?.schema?.properties && (
                                                  <table className="w-full text-sm">
                                                    <thead>
                                                      <tr className="border-b">
                                                        <th className="text-left pb-2 font-medium">Field</th>
                                                        <th className="text-left pb-2 font-medium">Type</th>
                                                        <th className="text-left pb-2 font-medium">Required</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {Object.entries(ep.spec.requestBody.content['application/json'].schema.properties).map(([name, prop]: [string, any]) => (
                                                        <tr key={name} className="border-b last:border-0">
                                                          <td className="py-2">
                                                            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{name}</code>
                                                            {prop.example && <span className="text-xs text-muted-foreground ml-2">e.g. {prop.example}</span>}
                                                          </td>
                                                          <td className="py-2 text-xs">{prop.type}</td>
                                                          <td className="py-2">
                                                            {ep.spec.requestBody?.content?.['application/json']?.schema?.required?.includes(name) ? (
                                                              <Badge className="text-[10px] bg-red-50 text-red-600 border-red-200">Yes</Badge>
                                                            ) : (
                                                              <span className="text-xs text-muted-foreground">No</span>
                                                            )}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Responses */}
                                      {ep.spec.responses && (
                                        <div>
                                          <h4 className="text-sm font-semibold mb-2">Responses</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {Object.entries(ep.spec.responses).map(([code, resp]) => (
                                              <div
                                                key={code}
                                                className={`px-3 py-1.5 rounded-lg border text-xs ${
                                                  code === '200' || code === '201'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                    : code === '400'
                                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                    : code === '401' || code === '404'
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                                                    : 'bg-red-50 border-red-200 text-red-700'
                                                }`}
                                              >
                                                <span className="font-bold">{code}</span>
                                                <span className="ml-1.5">{resp.description}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Try it out */}
                                      <div className="bg-slate-50 rounded-lg p-3">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                          <Zap className="h-4 w-4 text-amber-500" />
                                          Try it
                                        </h4>
                                        <div className="flex items-center gap-2">
                                          <code className="text-xs font-mono bg-white border rounded px-2 py-1.5 flex-1 overflow-x-auto">
                                            {method} {ep.path}
                                            {ep.spec.parameters?.filter(p => p.in === 'query').map(p => (
                                              <span key={p.name}>
                                                {' '}{p.name}={'{'}
                                                {p.schema.type}
                                                {'}'}
                                              </span>
                                            ))}
                                          </code>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(
                                              `curl -X ${method} http://localhost:3000/api${ep.path}`,
                                              endpointKey
                                            )}
                                            className="shrink-0 gap-1"
                                          >
                                            {copiedId === endpointKey ? (
                                              <><Check className="h-3 w-3" /> Copied</>
                                            ) : (
                                              <><Copy className="h-3 w-3" /> cURL</>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Export Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-amber-500" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Export your data in CSV or JSON format using the export API.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: 'leads', label: 'Leads', desc: 'All leads with business data', icon: Users },
              { type: 'businesses', label: 'Businesses', desc: 'Full business directory', icon: Building2 },
              { type: 'audits', label: 'Audits', desc: 'Audit reports & scores', icon: ClipboardCheck },
              { type: 'pipeline', label: 'Pipeline', desc: 'Pipeline by stage', icon: Kanban },
            ].map(exportType => (
              <div key={exportType.type} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <exportType.icon className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-sm">{exportType.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{exportType.desc}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs flex-1"
                    onClick={() => window.open(`/api/export?type=${exportType.type}&format=csv`, '_blank')}
                  >
                    <FileSpreadsheet className="h-3 w-3" /> CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs flex-1"
                    onClick={() => window.open(`/api/export?type=${exportType.type}&format=json`, '_blank')}
                  >
                    <FileJson className="h-3 w-3" /> JSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
