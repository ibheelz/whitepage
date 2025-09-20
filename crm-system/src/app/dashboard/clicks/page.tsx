'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnalyticsIcon, CheckIcon, PendingIcon, ClicksIcon, SearchIcon, ExportIcon, ImportIcon } from '@/components/ui/icons'

export default function ClicksPage() {
  const [clicks, setClicks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    // Simulate loading with enhanced demo data
    setTimeout(() => {
      setClicks([
        {
          id: '1',
          clickId: 'click_abc123',
          ip: '192.168.1.100',
          campaign: 'Summer 2024',
          source: 'Google Ads',
          medium: 'CPC',
          landingPage: 'https://example.com/landing',
          userAgent: 'Chrome 120.0.0.0',
          country: 'USA',
          createdAt: new Date('2024-01-15T10:30:00'),
          value: 125.50,
          userId: 'user_1',
          converted: true
        },
        {
          id: '2',
          clickId: 'click_def456',
          ip: '203.45.67.89',
          campaign: 'Black Friday',
          source: 'Facebook Ads',
          medium: 'Social',
          landingPage: 'https://example.com/promo',
          userAgent: 'Safari 17.2',
          country: 'Canada',
          createdAt: new Date('2024-01-14T15:45:00'),
          value: 89.99,
          userId: 'user_2',
          converted: false
        },
        {
          id: '3',
          clickId: 'click_ghi789',
          ip: '10.0.1.50',
          campaign: 'Newsletter',
          source: 'Email',
          medium: 'Email',
          landingPage: 'https://example.com/newsletter',
          userAgent: 'Firefox 121.0',
          country: 'UK',
          createdAt: new Date('2024-01-13T09:15:00'),
          value: 45.00,
          userId: 'user_3',
          converted: true
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredClicks = clicks.filter((click: any) => {
    const matchesSearch =
      click.clickId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      click.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      click.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      click.ip.includes(searchQuery)

    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'converted' && click.converted) ||
      (filterBy === 'not-converted' && !click.converted)

    return matchesSearch && matchesFilter
  })

  const totalClicks = clicks.length
  const convertedClicks = clicks.filter((click: any) => click.converted).length
  const conversionRate = totalClicks > 0 ? ((convertedClicks / totalClicks) * 100).toFixed(1) : '0'
  const totalValue = clicks.reduce((sum: number, click: any) => sum + click.value, 0)

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Click Tracking</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitor and analyze user click behavior across campaigns</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-2xl font-bold text-black transition-all duration-300 flex items-center gap-2" style={{
            background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 198, 0, 0.3)',
            boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
          }}>
            <ImportIcon size={16} />
            Import Data
          </button>
          <button className="px-6 py-3 rounded-2xl font-bold text-black transition-all duration-300 flex items-center gap-2" style={{
            background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 198, 0, 0.3)',
            boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
          }}>
            <ExportIcon size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{totalClicks}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{convertedClicks}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conversions</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">{conversionRate}%</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conv Rate</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">${totalValue.toFixed(0)}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Value</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="premium-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search by click ID, campaign, source, or IP..."
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
              <option value="all">All Clicks</option>
              <option value="converted">Converted</option>
              <option value="not-converted">Not Converted</option>
            </select>
            <button className="premium-button-secondary">
              <SearchIcon size={16} className="mr-2" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Clicks Table */}
      {loading ? (
        <div className="premium-card p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 shimmer rounded-2xl">
                <div className="w-12 h-12 bg-muted/20 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/20 rounded w-1/3"></div>
                  <div className="h-3 bg-muted/20 rounded w-2/3"></div>
                </div>
                <div className="w-20 h-6 bg-muted/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left p-6 font-black text-white">Click Details</th>
                  <th className="text-left p-6 font-black text-white">Source</th>
                  <th className="text-left p-6 font-black text-white">Campaign</th>
                  <th className="text-left p-6 font-black text-white">Value</th>
                  <th className="text-left p-6 font-black text-white">Status</th>
                  <th className="text-left p-6 font-black text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClicks.map((click: any, index) => (
                  <tr
                    key={click.id}
                    className="border-b border-border/10 hover:bg-primary/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                          <ClicksIcon size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-yellow-400 font-mono">{click.clickId}</div>
                          <div className="text-sm text-muted-foreground"><span className="text-green-400 font-mono">{click.ip}</span> • {click.country}</div>
                          <div className="text-xs text-muted-foreground">{click.createdAt.toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{click.source}</div>
                        <div className="text-sm text-muted-foreground">{click.medium}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-semibold text-foreground">{click.campaign}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-48">{click.landingPage}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-lg text-primary">${click.value}</div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        click.converted
                          ? 'bg-green-500/20 text-primary'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {click.converted ? (
                          <><CheckIcon size={16} className="inline mr-1" />Converted</>
                        ) : (
                          <><PendingIcon size={16} className="inline mr-1" />Pending</>
                        )}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/users/${click.userId}`}
                          className="premium-button-secondary px-3 py-1 text-xs"
                        >
                          View User
                        </Link>
                        <button className="premium-button-secondary px-3 py-1 text-xs">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real-time Updates */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-foreground">Live Click Tracking</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}