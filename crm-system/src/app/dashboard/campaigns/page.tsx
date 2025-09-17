'use client'

import { useEffect, useState } from 'react'
import { AnalyticsIcon, PlusIcon, GridIcon, TableIcon, TargetIcon, WarningIcon } from '@/components/ui/icons'

interface CampaignStats {
  totalClicks: number
  totalLeads: number
  totalEvents: number
  uniqueUsers: number
  duplicateLeads: number
  fraudClicks: number
  conversionRate: number
  duplicateRate: number
  fraudRate: number
  avgQualityScore: number
  totalLeadValue: number
  totalEventValue: number
  totalRevenue: number
}

interface Campaign {
  id: string
  name: string
  slug: string
  description: string | null
  clientId: string | null
  brandId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  stats: CampaignStats
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?includeStats=true')
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.campaigns)
      } else {
        setError('Failed to load campaigns')
      }
    } catch (err) {
      setError('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRateColor = (rate: number, type: 'conversion' | 'duplicate' | 'fraud') => {
    if (type === 'conversion') {
      if (rate >= 5) return 'text-primary'
      if (rate >= 2) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // For duplicate and fraud rates, lower is better
      if (rate <= 5) return 'text-primary'
      if (rate <= 15) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'active' && campaign.isActive) ||
      (filterBy === 'inactive' && !campaign.isActive)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-primary">
              Campaign Management
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              Create, monitor, and optimize your marketing campaigns
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="premium-card p-8 shimmer">
              <div className="space-y-4">
                <div className="h-6 bg-muted/20 rounded w-2/3"></div>
                <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-8 bg-muted/20 rounded"></div>
                  <div className="h-8 bg-muted/20 rounded"></div>
                  <div className="h-8 bg-muted/20 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <WarningIcon size={32} />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Error Loading Campaigns</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={fetchCampaigns} className="premium-button-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Calculate overall stats
  const overallStats = campaigns.reduce(
    (acc, campaign) => ({
      totalClicks: acc.totalClicks + campaign.stats.totalClicks,
      totalLeads: acc.totalLeads + campaign.stats.totalLeads,
      totalUsers: acc.totalUsers + campaign.stats.uniqueUsers,
      totalRevenue: acc.totalRevenue + campaign.stats.totalRevenue,
      totalCampaigns: acc.totalCampaigns + 1,
    }),
    { totalClicks: 0, totalLeads: 0, totalUsers: 0, totalRevenue: 0, totalCampaigns: 0 }
  )

  const overallConversionRate = overallStats.totalClicks > 0
    ? Math.round((overallStats.totalLeads / overallStats.totalClicks) * 10000) / 100
    : 0

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Campaign Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Create, monitor, and optimize your marketing campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="premium-button-secondary">
            <AnalyticsIcon size={16} className="mr-2" />
            Analytics
          </button>
          <button className="premium-button-primary">
            <PlusIcon size={16} className="mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="premium-card p-6 text-center glow-effect">
          <div className="text-3xl font-black text-primary mb-2">{overallStats.totalCampaigns}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Campaigns</div>
        </div>
        <div className="premium-card p-6 text-center glow-effect">
          <div className="text-3xl font-black text-foreground mb-2">{overallStats.totalClicks.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</div>
        </div>
        <div className="premium-card p-6 text-center glow-effect">
          <div className="text-3xl font-black text-primary mb-2">{overallStats.totalLeads.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Leads</div>
        </div>
        <div className="premium-card p-6 text-center glow-effect">
          <div className="text-3xl font-black text-foreground mb-2">{overallConversionRate}%</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</div>
        </div>
        <div className="premium-card p-6 text-center glow-effect">
          <div className="text-3xl font-black text-primary mb-2">${overallStats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="premium-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search campaigns by name, slug, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="premium-input min-w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex bg-muted/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GridIcon size={12} className="mr-1" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TableIcon size={12} className="mr-1" />
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Display */}
      {filteredCampaigns.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <AnalyticsIcon size={32} />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">No Campaigns Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterBy !== 'all'
              ? 'No campaigns match your search criteria'
              : 'Get started by creating your first campaign'
            }
          </p>
          <button className="premium-button-primary">
            <PlusIcon size={16} className="mr-2" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <div
              key={campaign.id}
              className="premium-card p-8 hover:scale-105 transition-all duration-300 glow-effect"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <TargetIcon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">Slug: {campaign.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        campaign.isActive
                          ? 'bg-green-500/20 text-primary'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button className="premium-button-secondary px-4 py-2 text-xs">
                    Manage
                  </button>
                </div>

                {/* Description */}
                {campaign.description && (
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary">{campaign.stats.totalLeads.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-foreground">{campaign.stats.totalClicks.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-foreground">{campaign.stats.conversionRate}%</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Conv Rate</div>
                  </div>
                </div>

                {/* Quality & Revenue */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Quality Score:</span>
                    <span className={`text-sm font-bold ${getQualityScoreColor(campaign.stats.avgQualityScore)}`}>
                      {campaign.stats.avgQualityScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Revenue:</span>
                    <span className="text-lg font-black text-primary">${campaign.stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Fraud Rate:</span>
                    <span className={`text-sm font-bold ${getRateColor(campaign.stats.fraudRate, 'fraud')}`}>
                      {campaign.stats.fraudRate}%
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full premium-button-secondary">
                  <AnalyticsIcon size={16} className="mr-2" />
                  View Full Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}