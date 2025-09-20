'use client'

import { useEffect, useState } from 'react'
import { InfluencerIcon, UsersIcon, EmailIcon, PhoneIcon } from '@/components/ui/icons'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

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
  status: 'active' | 'inactive' | 'pending'
  lastContact: string
  revenue: number
  campaigns: number
  createdAt: string
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact')

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
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
          lastContact: '2025-01-15',
          revenue: 5000,
          campaigns: 3,
          createdAt: '2024-12-01'
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
          lastContact: '2025-01-14',
          revenue: 12000,
          campaigns: 5,
          createdAt: '2024-11-15'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(search.toLowerCase()) ||
    influencer.socialHandle?.toLowerCase().includes(search.toLowerCase()) ||
    influencer.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
              <InfluencerIcon size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Influencer Management</h1>
              <p className="text-muted-foreground">Manage and track your influencer partnerships</p>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-3 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search influencers..."
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
              <UsersIcon size={16} />
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
              <InfluencerIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.id} className="bg-white/5 border border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        firstName={influencer.name.split(' ')[0]}
                        lastName={influencer.name.split(' ')[1]}
                        size="md"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{influencer.name}</h3>
                        <p className="text-sm text-muted-foreground">{influencer.socialHandle}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      influencer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      influencer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {influencer.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Platform</span>
                      <span className="text-foreground">{influencer.platform}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Followers</span>
                      <span className="text-foreground">{influencer.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="text-foreground">{influencer.engagementRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="text-primary font-semibold">${influencer.revenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{influencer.category}</span>
                    <span className="text-xs text-muted-foreground">{influencer.campaigns} campaigns</span>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Influencer</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Platform</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Followers</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Engagement</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInfluencers.map((influencer) => (
                    <tr key={influencer.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            firstName={influencer.name.split(' ')[0]}
                            lastName={influencer.name.split(' ')[1]}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-foreground">{influencer.name}</div>
                            <div className="text-sm text-muted-foreground">{influencer.socialHandle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{influencer.platform}</td>
                      <td className="p-4 text-foreground">{influencer.followers.toLocaleString()}</td>
                      <td className="p-4 text-foreground">{influencer.engagementRate}%</td>
                      <td className="p-4 text-primary font-semibold">${influencer.revenue.toLocaleString()}</td>
                      <td className="p-4">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          influencer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          influencer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {influencer.status}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(influencer.lastContact).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredInfluencers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <InfluencerIcon size={32} className="text-muted-foreground opacity-50" />
            </div>
            <div className="text-lg font-medium text-foreground mb-2">No Influencers Found</div>
            <div className="text-sm text-muted-foreground">Try adjusting your search criteria or add new influencers.</div>
          </div>
        )}
      </div>
    </div>
  )
}