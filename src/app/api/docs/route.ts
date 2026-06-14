import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'BW Finder API',
    description: 'Complete REST API for BW Finder — Discover businesses without websites, manage leads, generate audits & proposals, run CRM pipeline, and export data.',
    version: '1.0.0',
    contact: { name: 'BW Finder Support', email: 'hello@bwfinder.com' },
  },
  servers: [{ url: '/api', description: 'Current server' }],
  tags: [
    { name: 'Search', description: 'Discover businesses using AI-powered web search' },
    { name: 'Leads', description: 'Manage sales leads and pipeline' },
    { name: 'Audit', description: 'Generate business audits and digital gap analysis' },
    { name: 'Proposal', description: 'Create and manage service proposals' },
    { name: 'CRM', description: 'Pipeline, notes, tasks, reminders, and activity tracking' },
    { name: 'Export', description: 'Export data in CSV and JSON formats' },
    { name: 'Analytics', description: 'Dashboard metrics and reporting' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Businesses', description: 'Business directory management' },
  ],
  paths: {
    '/businesses/search': {
      post: {
        tags: ['Search'],
        summary: 'Search for businesses',
        description: 'AI-powered web search to discover businesses in a specific location and category. Returns structured business data with automatic scoring and deduplication.',
        operationId: 'searchBusinesses',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['country', 'category'],
                properties: {
                  country: { type: 'string', description: 'Country to search in', example: 'India' },
                  state: { type: 'string', description: 'State/region', example: 'Maharashtra' },
                  city: { type: 'string', description: 'City', example: 'Mumbai' },
                  category: { type: 'string', description: 'Business category', example: 'Restaurant' },
                  userId: { type: 'string', description: 'User ID for tracking' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Search completed successfully' },
          '400': { description: 'Bad request' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/leads': {
      get: {
        tags: ['Leads'],
        summary: 'List leads',
        description: 'Get a paginated list of leads with optional filtering.',
        operationId: 'listLeads',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status' },
          { name: 'priority', in: 'query', schema: { type: 'string' }, description: 'Filter by priority' },
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Filter by user' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
        ],
        responses: { '200': { description: 'Leads list with pagination' } },
      },
      post: {
        tags: ['Leads'],
        summary: 'Create a lead',
        operationId: 'createLead',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['businessId', 'userId'], properties: { businessId: { type: 'string' }, userId: { type: 'string' }, status: { type: 'string' }, priority: { type: 'string' }, estimatedValue: { type: 'number' }, notes: { type: 'string' } } } } },
        },
        responses: { '201': { description: 'Lead created' }, '400': { description: 'Bad request' } },
      },
    },
    '/leads/{id}': {
      get: { tags: ['Leads'], summary: 'Get lead by ID', operationId: 'getLead', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Lead details' }, '404': { description: 'Not found' } } },
      patch: { tags: ['Leads'], summary: 'Update lead', operationId: 'updateLead', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, priority: { type: 'string' }, estimatedValue: { type: 'number' } } } } } }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Leads'], summary: 'Delete lead', operationId: 'deleteLead', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/businesses/audit': {
      get: {
        tags: ['Audit'],
        summary: 'Get audit report',
        description: 'Retrieve or generate an audit report for a business.',
        operationId: 'getAudit',
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Audit report' }, '400': { description: 'Bad request' }, '404': { description: 'Not found' } },
      },
      post: {
        tags: ['Audit'],
        summary: 'Generate audits',
        description: 'Generate audit reports for businesses. Supports batch auditing and optional AI enhancement.',
        operationId: 'generateAudit',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { businessIds: { type: 'array', items: { type: 'string' } }, auditAll: { type: 'boolean' }, useAI: { type: 'boolean' } } } } } },
        responses: { '200': { description: 'Audits generated' } },
      },
    },
    '/businesses/proposal': {
      get: {
        tags: ['Proposal'],
        summary: 'Get proposal',
        description: 'Retrieve or generate a service proposal for a business.',
        operationId: 'getProposal',
        parameters: [{ name: 'businessId', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Proposal data' }, '400': { description: 'Bad request' } },
      },
      post: {
        tags: ['Proposal'],
        summary: 'Generate proposal',
        description: 'Generate a service proposal with Basic, Professional, and Premium packages.',
        operationId: 'generateProposal',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['businessId'], properties: { businessId: { type: 'string' }, useAI: { type: 'boolean' } } } } } },
        responses: { '200': { description: 'Proposal generated' } },
      },
    },
    '/crm/pipeline': {
      get: {
        tags: ['CRM'],
        summary: 'Get pipeline',
        description: 'Fetch all leads grouped by pipeline stage with stats.',
        operationId: 'getPipeline',
        parameters: [{ name: 'userId', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'Pipeline data' } },
      },
      patch: {
        tags: ['CRM'],
        summary: 'Update lead stage',
        description: 'Move a lead between pipeline stages.',
        operationId: 'updatePipelineStage',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['leadId'], properties: { leadId: { type: 'string' }, status: { type: 'string' }, priority: { type: 'string' }, estimatedValue: { type: 'number' } } } } } },
        responses: { '200': { description: 'Updated' } },
      },
    },
    '/crm/notes': {
      get: { tags: ['CRM'], summary: 'List notes', operationId: 'listNotes', parameters: [{ name: 'leadId', in: 'query', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Notes list' } } },
      post: { tags: ['CRM'], summary: 'Add note', operationId: 'addNote', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['leadId', 'userId', 'content'], properties: { leadId: { type: 'string' }, userId: { type: 'string' }, content: { type: 'string' } } } } } }, responses: { '201': { description: 'Note created' } } },
    },
    '/crm/tasks': {
      get: { tags: ['CRM'], summary: 'List tasks', operationId: 'listTasks', parameters: [{ name: 'leadId', in: 'query', schema: { type: 'string' } }, { name: 'completed', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Tasks list' } } },
      post: { tags: ['CRM'], summary: 'Create task', operationId: 'createTask', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['leadId', 'userId', 'title'], properties: { leadId: { type: 'string' }, userId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' } } } } } }, responses: { '201': { description: 'Task created' } } },
    },
    '/crm/reminders': {
      get: { tags: ['CRM'], summary: 'List reminders', operationId: 'listReminders', parameters: [{ name: 'leadId', in: 'query', schema: { type: 'string' } }, { name: 'completed', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Reminders list' } } },
      post: { tags: ['CRM'], summary: 'Create reminder', operationId: 'createReminder', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['leadId', 'userId', 'title', 'dueDate'], properties: { leadId: { type: 'string' }, userId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' } } } } } }, responses: { '201': { description: 'Reminder created' } } },
    },
    '/crm/activities': {
      get: { tags: ['CRM'], summary: 'List activities', operationId: 'listActivities', parameters: [{ name: 'leadId', in: 'query', schema: { type: 'string' } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }], responses: { '200': { description: 'Activity log' } } },
    },
    '/export': {
      get: {
        tags: ['Export'],
        summary: 'Export data',
        description: 'Export leads, businesses, or audit data in CSV or JSON format.',
        operationId: 'exportData',
        parameters: [
          { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['leads', 'businesses', 'audits', 'pipeline'] } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['csv', 'json'], default: 'csv' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Exported data' }, '400': { description: 'Bad request' } },
      },
    },
    '/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Dashboard analytics',
        description: 'Get comprehensive dashboard metrics.',
        operationId: 'getAnalytics',
        parameters: [{ name: 'userId', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'Analytics data' } },
      },
    },
    '/auth/login': {
      post: { tags: ['Auth'], summary: 'Login', operationId: 'login', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } } },
    },
    '/auth/register': {
      post: { tags: ['Auth'], summary: 'Register', operationId: 'register', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'name', 'password'], properties: { email: { type: 'string' }, name: { type: 'string' }, password: { type: 'string' }, company: { type: 'string' } } } } } }, responses: { '201': { description: 'User created' } } },
    },
    '/businesses': {
      get: { tags: ['Businesses'], summary: 'List businesses', operationId: 'listBusinesses', parameters: [{ name: 'hasWebsite', in: 'query', schema: { type: 'boolean' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Businesses list' } } },
    },
    '/businesses/score': {
      post: { tags: ['Businesses'], summary: 'Score businesses', operationId: 'scoreBusinesses', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { businessIds: { type: 'array', items: { type: 'string' } }, scoreAll: { type: 'boolean' } } } } } }, responses: { '200': { description: 'Scoring complete' } } },
    },
  },
  components: {
    schemas: {
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, category: { type: 'string' },
          city: { type: 'string', nullable: true }, country: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true }, email: { type: 'string', nullable: true },
          website: { type: 'string', nullable: true }, hasWebsite: { type: 'boolean' },
          websiteStatus: { type: 'string', nullable: true },
          leadScore: { type: 'integer', nullable: true }, opportunityScore: { type: 'integer', nullable: true },
          estimatedMonthlyRevenue: { type: 'number', nullable: true },
          auditScore: { type: 'integer', nullable: true },
        },
      },
      Lead: {
        type: 'object',
        properties: {
          id: { type: 'string' }, businessId: { type: 'string' }, userId: { type: 'string' },
          status: { type: 'string' }, priority: { type: 'string' },
          estimatedValue: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec)
}
