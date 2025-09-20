'use client'

import { useEffect, useState } from 'react'
import { LinksIcon, ClicksIcon, AnalyticsIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TrackedLink {
  id: string
  shortUrl: string
  originalUrl: string
  title: string | null
  campaign: string | null
  source: string | null
  medium: string | null
  clicks: number
  uniqueClicks: number
  revenue: number
  conversions: number
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  expiresAt: string | null
  lastClicked: string | null
}

export default function LinksPage() {
  const [links, setLinks] = useState<TrackedLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact')

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setLinks([
        {
          id: '1',
          shortUrl: 'https://crm.co/abc123',
          originalUrl: 'https://example.com/landing-page-1',
          title: 'Summer Campaign Landing',
          campaign: 'summer-2024',
          source: 'instagram',
          medium: 'social',
          clicks: 2450,
          uniqueClicks: 1890,
          revenue: 15600,
          conversions: 78,
          status: 'active',
          createdAt: '2024-12-01',
          expiresAt: '2025-06-01',
          lastClicked: '2025-01-15'
        },
        {
          id: '2',
          shortUrl: 'https://crm.co/def456',
          originalUrl: 'https://example.com/product-launch',
          title: 'Product Launch Page',
          campaign: 'product-launch',
          source: 'email',
          medium: 'newsletter',
          clicks: 890,
          uniqueClicks: 720,
          revenue: 8900,
          conversions: 45,
          status: 'active',
          createdAt: '2024-11-15',
          expiresAt: null,
          lastClicked: '2025-01-14'
        },
        {
          id: '3',
          shortUrl: 'https://crm.co/xyz789',
          originalUrl: 'https://example.com/black-friday',
          title: 'Black Friday Deals',
          campaign: 'black-friday',
          source: 'google',
          medium: 'cpc',
          clicks: 5600,
          uniqueClicks: 4200,
          revenue: 42000,
          conversions: 210,
          status: 'expired',
          createdAt: '2024-10-01',
          expiresAt: '2024-11-30',
          lastClicked: '2024-11-30'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredLinks = links.filter(link =>
    link.title?.toLowerCase().includes(search.toLowerCase()) ||
    link.shortUrl.toLowerCase().includes(search.toLowerCase()) ||
    link.campaign?.toLowerCase().includes(search.toLowerCase()) ||
    link.source?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const getConversionRate = (conversions: number, clicks: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-6 space-y-6">
          <div className="h-8 w-64 bg-muted/20 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LinksIcon size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Link Management</h1>
              <p className="text-muted-foreground">Track and manage your campaign links</p>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-3 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </form>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'compact'
                  ? 'bg-primary text-black'
                  : 'bg-muted/20 hover:bg-muted/30 text-muted-foreground'
              }`}
              title="Compact view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-black'
                  : 'bg-muted/20 hover:bg-muted/30 text-muted-foreground'
              }`}
              title="Table view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 2v3h18V5H3zm0 5v3h8v-3H3zm10 0v3h8v-3h-8zm-10 5v3h8v-3H3zm10 0v3h8v-3h-8z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <Card key={link.id} className="bg-white/5 border border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{link.title || 'Untitled Link'}</h3>
                      <p className="text-sm text-primary font-mono truncate">{link.shortUrl}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                      link.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      link.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {link.status}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{link.clicks.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{link.uniqueClicks.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Unique Clicks</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{link.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{getConversionRate(link.conversions, link.clicks)}%</div>
                        <div className="text-xs text-muted-foreground">Conv. Rate</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">${link.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue Generated</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {link.campaign && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Campaign</span>
                        <span className="text-foreground">{link.campaign}</span>
                      </div>
                    )}
                    {link.source && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Source</span>
                        <span className="text-foreground">{link.source}</span>
                      </div>
                    )}
                    {link.lastClicked && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Clicked</span>
                        <span className="text-foreground">{new Date(link.lastClicked).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Link</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Clicks</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unique</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Conversions</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground truncate max-w-[200px]">
                            {link.title || 'Untitled Link'}
                          </div>
                          <div className="text-sm text-primary font-mono truncate max-w-[200px]">
                            {link.shortUrl}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{link.campaign || '-'}</td>
                      <td className="p-4 text-foreground">{link.clicks.toLocaleString()}</td>
                      <td className="p-4 text-foreground">{link.uniqueClicks.toLocaleString()}</td>
                      <td className="p-4 text-foreground">
                        {link.conversions} ({getConversionRate(link.conversions, link.clicks)}%)
                      </td>
                      <td className="p-4 text-primary font-semibold">${link.revenue.toLocaleString()}</td>
                      <td className="p-4">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          link.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          link.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {link.status}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredLinks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <LinksIcon size={32} className="text-muted-foreground opacity-50" />
            </div>
            <div className="text-lg font-medium text-foreground mb-2">No Links Found</div>
            <div className="text-sm text-muted-foreground">Try adjusting your search criteria or create new tracking links.</div>
          </div>
        )}
      </div>
    </div>
  )
}