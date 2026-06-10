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

    // Create sample businesses with new fields
    const businessesData = [
      {
        name: 'Mario\'s Pizza Palace',
        category: 'Restaurant',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43210',
        email: 'mario@mariospizza.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.3,
        googleReviews: 127,
        reviewCount: 145,
        facebookUrl: 'https://facebook.com/mariospizzamumbai',
        instagramUrl: 'https://instagram.com/mariospizza_mumbai',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Family-owned Italian restaurant, popular lunch spot',
      },
      {
        name: 'Glamour Hair Studio',
        category: 'Salon',
        address: '456 Oak Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43211',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.7,
        googleReviews: 89,
        reviewCount: 95,
        facebookUrl: 'https://facebook.com/glamourhairstudio',
        instagramUrl: 'https://instagram.com/glamourhair_mum',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'justdial',
        notes: 'High-end hair salon, strong local following',
      },
      {
        name: 'Mike\'s Auto Repair',
        category: 'Mechanic',
        address: '789 Industrial Blvd',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+91 98765 43212',
        email: 'mike@mikesauto.in',
        website: 'https://mikesautorepair.in',
        hasWebsite: true,
        googleRating: 4.1,
        googleReviews: 203,
        reviewCount: 230,
        facebookUrl: 'https://facebook.com/mikesautodelhi',
        instagramUrl: null,
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Full-service auto repair, 20 years in business',
      },
      {
        name: 'Quick Fix Plumbing',
        category: 'Plumber',
        address: '321 Elm Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        phone: '+91 98765 43213',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 3.9,
        googleReviews: 56,
        reviewCount: 60,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'sulekha',
        notes: 'Emergency plumbing services, 24/7 availability',
      },
      {
        name: 'Sunrise Bakery',
        category: 'Bakery',
        address: '555 Maple Drive',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43214',
        email: 'hello@sunrisebakery.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.8,
        googleReviews: 312,
        reviewCount: 350,
        facebookUrl: 'https://facebook.com/sunrisebakerypune',
        instagramUrl: 'https://instagram.com/sunrise_bakery_pune',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Artisan bakery, wedding cakes specialty',
      },
      {
        name: 'FitZone Gym',
        category: 'Gym',
        address: '100 Fitness Way',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        phone: '+91 98765 43215',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.2,
        googleReviews: 78,
        reviewCount: 85,
        facebookUrl: 'https://facebook.com/fitzonehyd',
        instagramUrl: 'https://instagram.com/fitzone_hyd',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'justdial',
        notes: 'Local gym with personal training services',
      },
      {
        name: 'Bright Smile Dental',
        category: 'Dentist',
        address: '200 Health Park Lane',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        phone: '+91 98765 43216',
        email: 'info@brightsmile.in',
        website: 'https://brightsmiledental.in',
        hasWebsite: true,
        googleRating: 4.6,
        googleReviews: 189,
        reviewCount: 210,
        facebookUrl: 'https://facebook.com/brightsmilechennai',
        instagramUrl: 'https://instagram.com/brightsmile_chennai',
        linkedinUrl: 'https://linkedin.com/company/bright-smile-dental',
        source: 'web_search',
        sourceDetail: 'practo',
        notes: 'Cosmetic dentistry specialist',
      },
      {
        name: 'Green Thumb Landscaping',
        category: 'Real Estate',
        address: '750 Garden Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        phone: '+91 98765 43217',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.0,
        googleReviews: 42,
        reviewCount: 48,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Residential and commercial landscaping',
      },
      {
        name: 'Paws & Claws Vet',
        category: 'Clinic',
        address: '880 Pet Care Blvd',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43218',
        email: 'vet@pawsclaws.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.9,
        googleReviews: 234,
        reviewCount: 260,
        facebookUrl: 'https://facebook.com/pawsclawsmumbai',
        instagramUrl: 'https://instagram.com/pawsclaws_mum',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'justdial',
        notes: 'Full-service veterinary clinic, exotic animals welcome',
      },
      {
        name: 'Ace Accounting Services',
        category: 'Accountant',
        address: '400 Finance Street',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+91 98765 43219',
        email: 'tax@aceaccounting.in',
        website: 'https://aceaccountingservices.in',
        hasWebsite: true,
        googleRating: 4.4,
        googleReviews: 67,
        reviewCount: 72,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: 'https://linkedin.com/company/ace-accounting',
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Small business tax and accounting specialist',
      },
      {
        name: 'Bella Nails Spa',
        category: 'Beauty Parlour',
        address: '660 Beauty Lane',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43220',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.5,
        googleReviews: 156,
        reviewCount: 170,
        facebookUrl: 'https://facebook.com/bellanailspune',
        instagramUrl: 'https://instagram.com/bellanails_pune',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Nail salon with spa services, walk-ins welcome',
      },
      {
        name: 'Metro Cleaners',
        category: 'Other',
        address: '1122 Commerce Ave',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        phone: '+91 98765 43221',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 3.8,
        googleReviews: 31,
        reviewCount: 35,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'sulekha',
        notes: 'Same-day dry cleaning and alterations',
      },
      {
        name: 'Spa Serenity',
        category: 'Spa',
        address: '900 Wellness Street',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        phone: '+91 98765 43222',
        email: 'relax@spaserenity.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.8,
        googleReviews: 312,
        reviewCount: 340,
        facebookUrl: 'https://facebook.com/spaserenitygoa',
        instagramUrl: 'https://instagram.com/spaserenity_goa',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Premium spa and wellness center',
      },
      {
        name: 'Sharp Cuts Barbershop',
        category: 'Salon',
        address: '340 Main Street',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        phone: '+91 98765 43223',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.7,
        googleReviews: 198,
        reviewCount: 215,
        facebookUrl: 'https://facebook.com/sharpcutsjaipur',
        instagramUrl: 'https://instagram.com/sharpcuts_jaipur',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'justdial',
        notes: 'Classic barbershop, hot towel shaves',
      },
      {
        name: 'Sunrise International School',
        category: 'School',
        address: '2200 Education Drive',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+91 98765 43224',
        email: 'admissions@sunriseschool.in',
        website: 'https://sunriseschooldelhi.in',
        hasWebsite: true,
        googleRating: 4.6,
        googleReviews: 445,
        reviewCount: 500,
        facebookUrl: 'https://facebook.com/sunriseschooldelhi',
        instagramUrl: 'https://instagram.com/sunrise_school_delhi',
        linkedinUrl: 'https://linkedin.com/company/sunrise-international-school',
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'K-12 international school with CBSE and IB curriculum',
      },
      {
        name: 'Reliable Electric Co.',
        category: 'Electrician',
        address: '550 Power Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        phone: '+91 98765 43225',
        email: null,
        website: null,
        hasWebsite: false,
        googleRating: 4.1,
        googleReviews: 48,
        reviewCount: 52,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'sulekha',
        notes: 'Licensed electrician, residential and commercial',
      },
      {
        name: 'Law Chambers Associates',
        category: 'Lawyer',
        address: '1800 Legal Circle',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 98765 43226',
        email: 'info@lawchambers.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.5,
        googleReviews: 89,
        reviewCount: 95,
        facebookUrl: null,
        instagramUrl: null,
        linkedinUrl: 'https://linkedin.com/company/law-chambers-associates',
        source: 'web_search',
        sourceDetail: 'google_maps',
        notes: 'Corporate law and litigation specialists',
      },
      {
        name: 'Hotel Raj Palace',
        category: 'Hotel',
        address: 'MG Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        phone: '+91 98765 43227',
        email: 'reservations@rajpalace.in',
        website: null,
        hasWebsite: false,
        googleRating: 4.3,
        googleReviews: 267,
        reviewCount: 290,
        facebookUrl: 'https://facebook.com/hotelrajpalace',
        instagramUrl: 'https://instagram.com/rajpalace_jaipur',
        linkedinUrl: null,
        source: 'web_search',
        sourceDetail: 'tripadvisor',
        notes: 'Heritage hotel near city center',
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
      { businessIndex: 16, status: 'qualified', priority: 'medium', estimatedValue: 598.00, notes: 'Needs website and WhatsApp marketing' },
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

    // Run website detection, scoring & audit directly (avoid self-referential fetch)
    try {
      // Website Detection
      const allBusinesses = await db.business.findMany()
      const SOCIAL_DOMAINS = [
        'facebook.com', 'fb.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
        'whatsapp.com', 'youtube.com', 'tiktok.com', 'yelp.com', 'justdial.com', 'sulekha.com',
        'google.com/maps', 'tripadvisor.com', 'zomato.com', 'swiggy.com',
      ]
      for (const biz of allBusinesses) {
        let websiteStatus: string
        let hasWebsite: boolean
        let socialPresence = 0
        if (biz.facebookUrl) socialPresence++
        if (biz.instagramUrl) socialPresence++
        if (biz.linkedinUrl) socialPresence++

        if (!biz.website || biz.website.trim() === '') {
          websiteStatus = 'NO_WEBSITE'
          hasWebsite = false
        } else {
          try {
            const parsed = new URL(biz.website)
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
            const isSocial = SOCIAL_DOMAINS.some(d => {
              const cd = d.replace(/^www\./, '')
              return hostname === cd || hostname.endsWith('.' + cd)
            })
            if (isSocial) { websiteStatus = 'SOCIAL_ONLY'; hasWebsite = false }
            else if (!parsed.hostname.includes('.') || !['http:', 'https:'].includes(parsed.protocol)) { websiteStatus = 'NO_WEBSITE'; hasWebsite = false }
            else { websiteStatus = 'HAS_WEBSITE'; hasWebsite = true }
          } catch { websiteStatus = 'NO_WEBSITE'; hasWebsite = false }
        }
        await db.business.update({ where: { id: biz.id }, data: { websiteStatus, hasWebsite, socialPresence } })
      }

      // Lead Scoring (simplified)
      const CITY_POPS: Record<string, number> = {
        'mumbai': 12400000, 'delhi': 11000000, 'bengaluru': 8400000, 'hyderabad': 6800000,
        'chennai': 4600000, 'pune': 3100000, 'jaipur': 3100000, 'goa': 400000,
      }
      const CAT_SCORES: Record<string, number> = {
        'hotel': 20, 'real estate': 19, 'school': 18, 'lawyer': 17, 'clinic': 16, 'dentist': 16,
        'restaurant': 14, 'gym': 13, 'spa': 12, 'salon': 11, 'beauty parlour': 11,
        'accountant': 15, 'bakery': 10, 'mechanic': 9, 'plumber': 8, 'electrician': 8,
      }
      const CAT_REVENUE: Record<string, { base: number; perReview: number }> = {
        'restaurant': { base: 15000, perReview: 50 }, 'hotel': { base: 40000, perReview: 200 },
        'salon': { base: 8000, perReview: 30 }, 'beauty parlour': { base: 7000, perReview: 25 },
        'spa': { base: 12000, perReview: 40 }, 'gym': { base: 10000, perReview: 35 },
        'clinic': { base: 25000, perReview: 100 }, 'dentist': { base: 20000, perReview: 80 },
        'lawyer': { base: 30000, perReview: 150 }, 'real estate': { base: 50000, perReview: 200 },
        'school': { base: 35000, perReview: 100 }, 'mechanic': { base: 8000, perReview: 20 },
        'plumber': { base: 6000, perReview: 15 }, 'electrician': { base: 7000, perReview: 15 },
        'bakery': { base: 8000, perReview: 25 }, 'accountant': { base: 15000, perReview: 50 },
      }

      const scoredBusinesses = await db.business.findMany()
      for (const biz of scoredBusinesses) {
        const reviews = biz.reviewCount || biz.googleReviews || 0
        const rating = biz.googleRating || 0
        const cityPop = CITY_POPS[(biz.city || '').toLowerCase().trim()] || 500000
        const catKey = biz.category.toLowerCase()
        const catScore = CAT_SCORES[catKey] || 10
        const revMult = CAT_REVENUE[catKey] || { base: 10000, perReview: 30 }

        let reviewScore = reviews >= 500 ? 20 : reviews >= 200 ? 16 : reviews >= 100 ? 12 : reviews >= 50 ? 8 : reviews >= 20 ? 5 : reviews >= 5 ? 3 : 1
        let ratingScore = rating >= 4.5 ? 20 : rating >= 4.0 ? 16 : rating >= 3.5 ? 12 : rating >= 3.0 ? 8 : rating > 0 ? 4 : 0
        let popScore = cityPop >= 5000000 ? 20 : cityPop >= 1000000 ? 16 : cityPop >= 500000 ? 12 : cityPop >= 200000 ? 8 : 5
        let socialScore = (biz.socialPresence || 0) >= 3 ? 18 : (biz.socialPresence || 0) === 2 ? 12 : (biz.socialPresence || 0) === 1 ? 6 : 2
        let websitePenalty = biz.websiteStatus === 'HAS_WEBSITE' ? -15 : biz.websiteStatus === 'SOCIAL_ONLY' ? -5 : 5

        const leadScore = Math.max(0, Math.min(100, reviewScore + ratingScore + popScore + catScore + socialScore + websitePenalty))
        const opportunityRaw = (popScore * 0.3 + catScore * 0.3 + reviewScore * 0.2 + socialScore * 0.1 + Math.max(0, websitePenalty) * 0.1) * 100 / 20
        const opportunityScore = Math.max(0, Math.min(100, Math.round(opportunityRaw * 5)))
        const estimatedMonthlyRevenue = Math.round(revMult.base + reviews * revMult.perReview)

        await db.business.update({
          where: { id: biz.id },
          data: { leadScore, opportunityScore, estimatedMonthlyRevenue, scoreFactors: JSON.stringify({ reviewScore, ratingScore, populationScore: popScore, categoryScore: catScore, socialScore, websitePenalty }) },
        })
      }

      // Audit (simplified - just save a basic report)
      const auditedBusinesses = await db.business.findMany()
      for (const biz of auditedBusinesses) {
        const items = []
        let auditScore = 100
        const services: string[] = []
        let totalOppValue = 0

        // Website Missing
        if (!biz.hasWebsite || biz.websiteStatus === 'NO_WEBSITE' || biz.websiteStatus === 'SOCIAL_ONLY') {
          const isSocialOnly = biz.websiteStatus === 'SOCIAL_ONLY'
          const webVal = CAT_REVENUE[biz.category.toLowerCase()]?.base ? Math.round(CAT_REVENUE[biz.category.toLowerCase()].base * 0.2) : 2500
          items.push({
            id: 'website_missing',
            title: isSocialOnly ? 'No Professional Website' : 'Website Missing',
            status: 'critical',
            description: `${biz.name} ${isSocialOnly ? 'only has social media pages but no dedicated website' : 'does not have a website'}.`,
            recommendation: `Build a professional website for ${biz.name} with service pages, contact form, and mobile-responsive design.`,
            impact: 'high',
            estimatedValue: webVal,
          })
          auditScore -= 30
          services.push('Website Design & Development')
          totalOppValue += webVal
        } else {
          items.push({ id: 'website_missing', title: 'Website Present', status: 'good', description: `${biz.name} has a website.`, recommendation: 'Conduct a detailed website audit.', impact: 'low', estimatedValue: 500 })
        }

        // SEO Missing
        if (!biz.hasWebsite || !(biz.googleReviews && biz.googleReviews > 20)) {
          const seoVal = CAT_REVENUE[biz.category.toLowerCase()]?.base ? Math.round(CAT_REVENUE[biz.category.toLowerCase()].base * 0.12) : 1500
          items.push({ id: 'seo_missing', title: 'SEO Missing', status: biz.hasWebsite ? 'warning' : 'critical', description: `No SEO presence detected.`, recommendation: `Implement local SEO strategy.`, impact: 'high', estimatedValue: seoVal })
          auditScore -= biz.hasWebsite ? 15 : 25
          services.push('Local SEO Optimization')
          totalOppValue += seoVal
        } else {
          items.push({ id: 'seo_missing', title: 'Basic SEO Present', status: 'good', description: 'Some SEO indicators present.', recommendation: 'Continue building SEO authority.', impact: 'low', estimatedValue: 300 })
        }

        // Booking Missing
        const bookingCats = ['salon', 'beauty parlour', 'spa', 'gym', 'clinic', 'dentist', 'hotel', 'restaurant', 'school']
        if (bookingCats.some(c => biz.category.toLowerCase().includes(c))) {
          const bookVal = Math.round((CAT_REVENUE[biz.category.toLowerCase()]?.base || 10000) * 0.1)
          items.push({ id: 'booking_missing', title: 'Online Booking Missing', status: 'critical', description: `${biz.category} business without online booking.`, recommendation: 'Implement an online booking system.', impact: 'high', estimatedValue: bookVal })
          auditScore -= 20
          services.push('Online Booking System')
          totalOppValue += bookVal
        } else {
          items.push({ id: 'booking_missing', title: 'Booking System', status: 'opportunity', description: 'Could benefit from scheduling.', recommendation: 'Consider adding scheduling.', impact: 'medium', estimatedValue: 800 })
          totalOppValue += 800
        }

        // Lead Capture Missing
        if (!biz.hasWebsite || !biz.email) {
          const lcVal = Math.round((CAT_REVENUE[biz.category.toLowerCase()]?.base || 10000) * 0.08)
          items.push({ id: 'lead_capture_missing', title: 'Lead Capture Missing', status: biz.hasWebsite ? 'warning' : 'critical', description: 'No lead capture mechanism.', recommendation: 'Add strategic lead capture forms.', impact: 'high', estimatedValue: lcVal })
          auditScore -= biz.hasWebsite ? 10 : 20
          services.push('Lead Capture & CRM')
          totalOppValue += lcVal
        } else {
          items.push({ id: 'lead_capture_missing', title: 'Basic Lead Capture', status: 'good', description: 'Basic contact information available.', recommendation: 'Add automated lead nurturing.', impact: 'medium', estimatedValue: 600 })
        }

        // Google Ranking Opportunity
        if (!biz.hasWebsite || !(biz.googleReviews && biz.googleReviews > 0)) {
          const grVal = Math.round((CAT_REVENUE[biz.category.toLowerCase()]?.base || 10000) * 0.1)
          items.push({ id: 'google_ranking_opportunity', title: 'Google Ranking Opportunity', status: 'opportunity', description: 'Low Google visibility.', recommendation: 'Optimize Google Business Profile and target local keywords.', impact: 'high', estimatedValue: grVal })
          auditScore -= 15
          services.push('Google Business Profile Optimization')
          totalOppValue += grVal
        } else {
          items.push({ id: 'google_ranking_opportunity', title: 'Google Presence Exists', status: 'good', description: 'Has Google presence.', recommendation: 'Boost with content marketing.', impact: 'medium', estimatedValue: 500 })
          totalOppValue += 500
        }

        // WhatsApp Opportunity
        items.push({
          id: 'whatsapp_opportunity', title: 'WhatsApp Business Opportunity', status: 'opportunity',
          description: 'Can leverage WhatsApp Business for direct customer engagement.',
          recommendation: 'Set up WhatsApp Business with automated greetings, quick replies, and catalog.',
          impact: 'medium',
          estimatedValue: Math.round((CAT_REVENUE[biz.category.toLowerCase()]?.base || 10000) * 0.06),
        })
        services.push('WhatsApp Business Setup')
        totalOppValue += Math.round((CAT_REVENUE[biz.category.toLowerCase()]?.base || 10000) * 0.06)

        auditScore = Math.max(0, Math.min(100, auditScore))
        const criticalCount = items.filter(i => i.status === 'critical').length

        const report = {
          businessName: biz.name,
          category: biz.category,
          city: biz.city,
          country: biz.country,
          auditDate: new Date().toISOString(),
          overallScore: auditScore,
          items,
          summary: criticalCount >= 3
            ? `${biz.name} has significant digital presence gaps with ${criticalCount} critical issues. Total opportunity value: $${totalOppValue.toLocaleString()}+.`
            : criticalCount >= 1
              ? `${biz.name} has ${criticalCount} critical issue(s). A targeted digital services package could be worth $${totalOppValue.toLocaleString()}.`
              : `${biz.name} has a basic digital presence but growth opportunities. Potential value: $${totalOppValue.toLocaleString()}.`,
          totalOpportunityValue: totalOppValue,
          servicesRecommended: services,
        }

        await db.business.update({
          where: { id: biz.id },
          data: { auditReport: JSON.stringify(report), auditScore, auditDate: new Date() },
        })
      }
    } catch (postSeedError) {
      console.error('Post-seed processing failed:', postSeedError)
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
