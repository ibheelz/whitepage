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
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact')
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

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
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <PlusIcon size={16} />
                <span>New Campaign</span>
              </button>
            </div>
          </div>
        </div>


        {/* Search Bar and View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
            {/* Compact View */}
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'compact'
                  ? 'text-black'
                  : 'text-white/60 hover:text-white/80'
              }`}
              style={{
                background: viewMode === 'compact'
                  ? 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                  : 'transparent'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"/>
              </svg>
            </button>

            {/* Table View */}
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'table'
                  ? 'text-black'
                  : 'text-white/60 hover:text-white/80'
              }`}
              style={{
                background: viewMode === 'table'
                  ? 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                  : 'transparent'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 2v3h18V5H3zm0 5v3h8v-3H3zm10 0v3h8v-3h-8zm-10 5v3h8v-3H3zm10 0v3h8v-3h-8z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Campaign Display */}
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
        ) : viewMode === 'table' ? (
          /* Modern Table View */
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Campaign</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Clicks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Leads</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Regs</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign, index) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <TargetIcon size={18} className="text-black" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{campaign.name}</div>
                            <div className="text-sm text-white/60">{campaign.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 border transition-colors ${
                              campaign.isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              campaign.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span>{campaign.isActive ? 'Active' : 'Paused'}</span>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {dropdownOpen === campaign.id && (
                            <div className="absolute top-full left-0 mt-1 w-28 bg-background/95 border border-white/20 rounded-lg overflow-hidden z-10">
                              <button className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Active</span>
                              </button>
                              <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 flex items-center space-x-2 text-red-400">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Paused</span>
                              </button>
                              <button className="w-full px-3 py-2 text-left text-xs hover:bg-yellow-500/10 flex items-center space-x-2 text-yellow-400">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>Testing</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{campaign.stats.totalClicks.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{campaign.stats.totalLeads.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{campaign.stats.totalEvents.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white/60">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Sleeker Compact View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 bg-white/5 border border-white/10"
              >
                {/* Status Light Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${
                    campaign.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>

                {/* Campaign Header */}
                <div className="mb-6 -m-6 p-6 rounded-t-2xl bg-white/5" style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <TargetIcon size={24} className="text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-0 truncate">{campaign.name}</h3>
                      <p className="text-white/60 text-sm font-mono">{campaign.slug}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-1">{campaign.stats.totalClicks.toLocaleString()}</div>
                    <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-1">{campaign.stats.totalLeads.toLocaleString()}</div>
                    <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-1">{campaign.stats.totalEvents.toLocaleString()}</div>
                    <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Regs</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {/* Status Toggle Button */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-2 ${
                        campaign.isActive
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span>{campaign.isActive ? 'Active' : 'Paused'}</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Status Options Dropdown */}
                    {dropdownOpen === campaign.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-28 bg-background/95 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-10">
                        <button className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Active</span>
                        </button>
                        <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 flex items-center space-x-2 text-red-400">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Paused</span>
                        </button>
                        <button className="w-full px-3 py-2 text-left text-xs hover:bg-yellow-500/10 flex items-center space-x-2 text-yellow-400">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span>Testing</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manage Button */}
                  <button className="px-4 py-1.5 text-xs font-medium text-black bg-white hover:bg-white/90 rounded-lg transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}