'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BackArrowIcon, UserIcon, CompanyIcon, EmailIcon, PhoneIcon, LocationIcon } from '@/components/ui/icons'
import Link from 'next/link'

interface CustomerDetails {
  id: string
  masterEmail: string | null
  masterPhone: string | null
  firstName: string | null
  lastName: string | null
  company: string | null
  jobTitle: string | null
  source: string | null
  country: string | null
  region: string | null
  city: string | null
  profileImage: string | null
  assignedTeam: string[]
  totalClicks: number
  totalLeads: number
  totalEvents: number
  totalRevenue: number
  createdAt: string
  lastSeen: string
  firstSeen: string
  isActive: boolean
  isFraud: boolean
  identifiers: Array<{
    id: string
    type: string
    value: string
    isVerified: boolean
    isPrimary: boolean
    createdAt: string
    source: string | null
    campaign: string | null
  }>
  clicks: Array<{
    id: string
    clickId: string | null
    campaign: string | null
    source: string | null
    medium: string | null
    ip: string
    country: string | null
    city: string | null
    device: string | null
    browser: string | null
    os: string | null
    createdAt: string
  }>
  leads: Array<{
    id: string
    email: string | null
    phone: string | null
    firstName: string | null
    lastName: string | null
    campaign: string | null
    source: string | null
    qualityScore: number | null
    isDuplicate: boolean
    value: number | null
    createdAt: string
  }>
  events: Array<{
    id: string
    eventType: string
    eventName: string | null
    category: string | null
    value: number | null
    currency: string | null
    isRevenue: boolean
    isConverted: boolean
    campaign: string | null
    createdAt: string
  }>
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails()
    }
  }, [customerId])

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()

      if (data.success) {
        setCustomer(data.customer)
      } else {
        setError(data.error || 'Failed to load customer details')
      }
    } catch (err) {
      setError('Failed to fetch customer details')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (customer?.firstName && customer?.lastName) {
      return `${customer.firstName} ${customer.lastName}`
    }
    return customer?.masterEmail || customer?.masterPhone || 'Unknown Customer'
  }

  const getJourneyTimeline = () => {
    if (!customer) return []

    const timeline = []

    // Add clicks
    customer.clicks.forEach(click => {
      timeline.push({
        type: 'click',
        date: new Date(click.createdAt),
        title: 'Click',
        description: `Campaign: ${click.campaign || 'Unknown'} | Source: ${click.source || 'Unknown'}`,
        data: click
      })
    })

    // Add leads
    customer.leads.forEach(lead => {
      timeline.push({
        type: 'lead',
        date: new Date(lead.createdAt),
        title: 'Lead Submission',
        description: `Campaign: ${lead.campaign || 'Unknown'} | Quality: ${lead.qualityScore || 0}%`,
        data: lead
      })
    })

    // Add events
    customer.events.forEach(event => {
      timeline.push({
        type: 'event',
        date: new Date(event.createdAt),
        title: event.eventName || event.eventType,
        description: `${event.eventType} | ${event.isRevenue ? `Revenue: $${event.value}` : 'No revenue'}`,
        data: event
      })
    })

    return timeline.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const getTeamMembers = (teamIds: string[]) => {
    const teamMembers = [
      { id: 'team1', name: 'Alice Johnson', role: 'Account Manager', color: 'bg-pink-500' },
      { id: 'team2', name: 'Bob Smith', role: 'Sales Rep', color: 'bg-blue-500' },
      { id: 'team3', name: 'Carol Davis', role: 'Customer Success', color: 'bg-green-500' },
    ]

    return teamIds.map(teamId => {
      const member = teamMembers.find(m => m.id === teamId)
      return member || { id: teamId, name: 'Unknown', role: 'Team Member', color: 'bg-gray-500' }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted/20 rounded-lg"></div>
            <div className="h-8 w-64 bg-muted/20 rounded"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 h-24"></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-card rounded-2xl p-6 h-96"></div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-foreground mb-2">Customer Not Found</div>
          <div className="text-muted-foreground mb-4">{error || 'The requested customer could not be found.'}</div>
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-black rounded-xl hover:bg-primary/90 transition-colors"
          >
            <BackArrowIcon size={16} />
            <span>Back to Customers</span>
          </Link>
        </div>
      </div>
    )
  }

  const timeline = getJourneyTimeline()
  const teamMembers = getTeamMembers(customer.assignedTeam)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/customers"
              className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
            >
              <BackArrowIcon size={20} className="text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{getDisplayName()}</h1>
              <p className="text-sm text-muted-foreground">Customer ID: {customer.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </div>
            {customer.isFraud && (
              <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Fraud Flag
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info Card */}
        <div className="bg-card rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                {customer.profileImage ? (
                  <img src={customer.profileImage} alt="" className="w-16 h-16 rounded-2xl" />
                ) : (
                  <UserIcon size={28} className="text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">{getDisplayName()}</h2>
                {customer.jobTitle && (
                  <p className="text-sm text-muted-foreground mb-1">{customer.jobTitle}</p>
                )}
                {customer.company && (
                  <div className="flex items-center space-x-2 text-sm text-foreground">
                    <CompanyIcon size={14} className="text-muted-foreground" />
                    <span>{customer.company}</span>
                  </div>
                )}
              </div>
            </div>

            {customer.source && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                customer.source === 'LinkedIn' ? 'bg-blue-100 text-blue-800' :
                customer.source === 'Referral' ? 'bg-green-100 text-green-800' :
                customer.source === 'Paid Ad' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {customer.source}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact</h3>
              <div className="space-y-3">
                {customer.masterEmail && (
                  <div className="flex items-center space-x-3">
                    <EmailIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{customer.masterEmail}</span>
                  </div>
                )}
                {customer.masterPhone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{customer.masterPhone}</span>
                  </div>
                )}
                {(customer.city || customer.country) && (
                  <div className="flex items-center space-x-3">
                    <LocationIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {customer.city && customer.country ? `${customer.city}, ${customer.country}` : customer.country || customer.city}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Timeline</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">First seen:</span>{' '}
                  <span className="text-foreground">{new Date(customer.firstSeen).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Last seen:</span>{' '}
                  <span className="text-foreground">{new Date(customer.lastSeen).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{' '}
                  <span className="text-foreground">{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Assigned Team</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-semibold`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="text-sm text-muted-foreground">No team members assigned</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-primary">{customer.totalClicks}</div>
          </div>
          <div className="bg-card rounded-2xl shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Leads</div>
            <div className="text-3xl font-bold text-primary">{customer.totalLeads}</div>
          </div>
          <div className="bg-card rounded-2xl shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Events</div>
            <div className="text-3xl font-bold text-primary">{customer.totalEvents}</div>
          </div>
          <div className="bg-card rounded-2xl shadow-sm p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-primary">${customer.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-card rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">Customer Journey Timeline</h3>
          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-border last:border-b-0">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    item.type === 'click' ? 'bg-blue-500' :
                    item.type === 'lead' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <UserIcon size={48} className="mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">No Activity Found</div>
                <div className="text-sm">This customer hasn't had any recorded activity yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}