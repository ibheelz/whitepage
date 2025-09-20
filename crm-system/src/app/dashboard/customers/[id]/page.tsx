'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackArrowIcon, UserIcon, CompanyIcon, EmailIcon, PhoneIcon, LocationIcon, ClicksIcon, EventsIcon, TargetIcon, RevenueIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'

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
  const router = useRouter()
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
        title: 'Click Event',
        description: `${click.campaign || 'Unknown Campaign'} | ${click.source || 'Unknown Source'}`,
        clickId: click.clickId,
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

  const getCountryFlag = (country: string | null) => {
    if (!country) return ''

    const countryFlags: { [key: string]: string } = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'UK': '🇬🇧',
      'US': '🇺🇸',
      'USA': '🇺🇸'
    }

    return countryFlags[country] || '🌍'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-muted/20 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted/20 rounded"></div>
              <div className="h-4 w-32 bg-muted/20 rounded"></div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-24"></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-96"></div>
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
            href="/dashboard/leads"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-black rounded-xl hover:bg-primary/90 transition-colors"
          >
            <BackArrowIcon size={16} />
            <span>Back to Lead Tracking</span>
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
            >
              <BackArrowIcon size={20} className="text-muted-foreground" />
            </button>
            <div className="flex items-center space-x-3">
              <Avatar
                firstName={customer.firstName}
                lastName={customer.lastName}
                userId={customer.id}
                size="md"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getDisplayName()}</h1>
                <p className="text-sm text-muted-foreground">Customer Tracking Profile</p>
              </div>
            </div>
          </div>

          {customer.isFraud && (
            <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              Fraud Flag
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Profile - Comprehensive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <UserIcon size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Contact Information</h3>
            </div>

            <div className="space-y-3">
              {customer.firstName && customer.lastName && (
                <div className="flex items-center space-x-2 text-sm">
                  <UserIcon size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{customer.firstName} {customer.lastName}</span>
                </div>
              )}
              {customer.masterEmail && (
                <div className="flex items-center space-x-2 text-sm">
                  <EmailIcon size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{customer.masterEmail}</span>
                </div>
              )}
              {customer.masterPhone && (
                <div className="flex items-center space-x-2 text-sm">
                  <PhoneIcon size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{customer.masterPhone}</span>
                </div>
              )}
              {(customer.city || customer.country) && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-foreground">
                    {getCountryFlag(customer.country)} {customer.city && customer.country ? `${customer.city}, ${customer.country}` : customer.country || customer.city}
                  </span>
                </div>
              )}
              {customer.region && customer.region !== customer.city && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Region: </span>
                  <span className="text-foreground">{customer.region}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CompanyIcon size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Business Information</h3>
            </div>
            <div className="space-y-3">
              {customer.company && (
                <div className="flex items-center space-x-2 text-sm">
                  <CompanyIcon size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{customer.company}</span>
                </div>
              )}
              {customer.jobTitle && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Job Title: </span>
                  <span className="text-foreground">{customer.jobTitle}</span>
                </div>
              )}
              {customer.source && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Traffic Source: </span>
                  <span className="text-foreground">{customer.source}</span>
                </div>
              )}
              {customer.assignedTeam && customer.assignedTeam.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Assigned Team: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teamMembers.map((member, index) => (
                      <span key={index} className="inline-flex px-2 py-1 rounded text-xs bg-muted text-foreground">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Status & Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TargetIcon size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Account Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-sm">Status:</span>
                <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  customer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {customer.isFraud && (
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground text-sm">Fraud Flag:</span>
                  <div className="inline-flex px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                    Flagged
                  </div>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">First Seen: </span>
                <span className="text-foreground">{new Date(customer.firstSeen).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last Seen: </span>
                <span className="text-foreground">{new Date(customer.lastSeen).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Created: </span>
                <span className="text-foreground">{new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Identifiers */}
        {customer.identifiers && customer.identifiers.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Customer Identifiers</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customer.identifiers.map((identifier, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {identifier.type.replace('_', ' ')}
                    </span>
                    <div className="flex space-x-1">
                      {identifier.isPrimary && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-primary/20 text-primary">
                          Primary
                        </span>
                      )}
                      {identifier.isVerified && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-foreground mb-2 font-mono">
                    {identifier.value}
                  </div>
                  {(identifier.source || identifier.campaign) && (
                    <div className="text-xs text-muted-foreground">
                      {identifier.source && `Source: ${identifier.source}`}
                      {identifier.source && identifier.campaign && ' | '}
                      {identifier.campaign && `Campaign: ${identifier.campaign}`}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Added: {new Date(identifier.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats - Minimalist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ClicksIcon size={20} className="text-primary" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Clicks</div>
            </div>
            <div className="text-2xl font-bold text-primary">{customer.totalClicks}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TargetIcon size={20} className="text-primary" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Leads</div>
            </div>
            <div className="text-2xl font-bold text-primary">{customer.totalLeads}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <EventsIcon size={20} className="text-primary" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Events</div>
            </div>
            <div className="text-2xl font-bold text-primary">{customer.totalEvents}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <RevenueIcon size={20} className="text-primary" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</div>
            </div>
            <div className="text-2xl font-bold text-primary">${customer.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Click IDs */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ClicksIcon size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Click IDs</h3>
          </div>

          {customer.clicks && customer.clicks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customer.clicks.slice(0, 12).map((click, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {click.clickId || `Click #${index + 1}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {click.campaign || 'Unknown Campaign'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(click.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {click.source && (
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 rounded text-xs bg-muted text-foreground">
                        {click.source}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClicksIcon size={48} className="mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No click IDs recorded yet</p>
            </div>
          )}

          {customer.clicks && customer.clicks.length > 12 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                Showing 12 of {customer.clicks.length} clicks
              </span>
            </div>
          )}
        </div>

        {/* Journey Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TargetIcon size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Customer Journey Timeline</h3>
              <p className="text-sm text-muted-foreground">Track customer interactions and engagement</p>
            </div>
          </div>

          <div className="relative">
            {timeline.length > 0 ? (
              <div className="space-y-6">
                {timeline.slice(0, 10).map((item, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Timeline line */}
                    {index < timeline.slice(0, 10).length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-white/10"></div>
                    )}

                    {/* Timeline dot with icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      item.type === 'click' ? 'bg-blue-500/20 border-blue-500/40' :
                      item.type === 'lead' ? 'bg-green-500/20 border-green-500/40' :
                      'bg-purple-500/20 border-purple-500/40'
                    }`}>
                      {item.type === 'click' ? (
                        <ClicksIcon size={14} className={item.type === 'click' ? 'text-blue-400' : item.type === 'lead' ? 'text-green-400' : 'text-purple-400'} />
                      ) : item.type === 'lead' ? (
                        <TargetIcon size={14} className="text-green-400" />
                      ) : (
                        <EventsIcon size={14} className="text-purple-400" />
                      )}
                    </div>

                    {/* Timeline content */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">{item.title}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              item.type === 'click' ? 'bg-blue-500/20 text-blue-400' :
                              item.type === 'lead' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {item.date.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Click ID Display */}
                      {item.clickId && (
                        <div className="mb-2">
                          <span className="text-sm font-mono text-yellow-400 px-2 py-1 rounded truncate max-w-[200px] inline-block" style={{
                            background: 'rgba(253, 198, 0, 0.1)',
                            border: '1px solid rgba(253, 198, 0, 0.3)'
                          }} title={item.clickId}>
                            {item.clickId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <TargetIcon size={32} className="text-muted-foreground opacity-50" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">No Journey Activity</div>
                <div className="text-sm text-muted-foreground">This customer hasn't had any recorded interactions yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}