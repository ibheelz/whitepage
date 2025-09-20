'use client'

import { useEffect, useState, useRef } from 'react'
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

type CampaignStatus = 'active' | 'paused' | 'inactive'

interface Campaign {
  id: string
  name: string
  slug: string
  description: string | null
  clientId: string | null
  brandId: string | null
  status: CampaignStatus
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [dropdownOpen])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?includeStats=true')
      const data = await response.json()

      if (data.success) {
        // Convert isActive boolean to status for backwards compatibility
        const campaignsWithStatus = data.campaigns.map((campaign: any) => ({
          ...campaign,
          status: campaign.isActive ? 'active' : 'paused' as CampaignStatus
        }))
        setCampaigns(campaignsWithStatus)
      } else {
        setError('Failed to load campaigns')
      }
    } catch (err) {
      setError('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, newStatus: CampaignStatus) => {
    try {
      // Optimistically update the UI
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: newStatus }
          : campaign
      ))

      // Close dropdown
      setDropdownOpen(null)

      // Here you would make an API call to update the campaign status
      // const response = await fetch(`/api/campaigns/${campaignId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // })

      console.log(`Campaign ${campaignId} status updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update campaign status:', err)
      // Revert optimistic update on error
      fetchCampaigns()
    }
  }

  const getStatusConfig = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'green',
          bgClass: 'bg-green-500/10',
          textClass: 'text-green-400',
          borderClass: 'border-green-500/30',
          indicatorClass: 'bg-green-500'
        }
      case 'paused':
        return {
          label: 'Paused',
          color: 'yellow',
          bgClass: 'bg-primary/10',
          textClass: 'text-primary',
          borderClass: 'border-primary/30',
          indicatorClass: 'bg-primary'
        }
      case 'inactive':
        return {
          label: 'Inactive',
          color: 'red',
          bgClass: 'bg-red-500/10',
          textClass: 'text-red-400',
          borderClass: 'border-red-500/30',
          indicatorClass: 'bg-red-500'
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
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
      <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Campaign Management</h1>
              <p className="text-white/60 text-base">Manage your marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
                <span>New Campaign</span>
              </button>
            </div>
          </div>
        </div>


        {/* Search Bar and View Toggle */}
        <div className="mb-6 flex items-center justify-between gap-6">
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center space-x-3 w-80">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
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
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <TargetIcon size={20} className="text-black" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{campaign.name}</div>
                            <div className="text-sm text-white/60">{campaign.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative" ref={dropdownOpen === campaign.id ? dropdownRef : null}>
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 border transition-colors ${
                              getStatusConfig(campaign.status).bgClass
                            } ${
                              getStatusConfig(campaign.status).textClass
                            } ${
                              getStatusConfig(campaign.status).borderClass
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              getStatusConfig(campaign.status).indicatorClass
                            }`} />
                            <span>{getStatusConfig(campaign.status).label}</span>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {dropdownOpen === campaign.id && (
                            <div className="absolute top-full left-0 mt-1 w-32 bg-background/95 border border-white/20 rounded-lg overflow-hidden z-10">
                              <button
                                onClick={() => updateCampaignStatus(campaign.id, 'active')}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Active</span>
                              </button>
                              <button
                                onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-primary/10 flex items-center space-x-2 text-primary"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>Paused</span>
                              </button>
                              <button
                                onClick={() => updateCampaignStatus(campaign.id, 'inactive')}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 flex items-center space-x-2 text-red-400"
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Inactive</span>
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
                  <div className={`w-3 h-3 rounded-full ${getStatusConfig(campaign.status).indicatorClass}`} />
                </div>

                {/* Campaign Header */}
                <div className="mb-6 -m-6 p-6 rounded-t-2xl bg-white/5" style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                      <TargetIcon size={26} className="text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-0 truncate">{campaign.name}</h3>
                      <p className="text-white/60 text-xs font-mono">{campaign.slug} | {formatDate(campaign.createdAt)}</p>
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
                  <div className="relative" ref={dropdownOpen === campaign.id ? dropdownRef : null}>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-2 ${
                        getStatusConfig(campaign.status).bgClass
                      } ${
                        getStatusConfig(campaign.status).textClass
                      } ${
                        getStatusConfig(campaign.status).borderClass
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        getStatusConfig(campaign.status).indicatorClass
                      }`} />
                      <span>{getStatusConfig(campaign.status).label}</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Status Options Dropdown */}
                    {dropdownOpen === campaign.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-32 bg-background/95 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-10">
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Active</span>
                        </button>
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-primary/10 flex items-center space-x-2 text-primary"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>Paused</span>
                        </button>
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'inactive')}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 flex items-center space-x-2 text-red-400"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Inactive</span>
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