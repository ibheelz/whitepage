'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnalyticsIcon, TargetIcon, CheckIcon, PendingIcon, LocationIcon } from '@/components/ui/icons'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    // Simulate loading with enhanced demo data
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          type: 'signup',
          userId: 'user_1',
          userEmail: 'john@example.com',
          userName: 'John Doe',
          eventData: { plan: 'Premium', source: 'Google Ads' },
          ip: '192.168.1.100',
          country: 'USA',
          createdAt: new Date('2024-01-15T10:30:00'),
          value: 99.99,
          status: 'completed'
        },
        {
          id: '2',
          type: 'purchase',
          userId: 'user_2',
          userEmail: 'jane@example.com',
          userName: 'Jane Smith',
          eventData: { product: 'Pro License', quantity: 1 },
          ip: '203.45.67.89',
          country: 'Canada',
          createdAt: new Date('2024-01-14T15:45:00'),
          value: 199.99,
          status: 'completed'
        },
        {
          id: '3',
          type: 'login',
          userId: 'user_3',
          userEmail: 'bob@example.com',
          userName: 'Bob Johnson',
          eventData: { device: 'mobile', browser: 'Chrome' },
          ip: '10.0.1.50',
          country: 'UK',
          createdAt: new Date('2024-01-13T09:15:00'),
          value: 0,
          status: 'completed'
        },
        {
          id: '4',
          type: 'conversion',
          userId: 'user_4',
          userEmail: 'alice@example.com',
          userName: 'Alice Wilson',
          eventData: { campaign: 'Summer 2024', funnel: 'email' },
          ip: '172.16.0.1',
          country: 'Australia',
          createdAt: new Date('2024-01-12T14:20:00'),
          value: 149.50,
          status: 'pending'
        },
        {
          id: '5',
          type: 'deposit',
          userId: 'user_5',
          userEmail: 'charlie@example.com',
          userName: 'Charlie Brown',
          eventData: { amount: 500, method: 'credit_card' },
          ip: '198.51.100.10',
          country: 'Germany',
          createdAt: new Date('2024-01-11T11:30:00'),
          value: 500.00,
          status: 'completed'
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.country.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterBy === 'all' || event.type === filterBy

    return matchesSearch && matchesFilter
  })

  const totalEvents = events.length
  const totalValue = events.reduce((sum: number, event: any) => sum + event.value, 0)
  const conversionEvents = events.filter((event: any) => ['signup', 'purchase', 'conversion', 'deposit'].includes(event.type)).length
  const avgEventValue = totalEvents > 0 ? (totalValue / totalEvents).toFixed(2) : '0'

  const getEventIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      signup: '👤',
      purchase: '💳',
      login: '🔐',
      conversion: <TargetIcon size={16} />,
      deposit: '💰',
      click: '🖱️',
      view: '👁️',
      download: '📥'
    }
    return icons[type] || '⚡'
  }

  const getEventColor = (type: string) => {
    const colors: { [key: string]: string } = {
      signup: 'from-green-500 to-green-600',
      purchase: 'from-purple-500 to-purple-600',
      login: 'from-blue-500 to-blue-600',
      conversion: 'from-orange-500 to-orange-600',
      deposit: 'from-yellow-500 to-yellow-600',
      click: 'from-pink-500 to-pink-600',
      view: 'from-teal-500 to-teal-600',
      download: 'from-red-500 to-red-600'
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">User Events</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Track and analyze all user interactions and behavioral events</p>
        </div>
        <button className="premium-button-primary">
          <AnalyticsIcon size={16} className="mr-2" />
          Analytics
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{totalEvents}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Events</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{conversionEvents}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conversions</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">${totalValue.toFixed(0)}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Value</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">${avgEventValue}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Value</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="premium-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search by event type, user, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="premium-input min-w-40"
            >
              <option value="all">All Events</option>
              <option value="signup">Signups</option>
              <option value="purchase">Purchases</option>
              <option value="login">Logins</option>
              <option value="conversion">Conversions</option>
              <option value="deposit">Deposits</option>
            </select>
            <button className="premium-button-secondary">
              <span className="mr-2">📅</span>
              Date Range
            </button>
          </div>
        </div>
      </div>

      {/* Events Feed */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="premium-card p-6 shimmer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted/20 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted/20 rounded w-1/3"></div>
                  <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                  <div className="h-3 bg-muted/20 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-muted/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event: any, index) => (
            <div
              key={event.id}
              className="premium-card p-6 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getEventColor(event.type)} rounded-2xl flex items-center justify-center text-white font-black text-2xl`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-black text-foreground capitalize">{event.type}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        event.status === 'completed'
                          ? 'bg-green-500/20 text-primary'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {event.status === 'completed' ? (
                          <><CheckIcon size={16} className="inline mr-1" />Completed</>
                        ) : (
                          <><PendingIcon size={16} className="inline mr-1" />Pending</>
                        )}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground font-medium">
                        <Link href={`/dashboard/users/${event.userId}`} className="text-primary hover:underline font-semibold">
                          {event.userName}
                        </Link>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{event.userEmail}</span>
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span><LocationIcon size={16} className="inline mr-1" />{event.country}</span>
                        <span>🌐 {event.ip}</span>
                        <span>📅 {event.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-3 border border-border/20">
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Event Data</div>
                        <div className="space-y-1">
                          {Object.entries(event.eventData).map(([key, value]) => (
                            <div key={key} className="flex items-center text-sm">
                              <span className="font-semibold text-foreground capitalize mr-2">{key}:</span>
                              <span className="text-muted-foreground">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {event.value > 0 && (
                    <div className="text-2xl font-black text-primary">${event.value}</div>
                  )}
                  <button className="premium-button-secondary px-4 py-2 text-xs">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time Stream */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-black text-foreground">Live Event Stream</span>
          </div>
          <button className="premium-button-secondary text-xs">
            Pause Stream
          </button>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            ⚡ New signup from john.new@example.com (USA) - 2 seconds ago
          </div>
          <div className="text-sm text-muted-foreground">
            💳 Purchase completed by sarah@example.com ($299.99) - 15 seconds ago
          </div>
          <div className="text-sm text-muted-foreground">
            🔐 Login event from mobile device (Canada) - 32 seconds ago
          </div>
        </div>
      </div>
    </div>
  )
}