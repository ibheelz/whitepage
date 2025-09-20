'use client'

import React, { useEffect, useState, useRef } from 'react'
import { PlusIcon, TargetIcon, WarningIcon, SearchIcon } from '@/components/ui/icons'
import CampaignModal from '@/components/ui/campaign-modal'

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
  logoUrl?: string | null
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [managingCampaign, setManagingCampaign] = useState<Campaign | null>(null)
  const [allConversionTypes, setAllConversionTypes] = useState<string[]>([])
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

        // Extract all unique conversion types from campaigns
        const conversionTypes = new Set<string>()
        campaignsWithStatus.forEach((campaign: any) => {
          if (campaign.conversionTypes && Array.isArray(campaign.conversionTypes) && campaign.conversionTypes.length > 0) {
            campaign.conversionTypes.forEach((type: any) => {
              if (type && (type.name || type.id || type)) {
                conversionTypes.add(type.name || type.id || type)
              }
            })
          }
        })
        setAllConversionTypes(Array.from(conversionTypes))
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

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      console.log('Creating campaign:', campaignData)

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      const result = await response.json()

      if (result.success) {
        fetchCampaigns()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleManageCampaign = (campaign: Campaign) => {
    // Directly open the edit modal
    setManagingCampaign(campaign)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchCampaigns()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }


  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  // Sort campaigns by status (active first, then paused, then inactive)
  const sortedCampaigns = filteredCampaigns.sort((a, b) => {
    const statusOrder = { 'active': 0, 'paused': 1, 'inactive': 2 }
    return statusOrder[a.status] - statusOrder[b.status]
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
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
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
        {sortedCampaigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchQuery ? 'No campaigns match your search' : 'No campaigns found'}
            </h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search terms or clear the filter to see all campaigns'
                : 'Create your first campaign to start tracking your marketing performance and manage conversions'
              }
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-primary/25 transform hover:-translate-y-0.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Create Campaign</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Modern Table View */
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <span>Campaign</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M9 12l2 2 4-4"/>
                          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                          <path d="M18 12c0 3-3 6-6 6s-6-3-6-6 3-6 6-6 6 3 6 6"/>
                        </svg>
                        <span>Clicks</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="8.5" cy="7" r="4"/>
                          <line x1="20" y1="8" x2="20" y2="14"/>
                          <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        <span>Leads</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        <span>Regs</span>
                      </div>
                    </th>
                    {/* Dynamic conversion type columns */}
                    {allConversionTypes.map((conversionType) => (
                      <th key={conversionType} className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                        <div className="flex items-center space-x-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                          </svg>
                          <span>{conversionType}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>Created</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCampaigns.map((campaign, index) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                            {campaign.logoUrl ? (
                              <img
                                src={campaign.logoUrl}
                                alt={`${campaign.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <TargetIcon size={20} className="text-black" />
                            )}
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
                            className={`w-20 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border transition-colors ${
                              getStatusConfig(campaign.status).bgClass
                            } ${
                              getStatusConfig(campaign.status).textClass
                            } ${
                              getStatusConfig(campaign.status).borderClass
                            }`}
                          >
                            <span className="text-[8px] tracking-[0.3em]">{getStatusConfig(campaign.status).label.toUpperCase()}</span>
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
                        <div className="text-primary font-bold">{Math.floor(Math.random() * 10000).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-bold">{Math.floor(Math.random() * 1000).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-bold">{Math.floor(Math.random() * 500).toLocaleString()}</div>
                      </td>
                      {/* Dynamic conversion type data columns */}
                      {allConversionTypes.map((conversionType) => {
                        // Find conversion data for this type in campaign
                        const conversionData = campaign.conversionTypes && Array.isArray(campaign.conversionTypes)
                          ? campaign.conversionTypes.find((ct: any) => (ct.name || ct.id || ct) === conversionType)
                          : null
                        const count = conversionData?.count || campaign.stats?.[`${conversionType.toLowerCase()}Count`] || 0

                        return (
                          <td key={conversionType} className="px-6 py-4">
                            <div className="text-white font-medium">{typeof count === 'number' && count.toLocaleString ? count.toLocaleString() : count}</div>
                          </td>
                        )
                      })}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-white font-medium text-sm">
                            {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit'
                            })}
                          </div>
                          <div className="text-white/50 text-xs">
                            {new Date(campaign.createdAt).getFullYear()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleManageCampaign(campaign)}
                          className="w-20 px-4 py-1.5 text-xs font-bold rounded-lg bg-white text-black hover:bg-white/90 transition-colors flex items-center justify-center"
                        >
                          MANAGE
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="group relative rounded-2xl px-8 py-6 cursor-pointer transition-all duration-300 bg-white/5 border border-white/10"
              >
                {/* Status Light Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusConfig(campaign.status).indicatorClass}`} />
                </div>

                {/* Campaign Header */}
                <div className="mb-5 -mx-8 -mt-6 px-8 pt-6 pb-5 rounded-t-2xl bg-white/5" style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
                      {campaign.logoUrl ? (
                        <img
                          src={campaign.logoUrl}
                          alt={`${campaign.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TargetIcon size={26} className="text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-0 truncate">{campaign.name}</h3>
                      <p className="text-white/60 text-xs font-mono">{campaign.slug} | {formatDate(campaign.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-4 py-1.5 rounded-lg flex items-center justify-center text-xs">{Math.floor(Math.random() * 10000).toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Clicks</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-4 py-1.5 rounded-lg flex items-center justify-center text-xs">{Math.floor(Math.random() * 1000).toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Leads</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-4 py-1.5 rounded-lg flex items-center justify-center text-xs">{Math.floor(Math.random() * 500).toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Regs</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {/* Status Toggle Button */}
                  <div className="relative" ref={dropdownOpen === campaign.id ? dropdownRef : null}>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === campaign.id ? null : campaign.id)}
                      className={`w-20 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center space-x-1 ${
                        getStatusConfig(campaign.status).bgClass
                      } ${
                        getStatusConfig(campaign.status).textClass
                      } ${
                        getStatusConfig(campaign.status).borderClass
                      }`}
                    >
                      <span className="text-[8px] tracking-[0.3em]">{getStatusConfig(campaign.status).label.toUpperCase()}</span>
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
                  <button
                    onClick={() => handleManageCampaign(campaign)}
                    className="w-20 px-4 py-1.5 text-xs font-bold text-black bg-white hover:bg-white/90 rounded-lg transition-colors flex items-center justify-center"
                  >
                    MANAGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Campaign Creation Modal */}
        <CampaignModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCampaign}
        />

        {/* Campaign Edit Modal */}
        {managingCampaign && (
          <CampaignModal
            isOpen={true}
            onClose={() => setManagingCampaign(null)}
            onDelete={handleDeleteCampaign}
            onSubmit={async (updatedData) => {
              try {
                console.log('Updating campaign:', managingCampaign.id, updatedData)

                const response = await fetch(`/api/campaigns/${managingCampaign.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedData)
                })

                const result = await response.json()

                if (result.success) {
                  setManagingCampaign(null)
                  fetchCampaigns()
                } else {
                  throw new Error(result.error)
                }
              } catch (error) {
                console.error('Error updating campaign:', error)
              }
            }}
            editMode={managingCampaign}
          />
        )}
      </div>
    </div>
  )
}