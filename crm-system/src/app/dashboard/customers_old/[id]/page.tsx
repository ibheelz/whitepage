'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface UserDetails {
  id: string
  masterEmail: string | null
  masterPhone: string | null
  firstName: string | null
  lastName: string | null
  country: string | null
  region: string | null
  city: string | null
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

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setError(data.error || 'Failed to load user details')
      }
    } catch (err) {
      setError('Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.masterEmail || user?.masterPhone || 'Unknown User'
  }

  const getJourneyTimeline = () => {
    if (!user) return []

    const timeline = []

    // Add clicks
    user.clicks.forEach(click => {
      timeline.push({
        type: 'click',
        date: new Date(click.createdAt),
        title: 'Click',
        description: `Campaign: ${click.campaign || 'Unknown'} | Source: ${click.source || 'Unknown'}`,
        data: click
      })
    })

    // Add leads
    user.leads.forEach(lead => {
      timeline.push({
        type: 'lead',
        date: new Date(lead.createdAt),
        title: 'Lead Submission',
        description: `Campaign: ${lead.campaign || 'Unknown'} | Quality: ${lead.qualityScore || 0}%`,
        data: lead
      })
    })

    // Add events
    user.events.forEach(event => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading user details...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error || 'User not found'}</div>
      </div>
    )
  }

  const timeline = getJourneyTimeline()

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getDisplayName()}</h1>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span>User ID: {user.id}</span>
            <span>•</span>
            <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>Last seen: {new Date(user.lastSeen).toLocaleDateString()}</span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.isActive ? 'bg-green-100 text-primary' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            {user.isFraud && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Fraud Flag
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Flag User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-number">{user.totalClicks}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-number">{user.totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-number">{user.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-number">${user.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Master Email</label>
              <div className="text-sm text-gray-900">{user.masterEmail || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Master Phone</label>
              <div className="text-sm text-gray-900">{user.masterPhone || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <div className="text-sm text-gray-900">
                {user.city && user.country ? `${user.city}, ${user.country}` : 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="identifiers"
            isActive={activeTab === 'identifiers'}
            onClick={() => setActiveTab('identifiers')}
          >
            Identifiers ({user.identifiers.length})
          </TabsTrigger>
          <TabsTrigger
            value="clicks"
            isActive={activeTab === 'clicks'}
            onClick={() => setActiveTab('clicks')}
          >
            Clicks ({user.clicks.length})
          </TabsTrigger>
          <TabsTrigger
            value="leads"
            isActive={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
          >
            Leads ({user.leads.length})
          </TabsTrigger>
          <TabsTrigger
            value="events"
            isActive={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          >
            Events ({user.events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" isActive={activeTab === 'overview'}>
          <Card>
            <CardHeader>
              <CardTitle>User Journey Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  timeline.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        item.type === 'click' ? 'bg-blue-500' :
                        item.type === 'lead' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.title}</h4>
                          <span className="text-sm text-gray-500">
                            {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No activity found for this user
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identifiers" isActive={activeTab === 'identifiers'}>
          <Card>
            <CardHeader>
              <CardTitle>All Identifiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Campaign</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.identifiers.map((identifier) => (
                      <tr key={identifier.id}>
                        <td>{identifier.type}</td>
                        <td className="font-mono">{identifier.value}</td>
                        <td>
                          <div className="flex space-x-1">
                            {identifier.isPrimary && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-foreground">
                                Primary
                              </span>
                            )}
                            {identifier.isVerified && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-primary">
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{identifier.source || '-'}</td>
                        <td>{identifier.campaign || '-'}</td>
                        <td>{new Date(identifier.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks" isActive={activeTab === 'clicks'}>
          <Card>
            <CardHeader>
              <CardTitle>Click History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Click ID</th>
                      <th>Campaign</th>
                      <th>Source</th>
                      <th>Medium</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.clicks.map((click) => (
                      <tr key={click.id}>
                        <td className="font-mono text-sm">{click.clickId || '-'}</td>
                        <td>{click.campaign || '-'}</td>
                        <td>{click.source || '-'}</td>
                        <td>{click.medium || '-'}</td>
                        <td>{click.city && click.country ? `${click.city}, ${click.country}` : '-'}</td>
                        <td>{click.device || '-'}</td>
                        <td>{new Date(click.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" isActive={activeTab === 'leads'}>
          <Card>
            <CardHeader>
              <CardTitle>Lead Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Name</th>
                      <th>Campaign</th>
                      <th>Quality Score</th>
                      <th>Value</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.email || '-'}</td>
                        <td>{lead.phone || '-'}</td>
                        <td>
                          {lead.firstName && lead.lastName ? `${lead.firstName} ${lead.lastName}` : '-'}
                        </td>
                        <td>{lead.campaign || '-'}</td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            (lead.qualityScore || 0) >= 80 ? 'bg-green-100 text-primary' :
                            (lead.qualityScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lead.qualityScore || 0}%
                          </span>
                        </td>
                        <td>{lead.value ? `$${lead.value}` : '-'}</td>
                        <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" isActive={activeTab === 'events'}>
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Campaign</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.events.map((event) => (
                      <tr key={event.id}>
                        <td>{event.eventType}</td>
                        <td>{event.eventName || '-'}</td>
                        <td>{event.category || '-'}</td>
                        <td>{event.value ? `$${event.value} ${event.currency}` : '-'}</td>
                        <td>
                          <div className="flex space-x-1">
                            {event.isRevenue && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-primary">
                                Revenue
                              </span>
                            )}
                            {event.isConverted && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-foreground">
                                Converted
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{event.campaign || '-'}</td>
                        <td>{new Date(event.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}