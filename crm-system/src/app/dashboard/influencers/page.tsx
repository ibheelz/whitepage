'use client'

import { useEffect, useState, useRef } from 'react'
import { InfluencerIcon, UsersIcon, EmailIcon, PhoneIcon, CampaignIcon, TargetIcon, AnalyticsIcon, PlusIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  startDate: string
  endDate: string | null
}

interface Lead {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  source: string
  campaign: string
  value: number | null
  createdAt: string
  qualityScore: number
}

type InfluencerStatus = 'active' | 'paused' | 'inactive'

interface Influencer {
  id: string
  name: string
  email: string | null
  phone: string | null
  socialHandle: string | null
  platform: string
  followers: number
  engagementRate: number
  category: string
  location: string | null
  status: InfluencerStatus
  assignedCampaigns: string[]
  totalLeads: number
  totalClicks: number
  totalRegs: number
  totalFtd: number
  createdAt: string
  leads: Lead[]
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact')
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setCampaigns([
        {
          id: 'camp1',
          name: 'Summer Sale 2025',
          status: 'active',
          startDate: '2025-01-01',
          endDate: '2025-03-31'
        },
        {
          id: 'camp2',
          name: 'Product Launch',
          status: 'active',
          startDate: '2024-12-15',
          endDate: null
        },
        {
          id: 'camp3',
          name: 'Holiday Campaign',
          status: 'completed',
          startDate: '2024-11-01',
          endDate: '2024-12-31'
        }
      ])

