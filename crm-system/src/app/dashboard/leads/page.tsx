'use client'

import { useEffect, useState } from 'react'
import { EmailIcon, PhoneIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

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
  user: {
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

  // Filter states
  const [search, setSearch] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedDuplicate, setSelectedDuplicate] = useState('')
  const [minQualityScore, setMinQualityScore] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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
      if (selectedCampaign) params.append('campaign', selectedCampaign)
      if (selectedSource) params.append('source', selectedSource)
      if (selectedCountry) params.append('country', selectedCountry)
      if (selectedDuplicate) params.append('isDuplicate', selectedDuplicate)
      if (minQualityScore) params.append('qualityScore', minQualityScore)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

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

  const handleReset = () => {
    setSearch('')
    setSelectedCampaign('')
    setSelectedSource('')
    setSelectedCountry('')
    setSelectedDuplicate('')
    setMinQualityScore('')
    setDateFrom('')
    setDateTo('')
    fetchLeads(1)
  }

  const handleExport = () => {
    const params = new URLSearchParams({
      type: 'leads',
      format: 'excel',
    })

    if (search) params.append('search', search)
    if (selectedCampaign) params.append('campaign', selectedCampaign)
    if (selectedSource) params.append('source', selectedSource)

    window.open(`/api/export?${params}`, '_blank')
  }

  const getDisplayName = (lead: Lead) => {
    if (lead.firstName && lead.lastName) {
      return `${lead.firstName} ${lead.lastName}`
    }
    return lead.email || lead.phone || 'Unknown'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600">Manage and analyze lead submissions</p>
        </div>
        <Button onClick={handleExport}>
          Export Leads
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Email, phone, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign
              </label>
              <Select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">All Campaigns</option>
                {filters.campaigns.map(campaign => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <Select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="">All Sources</option>
                {filters.sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {filters.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duplicate Status
              </label>
              <Select
                value={selectedDuplicate}
                onChange={(e) => setSelectedDuplicate(e.target.value)}
              >
                <option value="">All Leads</option>
                <option value="false">Unique Only</option>
                <option value="true">Duplicates Only</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Quality Score
              </label>
              <Input
                type="number"
                placeholder="0-100"
                value={minQualityScore}
                onChange={(e) => setMinQualityScore(e.target.value)}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSearch}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Leads ({pagination.total.toLocaleString()})
            </CardTitle>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {leads.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No leads found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Contact</th>
                    <th>Campaign</th>
                    <th>Source</th>
                    <th>Location</th>
                    <th>Quality</th>
                    <th>Value</th>
                    <th>User Stats</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div>
                          <div className="font-medium">{getDisplayName(lead)}</div>
                          <div className="flex space-x-1 mt-1">
                            {lead.isDuplicate && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-primary">
                                Duplicate
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {lead.email && <div><EmailIcon size={16} className="inline mr-1" />{lead.email}</div>}
                          {lead.phone && <div><PhoneIcon size={16} className="inline mr-1" />{lead.phone}</div>}
                        </div>
                      </td>
                      <td>{lead.campaign || '-'}</td>
                      <td>{lead.source || '-'}</td>
                      <td>
                        {lead.city && lead.country ? `${lead.city}, ${lead.country}` :
                         lead.country || '-'}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQualityBadge(lead.qualityScore)}`}>
                          {lead.qualityScore || 0}%
                        </span>
                      </td>
                      <td>
                        {lead.value ? `$${lead.value.toLocaleString()} ${lead.currency}` : '-'}
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">
                          <div>{lead.user._count.clicks} clicks</div>
                          <div>{lead.user._count.events} events</div>
                          <div>${lead.user.totalRevenue.toLocaleString()} revenue</div>
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/users/${lead.user.id}`}
                          className="text-foreground hover:text-foreground text-sm"
                        >
                          View User
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLeads(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, pagination.page - 2) + i
                  if (page > pagination.totalPages) return null

                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchLeads(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLeads(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}