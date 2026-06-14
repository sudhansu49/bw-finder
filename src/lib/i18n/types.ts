// ─── Language & Currency Types ────────────────────────────────────────────────

export type LocaleCode =
  | 'en'        // English
  | 'hi'        // Hindi (Devanagari)
  | 'hi-latn'   // Roman Hindi / Hinglish
  | 'bn'        // Bengali
  | 'te'        // Telugu
  | 'mr'        // Marathi
  | 'ta'        // Tamil
  | 'ur'        // Urdu
  | 'gu'        // Gujarati
  | 'kn'        // Kannada
  | 'or'        // Odia
  | 'pa'        // Punjabi
  | 'ml'        // Malayalam
  | 'as'        // Assamese

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP'

export interface LanguageInfo {
  code: LocaleCode
  name: string           // Native name
  englishName: string    // English name
  dir: 'ltr' | 'rtl'    // Text direction
  script: string         // Script name
}

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  locale: string         // BCP 47 locale for Intl.NumberFormat
}

// ─── Translation Keys ─────────────────────────────────────────────────────────

export interface TranslationKeys {
  nav: {
    overview: string
    tools: string
    output: string
    account: string
    main: string
    data: string
    system: string
    support: string
    marketing: string
    config: string
    dashboard: string
    leadFinder: string
    websiteDetection: string
    leadScoring: string
    outreach: string
    aiAudit: string
    proposalGenerator: string
    whatsappGenerator: string
    emailGenerator: string
    crm: string
    reports: string
    exports: string
    settings: string
    profile: string
    billing: string
    subscription: string
    subscriptions: string
    notifications: string
    helpCenter: string
    // Admin nav
    users: string
    agencies: string
    payments: string
    transactions: string
    leads: string
    categories: string
    locations: string
    credits: string
    apiUsage: string
    systemHealth: string
    auditLogs: string
    announcements: string
    emailBroadcast: string
    whatsappBroadcast: string
    integrations: string
    aiUsage: string
    featureFlags: string
  }
  common: {
    search: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    add: string
    filter: string
    export: string
    import: string
    loading: string
    noData: string
    error: string
    success: string
    actions: string
    view: string
    close: string
    back: string
    next: string
    previous: string
    submit: string
    reset: string
    refresh: string
    download: string
    upload: string
    yes: string
    no: string
    all: string
    none: string
    or: string
    and: string
    of: string
    by: string
    from: string
    to: string
    with: string
    without: string
    total: string
    average: string
    maximum: string
    minimum: string
    selected: string
    confirmed: string
    pending: string
    completed: string
    failed: string
    retry: string
    more: string
    less: string
    details: string
    description: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    country: string
    website: string
    company: string
    role: string
    status: string
    date: string
    time: string
    type: string
    category: string
    notes: string
    amount: string
    price: string
    value: string
    quantity: string
    priority: string
  }
  dashboard: {
    totalLeads: string
    totalBusinesses: string
    noWebsiteBusinesses: string
    pipelineValue: string
    wonDeals: string
    lostDeals: string
    conversionRate: string
    avgDealCycle: string
    recentActivity: string
    quickActions: string
    topOpportunities: string
    leadsByStatus: string
    revenueOverview: string
    pipelineSummary: string
    welcome: string
    greeting: string
  }
  leads: {
    addLead: string
    editLead: string
    deleteLead: string
    leadDetails: string
    estimatedValue: string
    leadScore: string
    opportunityScore: string
    source: string
    assignee: string
    lastContact: string
    nextFollowUp: string
    addToLeads: string
    removeFromLeads: string
    convertToDeal: string
  }
  search: {
    searchBusinesses: string
    searchLocation: string
    searchCategory: string
    noResults: string
    resultsFound: string
    filters: string
    clearFilters: string
    applyFilters: string
    advancedSearch: string
    websiteStatus: string
    hasWebsite: string
    noWebsite: string
    unknown: string
  }
  audit: {
    runAudit: string
    auditScore: string
    auditReport: string
    performance: string
    seo: string
    accessibility: string
    bestPractices: string
    critical: string
    warnings: string
    opportunities: string
    passed: string
    overall: string
  }
  proposal: {
    generateProposal: string
    proposalTitle: string
    clientName: string
    projectName: string
    scope: string
    timeline: string
    budget: string
    terms: string
    downloadPdf: string
    preview: string
  }
  whatsapp: {
    generateScript: string
    scriptType: string
    tone: string
    professional: string
    friendly: string
    persuasive: string
    followUp: string
    coldOutreach: string
    appointment: string
  }
  email: {
    generateEmail: string
    subject: string
    body: string
    emailType: string
    coldEmail: string
    followUpEmail: string
    introduction: string
    proposalEmail: string
    thankYou: string
  }
  crm: {
    pipeline: string
    newLead: string
    contacted: string
    qualified: string
    proposal: string
    negotiation: string
    won: string
    lost: string
    dragHere: string
    addCard: string
    moveCard: string
  }
  billing: {
    currentPlan: string
    upgradePlan: string
    downgradePlan: string
    creditsBalance: string
    buyCredits: string
    usageHistory: string
    invoice: string
    paymentMethod: string
    nextBilling: string
    amountDue: string
    paid: string
    unpaid: string
    overdue: string
  }
  profile: {
    personalInfo: string
    changePassword: string
    language: string
    currency: string
    dateFormat: string
    timezone: string
    dangerZone: string
    deleteAccount: string
    updateProfile: string
  }
  settings: {
    general: string
    appearance: string
    notifications: string
    security: string
    apiKeys: string
    integrations: string
  }
  admin: {
    userManagement: string
    systemOverview: string
    revenue: string
    activeUsers: string
    totalRevenue: string
    systemStatus: string
    operational: string
    degraded: string
    down: string
  }
  status: {
    new: string
    active: string
    inactive: string
    pending: string
    completed: string
    cancelled: string
    archived: string
    draft: string
    published: string
    approved: string
    rejected: string
  }
  footer: {
    copyright: string
    tagline: string
    adminTagline: string
  }
  auth: {
    login: string
    signup: string
    logout: string
    emailPlaceholder: string
    passwordPlaceholder: string
    namePlaceholder: string
    forgotPassword: string
    noAccount: string
    hasAccount: string
    orContinueWith: string
  }
}