      setInfluencers([
        {
          id: '1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          phone: '+1234567890',
          socialHandle: '@alexjohnson',
          platform: 'Instagram',
          followers: 150000,
          engagementRate: 4.2,
          category: 'Lifestyle',
          location: 'Los Angeles, CA',
          status: 'active',
          assignedCampaigns: ['camp1', 'camp2'],
          totalLeads: 45,
          totalClicks: 1250,
          totalRegs: 32,
          totalFtd: 8,
          createdAt: '2024-12-01',
          leads: [
            {
              id: 'lead1',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
              source: 'instagram',
              campaign: 'Summer Sale 2025',
              value: 299,
              createdAt: '2025-01-15',
              qualityScore: 85
            },
            {
              id: 'lead2',
              email: 'jane@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              source: 'instagram',
              campaign: 'Product Launch',
              value: 599,
              createdAt: '2025-01-14',
              qualityScore: 92
            }
          ]
        },
        {
          id: '2',
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          phone: '+1987654321',
          socialHandle: '@sarahwilliams',
          platform: 'TikTok',
          followers: 300000,
          engagementRate: 6.8,
          category: 'Fashion',
          location: 'New York, NY',
          status: 'active',
          assignedCampaigns: ['camp1'],
          totalLeads: 78,
          totalClicks: 2100,
          totalRegs: 55,
          totalFtd: 15,
          createdAt: '2024-11-15',
          leads: [
            {
              id: 'lead3',
              email: 'mike@example.com',
              firstName: 'Mike',
              lastName: 'Johnson',
              source: 'tiktok',
              campaign: 'Summer Sale 2025',
              value: 450,
              createdAt: '2025-01-13',
              qualityScore: 88
            }
          ]
        },
        {
          id: '3',
          name: 'Emma Chen',
          email: 'emma@example.com',
          phone: '+1555666777',
          socialHandle: '@emmachen',
          platform: 'YouTube',
          followers: 85000,
          engagementRate: 5.4,
          category: 'Tech',
          location: 'San Francisco, CA',
          status: 'paused',
          assignedCampaigns: [],
          totalLeads: 0,
          totalClicks: 0,
          totalRegs: 0,
          totalFtd: 0,
          createdAt: '2025-01-10',
          leads: []
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const updateInfluencerStatus = async (influencerId: string, newStatus: InfluencerStatus) => {
    try {
      // Optimistically update the UI
      setInfluencers(prev => prev.map(influencer =>
        influencer.id === influencerId
          ? { ...influencer, status: newStatus }
          : influencer
      ))

      // Close dropdown
      setDropdownOpen(null)

      // Here you would make an API call to update the influencer status
      // const response = await fetch(`/api/influencers/${influencerId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // })

      console.log(`Influencer ${influencerId} status updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update influencer status:', err)
      // Revert optimistic update on error
      // fetchInfluencers()
    }
  }

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(search.toLowerCase()) ||
    influencer.socialHandle?.toLowerCase().includes(search.toLowerCase()) ||
    influencer.category.toLowerCase().includes(search.toLowerCase())
  )

  // Sort influencers by status (active first, then paused, then inactive)
  const sortedInfluencers = filteredInfluencers.sort((a, b) => {
    const statusOrder = { 'active': 0, 'paused': 1, 'inactive': 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    return campaign?.name || 'Unknown Campaign'
  }

  const handleAssignToCampaign = (influencerId: string) => {
    setSelectedInfluencer(influencerId)
    setShowAssignModal(true)
  }

  const confirmAssignment = () => {
    if (selectedInfluencer && selectedCampaign) {
      setInfluencers(prev => prev.map(inf =>
        inf.id === selectedInfluencer
          ? { ...inf, assignedCampaigns: [...inf.assignedCampaigns, selectedCampaign] }
          : inf
      ))
      setShowAssignModal(false)
      setSelectedCampaign('')
      setSelectedInfluencer(null)
    }
  }

  const getStatusConfig = (status: InfluencerStatus) => {
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
      <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Influencer Management</h1>
              <p className="text-white/60 text-base">Manage your influencer partnerships</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
                <span>Add Influencer</span>
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
              placeholder="Search influencers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
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
              title="Compact view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18h17v-6H4v6zM4 5v6h17V5H4z"/>
              </svg>
            </button>
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
          /* Sleeker Compact View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedInfluencers.map((influencer) => (
              <div
                key={influencer.id}
                className="group relative rounded-2xl px-8 py-6 cursor-pointer transition-all duration-300 bg-white/5 border border-white/10"
              >
                {/* Status Light Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusConfig(influencer.status).indicatorClass}`} />
                </div>

                {/* Influencer Header */}
                <div className="mb-5 -mx-8 -mt-6 px-8 pt-6 pb-5 rounded-t-2xl bg-white/5" style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center space-x-4">
                    <Avatar
                      firstName={influencer.name.split(' ')[0]}
                      lastName={influencer.name.split(' ')[1]}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-0 truncate">{influencer.name}</h3>
                      <p className="text-white/60 text-xs">{influencer.assignedCampaigns.length} campaigns | {new Date(influencer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-3 py-1.5 rounded-lg flex items-center justify-center text-xs">{influencer.totalClicks.toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Clicks</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-3 py-1.5 rounded-lg flex items-center justify-center text-xs">{influencer.totalLeads.toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Leads</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-3 py-1.5 rounded-lg flex items-center justify-center text-xs">{influencer.totalRegs.toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">Regs</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-black font-bold mb-2 px-3 py-1.5 rounded-lg flex items-center justify-center text-xs">{influencer.totalFtd.toLocaleString()}</div>
                    <div className="text-xs font-normal text-white/40 uppercase tracking-wide">FTD</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {/* Status Toggle Button */}
                  <div className="relative" ref={dropdownOpen === influencer.id ? dropdownRef : null}>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === influencer.id ? null : influencer.id)}
                      className={`w-20 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center space-x-1 ${
                        getStatusConfig(influencer.status).bgClass
                      } ${
                        getStatusConfig(influencer.status).textClass
                      } ${
                        getStatusConfig(influencer.status).borderClass
                      }`}
                    >
                      <span className="text-[8px] tracking-[0.3em]">{getStatusConfig(influencer.status).label.toUpperCase()}</span>
                    </button>

                    {/* Status Options Dropdown */}
                    {dropdownOpen === influencer.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-32 bg-background/95 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-10">
                        <button
                          onClick={() => updateInfluencerStatus(influencer.id, 'active')}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Active</span>
                        </button>
                        <button
                          onClick={() => updateInfluencerStatus(influencer.id, 'paused')}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-primary/10 flex items-center space-x-2 text-primary"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>Paused</span>
                        </button>
                        <button
                          onClick={() => updateInfluencerStatus(influencer.id, 'inactive')}
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
                    className="w-20 px-4 py-1.5 text-xs font-bold text-black bg-white hover:bg-white/90 rounded-lg transition-colors flex items-center justify-center"
                  >
                    MANAGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Influencer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Leads
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Regs
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      FTD
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Campaigns
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sortedInfluencers.map((influencer) => (
                    <tr key={influencer.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            firstName={influencer.name.split(' ')[0]}
                            lastName={influencer.name.split(' ')[1]}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-white text-sm">{influencer.name}</div>
                            <div className="text-white/60 text-xs">{influencer.socialHandle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm">{influencer.platform}</div>
                        <div className="text-white/60 text-xs">{influencer.followers.toLocaleString()} followers</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-semibold">{influencer.totalClicks.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-semibold">{influencer.totalLeads.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-semibold">{influencer.totalRegs.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-semibold">{influencer.totalFtd.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm">{influencer.assignedCampaigns.length} assigned</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative" ref={dropdownOpen === influencer.id ? dropdownRef : null}>
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === influencer.id ? null : influencer.id)}
                            className={`w-20 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border transition-colors ${
                              getStatusConfig(influencer.status).bgClass
                            } ${
                              getStatusConfig(influencer.status).textClass
                            } ${
                              getStatusConfig(influencer.status).borderClass
                            }`}
                          >
                            <span className="text-[8px] tracking-[0.3em]">{getStatusConfig(influencer.status).label.toUpperCase()}</span>
                          </button>

                          {dropdownOpen === influencer.id && (
                            <div className="absolute top-full left-0 mt-1 w-32 bg-background/95 border border-white/20 rounded-lg overflow-hidden z-10">
                              <button
                                onClick={() => updateInfluencerStatus(influencer.id, 'active')}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-green-500/10 flex items-center space-x-2 text-green-400"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Active</span>
                              </button>
                              <button
                                onClick={() => updateInfluencerStatus(influencer.id, 'paused')}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-primary/10 flex items-center space-x-2 text-primary"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>Paused</span>
                              </button>
                              <button
                                onClick={() => updateInfluencerStatus(influencer.id, 'inactive')}
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
                        <button
                          className="w-20 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors flex items-center justify-center"
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
        )}

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-white/10 rounded-lg p-4 max-w-sm w-full mx-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Assign to Campaign</h3>

              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full p-2 bg-white/5 border border-white/10 rounded text-foreground text-sm mb-3"
              >
                <option value="">Choose campaign...</option>
                {campaigns.filter(c => c.status === 'active').map((campaign) => (
                  <option key={campaign.id} value={campaign.id} className="bg-background">
                    {campaign.name}
                  </option>
                ))}
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-3 py-2 text-xs bg-muted/20 hover:bg-muted/30 text-foreground rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignment}
                  disabled={!selectedCampaign}
                  className="flex-1 px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-black disabled:opacity-50 rounded"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {sortedInfluencers.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">No influencers found</div>
          </div>
        )}
      </div>
    </div>
  )
}