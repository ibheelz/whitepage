'use client'

import { useEffect, useState } from 'react'
import { RefreshIcon, WorldIcon, GraphIcon, DeviceIcon, WarningIcon } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsData {
  timeSeries: Array<{
    date: string
    clicks: number
    leads: number
    events: number
    revenue: number
    conversions: number
  }>
  geoData: Array<{
    country: string
    clicks: number
    leads: number
    revenue: number
  }>
  sourceData: Array<{
    source: string
    clicks: number
    leads: number
    conversionRate: number
    revenue: number
  }>
  campaignData: Array<{
    campaign: string
    clicks: number
    leads: number
    revenue: number
    qualityScore: number
    fraudRate: number
  }>
  deviceData: Array<{
    device: string
    clicks: number
    leads: number
    conversionRate: number
  }>
  hourlyData: Array<{
    hour: number
    clicks: number
    leads: number
    events: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('30')
  const [viewType, setViewType] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe, viewType])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        days: timeframe,
        type: viewType
      })

      const response = await fetch(`/api/analytics?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (err) {
      setError('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const SimpleChart = ({ data, title, dataKey }: { data: any[], title: string, dataKey: string }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="space-y-1">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="truncate">{item[Object.keys(item)[0]]}</span>
            <span className="font-medium">{item[dataKey]?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const MetricCard = ({ title, value, change, color = "blue" }: {
    title: string
    value: string | number
    change?: string
    color?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p className="text-xs text-gray-500">{change}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-primary">
              Performance Insights
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              Advanced analytics and data visualization dashboard
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="premium-card p-6 shimmer">
              <div className="space-y-3">
                <div className="h-8 bg-muted/20 rounded w-20"></div>
                <div className="h-4 bg-muted/20 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6">
            <WarningIcon size={32} />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">Analytics Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'No data available'}</p>
          <button onClick={fetchAnalytics} className="premium-button-primary">
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totals = data.timeSeries.reduce(
    (acc, day) => ({
      clicks: acc.clicks + day.clicks,
      leads: acc.leads + day.leads,
      events: acc.events + day.events,
      revenue: acc.revenue + day.revenue,
      conversions: acc.conversions + day.conversions
    }),
    { clicks: 0, leads: 0, events: 0, revenue: 0, conversions: 0 }
  )

  const conversionRate = totals.clicks > 0 ? (totals.leads / totals.clicks * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Performance Insights</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Advanced analytics and data visualization dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="premium-input min-w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={fetchAnalytics} className="premium-button-primary">
            <RefreshIcon size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">{totals.clicks.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{totals.leads.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Leads</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">{conversionRate}%</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">${totals.revenue.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{totals.events.toLocaleString()}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Events</div>
        </div>
      </div>

      {/* Time Series Visualization */}
      <div className="premium-card p-8">
        <h2 className="text-2xl font-black text-primary mb-6">Performance Over Time</h2>
        <div className="space-y-4">
          {data.timeSeries.slice(-7).map((day, index) => (
            <div key={day.date} className="flex items-center space-x-4 p-4 bg-muted/10 rounded-2xl hover:bg-muted/20 transition-all duration-300">
              <div className="flex-shrink-0 w-24 text-sm font-bold text-foreground">
                {new Date(day.date).toLocaleDateString()}
              </div>
              <div className="flex-1 grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-xl font-black text-foreground">{day.clicks}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-primary">{day.leads}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-foreground">{day.events}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-primary">${day.revenue}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase">Revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center">
            <WorldIcon size={20} className="mr-3" />
            Top Countries
          </h3>
          <div className="space-y-4">
            {data.geoData.slice(0, 5).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl">
                <span className="font-semibold text-foreground">{country.country}</span>
                <div className="text-right">
                  <div className="font-bold text-primary">{country.clicks.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">clicks</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center">
            <GraphIcon size={20} className="mr-3" />
            Traffic Sources
          </h3>
          <div className="space-y-4">
            {data.sourceData.slice(0, 5).map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl">
                <span className="font-semibold text-foreground">{source.source}</span>
                <div className="text-right">
                  <div className="font-bold text-primary">{source.clicks.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{source.conversionRate}% conv</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center">
            <DeviceIcon size={20} className="mr-3" />
            Device Types
          </h3>
          <div className="space-y-4">
            {data.deviceData.slice(0, 5).map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl">
                <span className="font-semibold text-foreground">{device.device}</span>
                <div className="text-right">
                  <div className="font-bold text-primary">{device.clicks.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{device.conversionRate}% conv</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-border/20">
          <h2 className="text-2xl font-black text-primary">Campaign Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left p-6 font-black text-foreground">Campaign</th>
                <th className="text-left p-6 font-black text-foreground">Clicks</th>
                <th className="text-left p-6 font-black text-foreground">Leads</th>
                <th className="text-left p-6 font-black text-foreground">Revenue</th>
                <th className="text-left p-6 font-black text-foreground">Quality</th>
                <th className="text-left p-6 font-black text-foreground">Fraud Rate</th>
                <th className="text-left p-6 font-black text-foreground">Conv Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.campaignData.map((campaign) => (
                <tr key={campaign.campaign} className="border-b border-border/10 hover:bg-primary/5 transition-all duration-300">
                  <td className="p-6 font-semibold text-foreground">{campaign.campaign}</td>
                  <td className="p-6 text-foreground font-bold">{campaign.clicks.toLocaleString()}</td>
                  <td className="p-6 text-primary font-bold">{campaign.leads.toLocaleString()}</td>
                  <td className="p-6 text-primary font-bold">${campaign.revenue.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.qualityScore >= 80 ? 'bg-green-500/20 text-primary' :
                      campaign.qualityScore >= 60 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {campaign.qualityScore}%
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.fraudRate <= 5 ? 'bg-green-500/20 text-primary' :
                      campaign.fraudRate <= 15 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {campaign.fraudRate}%
                    </span>
                  </td>
                  <td className="p-6 font-bold text-foreground">
                    {campaign.clicks > 0 ? ((campaign.leads / campaign.clicks) * 100).toFixed(2) : '0.00'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly Activity Pattern */}
      <div className="premium-card p-8">
        <h2 className="text-2xl font-black text-primary mb-6">Hourly Activity Pattern</h2>
        <div className="grid grid-cols-12 gap-4">
          {data.hourlyData.map((hour) => {
            const maxActivity = Math.max(...data.hourlyData.map(h => h.clicks))
            const height = maxActivity > 0 ? Math.max((hour.clicks / maxActivity) * 100, 5) : 5

            return (
              <div key={hour.hour} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div
                    className="w-8 bg-gradient-to-t from-primary to-primary/80 rounded-t-xl shadow-lg transition-all duration-500"
                    style={{ height: `${height}%` }}
                    title={`${hour.hour}:00 - ${hour.clicks} clicks, ${hour.leads} leads`}
                  />
                </div>
                <div className="text-xs text-muted-foreground font-bold">{hour.hour}:00</div>
                <div className="text-xs text-primary font-semibold">{hour.clicks}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}