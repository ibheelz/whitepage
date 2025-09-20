'use client'

import { useEffect, useState } from 'react'
import { EmailIcon, PhoneIcon, ExportIcon, ImportIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'

interface Lead {
  id: string
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
  campaign: string | null
  source: string | null
  medium: string | null
  country: string | null
  city: string | null
  qualityScore: number | null
  isDuplicate: boolean
  value: number | null
  currency: string | null
  createdAt: string
  customer: {
    id: string
    masterEmail: string | null
    masterPhone: string | null
    firstName: string | null
    lastName: string | null
    totalRevenue: number
    _count: {
      clicks: number
      events: number
    }
  }
}

interface LeadsResponse {
  success: boolean
  leads: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    campaigns: string[]
    sources: string[]
    countries: string[]
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    campaigns: [] as string[],
    sources: [] as string[],
    countries: [] as string[]
  })

  // Search state and view mode
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)

      const response = await fetch(`/api/leads?${params}`)
      const data: LeadsResponse = await response.json()

      if (data.success) {
        setLeads(data.leads)
        setPagination(data.pagination)
        setFilters(data.filters)
      } else {
        setError('Failed to load leads')
      }
    } catch (err) {
      setError('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchLeads(1)
  }

  const handleExport = () => {
    const params = new URLSearchParams({
      type: 'leads',
      format: 'excel',
    })

    if (search) params.append('search', search)

    window.open(`/api/export?${params}`, '_blank')
  }

  const getDisplayName = (lead: Lead) => {
    if (lead.firstName && lead.lastName) {
      return `${lead.firstName} ${lead.lastName}`
    }
    return lead.email || lead.phone || 'Unknown'
  }

  const getLastAction = (lead: Lead) => {
    const clickCount = lead.customer?._count?.clicks || 0
    const eventCount = lead.customer?._count?.events || 0

    if (eventCount > 0) {
      return { action: 'Event', count: eventCount, type: 'event' }
    } else if (clickCount > 0) {
      return { action: 'Click', count: clickCount, type: 'click' }
    } else {
      return { action: 'Lead Submitted', count: 1, type: 'lead' }
    }
  }

  const getQualityBadge = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 80) return 'bg-green-100 text-primary'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading leads...</div>
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
              <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Lead Tracking</h1>
              <p className="text-white/60 text-base">Track and analyze lead submissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span>Import Data</span>
              </button>
              <button onClick={handleExport} className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Export Data</span>
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
              placeholder="Search leads by email, phone, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
            />
          </div>

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


        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Leads Display */}
        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {search ? 'No leads match your search' : 'No leads found'}
            </h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              {search
                ? 'Try adjusting your search terms or clear the search to see all leads'
                : 'Lead submissions will appear here once they start coming in from your campaigns'
              }
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M20 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M4 21v-2a4 4 0 0 1 3-3.87"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Lead</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>Contact</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        <span>Campaign</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wide">
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        <span>Last Action</span>
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
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            firstName={lead.firstName}
                            lastName={lead.lastName}
                            userId={lead.customer?.id}
                            size="md"
                          />
                          <div>
                            <div className="font-medium text-white">{getDisplayName(lead)}</div>
                            <div className="flex space-x-1 mt-1">
                              {lead.isDuplicate && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                  Duplicate
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {lead.email && (
                            <div className="flex items-center space-x-2 text-white/80">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center space-x-2 text-white/80">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{lead.campaign || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-white font-medium text-sm">
                            {new Date(lead.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit'
                            })}
                          </div>
                          <div className="text-white/50 text-xs">
                            {new Date(lead.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      </td>
                      {/* Last Action */}
                      <td className="px-6 py-4">
                        {(() => {
                          const lastAction = getLastAction(lead)
                          return (
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                lastAction.type === 'event' ? 'bg-purple-500' :
                                lastAction.type === 'click' ? 'bg-blue-500' : 'bg-green-500'
                              }`} />
                              <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">{lastAction.action}</span>
                                {lastAction.count > 1 && (
                                  <span className="text-white/60 text-xs">{lastAction.count} times</span>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        {lead.customer?.id ? (
                          <Link
                            href={`/dashboard/customers/${lead.customer.id}`}
                            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors flex items-center justify-center w-20"
                          >
                            VIEW
                          </Link>
                        ) : (
                          <span className="text-white/40 text-sm">No User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Compact View - Minimalist Tracking Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="relative rounded-xl p-4 bg-white/5 border border-white/10"
              >
                {/* Header with Avatar and Name */}
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar
                    firstName={lead.firstName}
                    lastName={lead.lastName}
                    userId={lead.customer?.id}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">{getDisplayName(lead)}</h3>
                    <p className="text-white/50 text-xs truncate">{lead.campaign || 'No Campaign'}</p>
                  </div>
                </div>

                {/* Essential Info - Only most relevant data */}
                <div className="space-y-2 mb-3">
                  {/* Primary Contact */}
                  {lead.email && (
                    <div className="flex items-center space-x-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 flex-shrink-0">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="text-white/70 text-xs truncate">{lead.email}</span>
                    </div>
                  )}

                  {/* Phone if no email */}
                  {!lead.email && lead.phone && (
                    <div className="flex items-center space-x-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 flex-shrink-0">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span className="text-white/70 text-xs truncate">{lead.phone}</span>
                    </div>
                  )}

                  {/* Source */}
                  {lead.source && (
                    <div className="flex items-center space-x-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 flex-shrink-0">
                        <circle cx="12" cy="12" r="2"/>
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                      </svg>
                      <span className="text-white/70 text-xs truncate">{lead.source}</span>
                    </div>
                  )}

                  {/* Last Action */}
                  <div className="flex items-center space-x-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 flex-shrink-0">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    <span className="text-white/70 text-xs truncate">
                      {(() => {
                        const lastAction = getLastAction(lead)
                        return `${lastAction.action}${lastAction.count > 1 ? ` (${lastAction.count})` : ''}`
                      })()}
                    </span>
                  </div>
                </div>

                {/* Footer with Date, Time and Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-white/50 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </span>
                    <span className="text-white/40 text-xs">
                      {new Date(lead.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  {lead.customer?.id ? (
                    <Link
                      href={`/dashboard/customers/${lead.customer.id}`}
                      className="px-3 py-1 text-xs font-medium text-black bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-white/40 text-xs">No Customer</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-sm text-white/70">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => fetchLeads(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = Math.max(1, pagination.page - 2) + i
                if (page > pagination.totalPages) return null

                return (
                  <button
                    key={page}
                    onClick={() => fetchLeads(page)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      page === pagination.page
                        ? 'bg-primary text-black font-medium'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => fetchLeads(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}