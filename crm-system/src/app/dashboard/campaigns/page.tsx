'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, TargetIcon, WarningIcon, SearchIcon } from '@/components/ui/icons'

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


  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
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


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your marketing campaigns</p>
            </div>
            <button className="premium-button-primary">
              <PlusIcon size={16} className="mr-2" />
              New Campaign
            </button>
          </div>
        </div>


        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-muted-foreground" />
            </div>
            <input
              type="search"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input pl-10 w-full"
            />
          </div>
        </div>

        {/* Campaign List */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TargetIcon size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No campaigns match your search' : 'Create your first campaign to get started'}
            </p>
            <button className="premium-button-primary">
              <PlusIcon size={16} className="mr-2" />
              New Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="premium-card">
                <div className="flex items-center justify-between">
                  {/* Campaign Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <TargetIcon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">/{campaign.slug}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{campaign.stats.totalClicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{campaign.stats.totalLeads.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">{campaign.stats.conversionRate}%</div>
                      <div className="text-xs text-muted-foreground">CVR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">${campaign.stats.totalRevenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-muted/20 text-foreground">
                      {campaign.isActive ? 'Active' : 'Paused'}
                    </span>
                    <button className="premium-button-secondary px-3 py-1 text-xs">
                      Edit
                    </button>
                  </div>
                </div>

                {/* Mobile Metrics */}
                <div className="md:hidden mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-muted/20">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{campaign.stats.totalClicks.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{campaign.stats.totalLeads.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{campaign.stats.conversionRate}%</div>
                    <div className="text-xs text-muted-foreground">CVR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">${campaign.stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}