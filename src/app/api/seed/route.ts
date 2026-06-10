import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHashedPassword } from '@/lib/auth-utils'

export async function POST() {
  try {
    // Check if demo user already exists
    const existingUser = await db.user.findUnique({
      where: { email: 'demo@finder.com' },
    })

    let demoUser = existingUser

    if (!demoUser) {
      // Create demo user
      const hashedPassword = createHashedPassword('demo123')
      demoUser = await db.user.create({
        data: {
          email: 'demo@finder.com',
          name: 'Demo User',
          password: hashedPassword,
          company: 'WebFinder Pro',
          role: 'admin',
        },
      })
    }

    // Create sample businesses
    const businessesData = [
      {
        name: 'Mario\'s Pizza Palace',
        category: 'Restaurant',
        address: '123 Main Street',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0101',
        email: 'mario@mariospizza.com',
        website: null,
        hasWebsite: false,
        googleRating: 4.3,
        googleReviews: 127,
        latitude: 30.2672,
        longitude: -97.7431,
        source: 'manual',
        notes: 'Family-owned Italian restaurant, popular lunch spot',
      },
      {
        name: 'Glamour Hair Studio',
        category: 'Salon',
        address: '456 Oak Avenue',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0102',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.7,
        googleReviews: 89,
        latitude: 30.2942,
        longitude: -97.7368,
        source: 'manual',
        notes: 'High-end hair salon, strong local following',
      },
      {
        name: 'Mike\'s Auto Repair',
        category: 'Mechanic',
        address: '789 Industrial Blvd',
        city: 'Dallas',
        state: 'TX',
        phone: '(214) 555-0103',
        email: 'mike@mikesauto.com',
        website: 'https://mikesautorepair.com',
        hasWebsite: true,
        googleRating: 4.1,
        googleReviews: 203,
        latitude: 32.7767,
        longitude: -96.7970,
        source: 'manual',
        notes: 'Full-service auto repair, 20 years in business',
      },
      {
        name: 'Quick Fix Plumbing',
        category: 'Plumber',
        address: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        phone: '(713) 555-0104',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 3.9,
        googleReviews: 56,
        latitude: 29.7604,
        longitude: -95.3698,
        source: 'manual',
        notes: 'Emergency plumbing services, 24/7 availability',
      },
      {
        name: 'Sunrise Bakery',
        category: 'Bakery',
        address: '555 Maple Drive',
        city: 'San Antonio',
        state: 'TX',
        phone: '(210) 555-0105',
        email: 'hello@sunrisebakery.com',
        website: null,
        hasWebsite: false,
        googleRating: 4.8,
        googleReviews: 312,
        latitude: 29.4241,
        longitude: -98.4936,
        source: 'manual',
        notes: 'Artisan bakery, wedding cakes specialty',
      },
      {
        name: 'FitZone Gym',
        category: 'Gym',
        address: '100 Fitness Way',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0106',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.2,
        googleReviews: 78,
        latitude: 30.3265,
        longitude: -97.7721,
        source: 'manual',
        notes: 'Local gym with personal training services',
      },
      {
        name: 'Bright Smile Dental',
        category: 'Dentist',
        address: '200 Health Park Lane',
        city: 'Dallas',
        state: 'TX',
        phone: '(214) 555-0107',
        email: 'info@brightsmile.com',
        website: 'https://brightsmiledental.com',
        hasWebsite: true,
        googleRating: 4.6,
        googleReviews: 189,
        latitude: 32.9534,
        longitude: -96.8235,
        source: 'manual',
        notes: 'Cosmetic dentistry specialist',
      },
      {
        name: 'Green Thumb Landscaping',
        category: 'Landscaping',
        address: '750 Garden Road',
        city: 'Houston',
        state: 'TX',
        phone: '(713) 555-0108',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.0,
        googleReviews: 42,
        latitude: 29.6822,
        longitude: -95.4217,
        source: 'manual',
        notes: 'Residential and commercial landscaping',
      },
      {
        name: 'Paws & Claws Vet',
        category: 'Veterinarian',
        address: '880 Pet Care Blvd',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0109',
        email: 'vet@pawsclaws.com',
        website: null,
        hasWebsite: false,
        googleRating: 4.9,
        googleReviews: 234,
        latitude: 30.4022,
        longitude: -97.7253,
        source: 'manual',
        notes: 'Full-service veterinary clinic, exotic animals welcome',
      },
      {
        name: 'Ace Accounting Services',
        category: 'Accounting',
        address: '400 Finance Street',
        city: 'Dallas',
        state: 'TX',
        phone: '(214) 555-0110',
        email: 'tax@aceaccounting.com',
        website: 'https://aceaccountingservices.com',
        hasWebsite: true,
        googleRating: 4.4,
        googleReviews: 67,
        latitude: 32.9483,
        longitude: -96.7299,
        source: 'manual',
        notes: 'Small business tax and accounting specialist',
      },
      {
        name: 'Bella Nails Spa',
        category: 'Salon',
        address: '660 Beauty Lane',
        city: 'San Antonio',
        state: 'TX',
        phone: '(210) 555-0111',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.5,
        googleReviews: 156,
        latitude: 29.5352,
        longitude: -98.4789,
        source: 'manual',
        notes: 'Nail salon with spa services, walk-ins welcome',
      },
      {
        name: 'Metro Cleaners',
        category: 'Dry Cleaning',
        address: '1122 Commerce Ave',
        city: 'Houston',
        state: 'TX',
        phone: '(713) 555-0112',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 3.8,
        googleReviews: 31,
        latitude: 29.7589,
        longitude: -95.3697,
        source: 'manual',
        notes: 'Same-day dry cleaning and alterations',
      },
      {
        name: 'Texas Tacos & More',
        category: 'Restaurant',
        address: '900 Salsa Street',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0113',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.6,
        googleReviews: 445,
        latitude: 30.2579,
        longitude: -97.7489,
        source: 'manual',
        notes: 'Authentic Tex-Mex, very popular breakfast tacos',
      },
      {
        name: 'Sharp Cuts Barbershop',
        category: 'Barber',
        address: '340 Main Street',
        city: 'Dallas',
        state: 'TX',
        phone: '(214) 555-0114',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.7,
        googleReviews: 198,
        latitude: 32.7928,
        longitude: -96.8084,
        source: 'manual',
        notes: 'Classic barbershop, hot towel shaves',
      },
      {
        name: 'Sunset Yoga Studio',
        category: 'Fitness',
        address: '2200 Wellness Drive',
        city: 'San Antonio',
        state: 'TX',
        phone: '(210) 555-0115',
        email: 'namaste@sunsetyoga.com',
        website: 'https://sunsetyogastudio.com',
        hasWebsite: true,
        googleRating: 4.8,
        googleReviews: 112,
        latitude: 29.6113,
        longitude: -98.4958,
        source: 'manual',
        notes: 'Hot yoga, vinyasa, and meditation classes',
      },
      {
        name: 'Reliable Electric Co.',
        category: 'Electrician',
        address: '550 Power Lane',
        city: 'Houston',
        state: 'TX',
        phone: '(713) 555-0116',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.1,
        googleReviews: 48,
        latitude: 29.7702,
        longitude: -95.3873,
        source: 'manual',
        notes: 'Licensed electrician, residential and commercial',
      },
      {
        name: 'Little Learners Daycare',
        category: 'Childcare',
        address: '1800 Family Circle',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0117',
        email: 'info@littlelearners.com',
        website: null,
        hasWebsite: false,
        googleRating: 4.3,
        googleReviews: 76,
        latitude: 30.3418,
        longitude: -97.7613,
        source: 'manual',
        notes: 'Ages 6 weeks to 5 years, state-licensed facility',
      },
    ]

    // Create businesses (skip if already exist)
    const businesses = []
    for (const bizData of businessesData) {
      const existing = await db.business.findFirst({
        where: {
          name: bizData.name,
          city: bizData.city,
        },
      })
      if (existing) {
        businesses.push(existing)
      } else {
        const business = await db.business.create({ data: bizData })
        businesses.push(business)
      }
    }

    // Create leads
    const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
    const priorities = ['low', 'medium', 'high']
    const leadsData = [
      { businessIndex: 0, status: 'qualified', priority: 'high', estimatedValue: 499.00, notes: 'Interested in website redesign' },
      { businessIndex: 1, status: 'contacted', priority: 'medium', estimatedValue: 299.00, notes: 'Called, asked for pricing info' },
      { businessIndex: 3, status: 'proposal', priority: 'high', estimatedValue: 798.00, notes: 'Needs website + SEO package' },
      { businessIndex: 4, status: 'won', priority: 'high', estimatedValue: 1098.00, notes: 'Signed! Full package deal' },
      { businessIndex: 5, status: 'new', priority: 'medium', estimatedValue: 499.00, notes: 'Found via web search, no website' },
      { businessIndex: 7, status: 'contacted', priority: 'low', estimatedValue: 299.00, notes: 'Emailed, awaiting response' },
      { businessIndex: 8, status: 'qualified', priority: 'high', estimatedValue: 898.00, notes: 'Wants website + CRM setup' },
      { businessIndex: 10, status: 'new', priority: 'medium', estimatedValue: 499.00, notes: 'No website, good candidate' },
      { businessIndex: 11, status: 'lost', priority: 'low', estimatedValue: 299.00, notes: 'Chose competitor, price too high' },
      { businessIndex: 12, status: 'contacted', priority: 'high', estimatedValue: 1098.00, notes: 'Very interested in full digital package' },
      { businessIndex: 13, status: 'new', priority: 'medium', estimatedValue: 499.00, notes: 'Popular barbershop, no online presence' },
      { businessIndex: 15, status: 'qualified', priority: 'medium', estimatedValue: 598.00, notes: 'Needs website and WhatsApp marketing' },
    ]

    const leads = []
    for (const leadData of leadsData) {
      const business = businesses[leadData.businessIndex]
      if (!business) continue

      const existingLead = await db.lead.findFirst({
        where: {
          businessId: business.id,
          userId: demoUser.id,
        },
      })

      if (existingLead) {
        leads.push(existingLead)
      } else {
        const lead = await db.lead.create({
          data: {
            businessId: business.id,
            userId: demoUser.id,
            status: leadData.status,
            priority: leadData.priority,
            estimatedValue: leadData.estimatedValue,
            notes: leadData.notes,
            lastContactedAt: leadData.status === 'contacted' || leadData.status === 'qualified' || leadData.status === 'proposal'
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              : null,
          },
        })
        leads.push(lead)
      }
    }

    // Create outreach entries
    const outreachData = [
      { leadIndex: 0, type: 'email', subject: 'Website Redesign Proposal', notes: 'Sent initial proposal with pricing', outcome: 'interested' },
      { leadIndex: 1, type: 'phone', subject: 'Initial Contact Call', notes: 'Discussed their needs, they want more info', outcome: 'follow-up' },
      { leadIndex: 2, type: 'email', subject: 'Comprehensive Digital Package', notes: 'Sent full package proposal', outcome: 'reviewing' },
      { leadIndex: 4, type: 'whatsapp', subject: 'Service Introduction', notes: 'Sent intro message via WhatsApp', outcome: 'read' },
      { leadIndex: 5, type: 'email', subject: 'SEO Services Overview', notes: 'Emailed SEO pricing sheet', outcome: 'no-response' },
      { leadIndex: 7, type: 'phone', subject: 'Follow-up Call', notes: 'Had detailed discussion about website + CRM', outcome: 'interested' },
      { leadIndex: 9, type: 'email', subject: 'Full Digital Package Offer', notes: 'Sent comprehensive proposal for website + SEO + marketing', outcome: 'reviewing' },
      { leadIndex: 3, type: 'email', subject: 'Welcome Onboarding', notes: 'Sent welcome package and onboarding details', outcome: 'positive' },
    ]

    const outreachEntries = []
    for (const outreachItem of outreachData) {
      const lead = leads[outreachItem.leadIndex]
      if (!lead) continue

      const existingOutreach = await db.outreach.findFirst({
        where: {
          leadId: lead.id,
          userId: demoUser.id,
          subject: outreachItem.subject,
        },
      })

      if (existingOutreach) {
        outreachEntries.push(existingOutreach)
      } else {
        const outreach = await db.outreach.create({
          data: {
            leadId: lead.id,
            userId: demoUser.id,
            type: outreachItem.type,
            subject: outreachItem.subject,
            notes: outreachItem.notes,
            outcome: outreachItem.outcome,
          },
        })
        outreachEntries.push(outreach)
      }
    }

    // Create services
    const servicesData = [
      {
        name: 'Website Design',
        description: 'Professional website design and development tailored to your business. Mobile-responsive, SEO-friendly, and built to convert visitors into customers.',
        category: 'Web Design',
        basePrice: 499,
        features: 'Custom Design,Mobile Responsive,SEO Optimized,Contact Form,Social Media Integration,1 Year Hosting',
        popular: true,
      },
      {
        name: 'SEO Optimization',
        description: 'Comprehensive SEO optimization to improve your search engine rankings. Includes keyword research, on-page optimization, and monthly reporting.',
        category: 'Marketing',
        basePrice: 299,
        features: 'Keyword Research,On-Page SEO,Google My Business,Monthly Reports,Competitor Analysis,Local SEO',
        popular: true,
      },
      {
        name: 'WhatsApp Marketing',
        description: 'Harness the power of WhatsApp for business communication. Automated messages, broadcast lists, and customer engagement strategies.',
        category: 'Marketing',
        basePrice: 199,
        features: 'Business Profile Setup,Auto-Reply,Broadcast Lists,Customer Segmentation,Message Templates,Analytics Dashboard',
        popular: false,
      },
      {
        name: 'CRM Setup',
        description: 'Set up a customer relationship management system to track leads, manage customer interactions, and grow your business efficiently.',
        category: 'Business Tools',
        basePrice: 399,
        features: 'CRM Configuration,Lead Pipeline,Contact Management,Email Integration,Task Automation,Staff Training',
        popular: false,
      },
      {
        name: 'Automation Package',
        description: 'Streamline your business operations with automation. From appointment scheduling to invoice generation, save time and reduce errors.',
        category: 'Business Tools',
        basePrice: 599,
        features: 'Appointment Scheduling,Invoice Automation,Email Sequences,Social Media Scheduling,Review Management,Analytics & Reporting',
        popular: true,
      },
    ]

    const services = []
    for (const serviceData of servicesData) {
      const existingService = await db.service.findFirst({
        where: { name: serviceData.name },
      })

      if (existingService) {
        services.push(existingService)
      } else {
        const service = await db.service.create({ data: serviceData })
        services.push(service)
      }
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          company: demoUser.company,
        },
        businessesCreated: businesses.length,
        leadsCreated: leads.length,
        outreachCreated: outreachEntries.length,
        servicesCreated: services.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
