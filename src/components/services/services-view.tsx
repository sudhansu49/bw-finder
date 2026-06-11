'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Globe,
  Search,
  MessageSquare,
  Database,
  Zap,
  Check,
  Star,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Service {
  id?: string
  name: string
  description: string
  price: string
  icon: React.ElementType
  features: string[]
  popular?: boolean
}

const staticServices: Service[] = [
  {
    name: 'Website Design',
    description: 'Professional, responsive website tailored to your brand. Modern design that converts visitors into customers.',
    price: '$499',
    icon: Globe,
    features: [
      'Custom responsive design',
      'Up to 5 pages',
      'Contact form integration',
      'SEO-optimized structure',
      'Mobile-first approach',
      '1 month free support',
    ],
  },
  {
    name: 'SEO Optimization',
    description: 'Boost your online visibility and rank higher in local search results. Get found by customers looking for you.',
    price: '$299/mo',
    icon: Search,
    features: [
      'Local SEO setup',
      'Google My Business optimization',
      'Keyword research & targeting',
      'Monthly performance reports',
      'On-page optimization',
      'Competitor analysis',
    ],
  },
  {
    name: 'WhatsApp Marketing',
    description: 'Connect with customers directly on WhatsApp. Automated messages, catalogs, and business profile setup.',
    price: '$199/mo',
    icon: MessageSquare,
    features: [
      'WhatsApp Business setup',
      'Automated greetings',
      'Product catalog integration',
      'Quick reply templates',
      'Broadcast messaging',
      'Analytics dashboard',
    ],
  },
  {
    name: 'CRM Setup',
    description: 'Organize your leads and customers in one place. Never lose track of a potential deal again.',
    price: '$399',
    icon: Database,
    popular: true,
    features: [
      'Custom CRM configuration',
      'Lead pipeline setup',
      'Automated follow-ups',
      'Email integration',
      'Reporting dashboard',
      'Team access (up to 5)',
    ],
  },
  {
    name: 'Automation Package',
    description: 'Automate repetitive tasks and save hours every week. From appointment booking to invoice generation.',
    price: '$599',
    icon: Zap,
    features: [
      'Appointment scheduling',
      'Invoice automation',
      'Email autoresponders',
      'Social media scheduling',
      'Review request automation',
      'Custom workflow setup',
    ],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const iconMap: Record<string, React.ElementType> = {
  'Website Design': Globe,
  'SEO Optimization': Search,
  'WhatsApp Marketing': MessageSquare,
  'CRM Setup': Database,
  'Automation Package': Zap,
}

export function ServicesView() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>(staticServices)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data = await res.json()
          if (data.services && data.services.length > 0) {
            // Transform DB services to match the Service interface
            const transformed = data.services.map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              price: s.price || `$${s.basePrice}${s.category === 'Marketing' ? '/mo' : ''}`,
              icon: iconMap[s.name] || Globe,
              features: s.features ? (typeof s.features === 'string' ? s.features.split(',') : s.features) : [],
              popular: s.popular || false,
            }))
            setServices(transformed)
          }
        }
      } catch {
        // Use static fallback
      }
    }
    fetchServices()
  }, [])

  const handleLearnMore = (serviceName: string) => {
    toast({
      title: `${serviceName}`,
      description: `Thanks for your interest! Our team will reach out to discuss the ${serviceName} package.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <p className="text-muted-foreground">Digital services you can offer to businesses</p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {services.map((service) => {
          const Icon = service.icon || Globe
          return (
            <motion.div key={service.name} variants={item} className="relative">
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/25">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${service.popular ? 'ring-2 ring-amber-300 pt-4' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{service.price}</p>
                      {typeof service.price === 'string' && service.price.includes('/mo') && (
                        <p className="text-xs text-muted-foreground">per month</p>
                      )}
                      {typeof service.price === 'string' && !service.price.includes('/mo') && (
                        <p className="text-xs text-muted-foreground">one-time</p>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <ul className="space-y-2.5">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className={`w-full mt-6 ${
                      service.popular
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    onClick={() => handleLearnMore(service.name)}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* CTA */}
      <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Need a Custom Package?</h2>
          <p className="text-amber-100 mb-6 max-w-lg mx-auto">
            We can create a tailored solution that fits your specific business needs. Get in touch for a free consultation.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-amber-600 hover:bg-amber-50 font-semibold"
            onClick={() => toast({ title: 'Request Sent!', description: 'Our team will contact you within 24 hours.' })}
          >
            Get Free Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
