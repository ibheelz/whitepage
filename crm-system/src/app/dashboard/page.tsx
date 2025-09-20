'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  WarningIcon,
  AnalyticsIcon,
  UsersIcon,
  ClicksIcon,
  EventsIcon,
  CheckIcon,
  UserIcon,
  CalendarIcon
} from '@/components/ui/icons'

interface DashboardStats {
  totalUsers: number
  totalLeads: number
  totalClicks: number
  totalEvents: number
  totalRevenue: number
  recentUsers: any[]
  recentLeads: any[]
}

// Mouse tracking hook for glass effect
const useMouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 50, y: 50 })
  }

  return { mousePosition, elementRef, handleMouseMove, handleMouseLeave }
}

// Interactive glass card component
const InteractiveCard: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  const { mousePosition, elementRef, handleMouseMove, handleMouseLeave } = useMouseTracker()

  return (
    <div
      ref={elementRef}
      className={`premium-card relative overflow-hidden cursor-pointer transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Moving glass highlight */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(253, 198, 0, 0.15) 0%, rgba(253, 198, 0, 0.05) 40%, transparent 70%)`
        }}
      />

      {/* Glass refraction overlay */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(${(mousePosition.x - 50) * 0.5 + 45}deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)`
        }}
      />

      {children}
    </div>
  )
}

// Enhanced chart components
const PieChart = ({ percentage, size = 60 }: { percentage: number, size?: number }) => {
  const radius = size / 2 - 4
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          fill="transparent"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FDC600"
          strokeWidth="4"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-bold text-primary">{percentage}%</div>
        </div>
      </div>
    </div>
  )
}

const HistogramChart = ({ data, height = 60 }: { data: number[], height?: number }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div style={{ height }} className="flex items-end justify-between px-2 w-full">
      {data.map((value, index) => {
        const barHeight = Math.max(((value - min) / range) * (height - 20) + 10, 8)
        const barWidth = Math.max((100 / data.length) - 1, 4)

        return (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer"
            style={{ width: `${barWidth}%` }}
            title={`$${value.toLocaleString()}`}
          >
            <div
              className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
              style={{
                height: `${barHeight}px`,
                background: `linear-gradient(180deg,
                  #FDC600 0%,
                  rgba(253, 198, 0, 0.95) 20%,
                  rgba(253, 198, 0, 0.85) 50%,
                  rgba(253, 198, 0, 0.75) 80%,
                  rgba(253, 198, 0, 0.65) 100%)`,
                border: '1px solid rgba(253, 198, 0, 0.3)'
              }}
            />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-primary font-bold mt-1">
              ${(value/1000).toFixed(0)}K
            </div>
          </div>
        )
      })}
    </div>
  )
}

const SparklineChart = ({ data, height = 30 }: { data: number[], height?: number }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = ((max - value) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 bg-muted/20 rounded-lg flex items-center justify-center">
            <WarningIcon size={16} />
          </div>
          <p className="text-sm text-muted-foreground mb-3">Failed to load</p>
          <button onClick={fetchDashboardStats} className="premium-button-primary text-xs px-3 py-1">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const chartData = [12, 19, 3, 17, 28, 24, 7, 34, 18, 25, 33, 29]
  const revenueData = [850, 920, 1100, 980, 1250, 1400, 1320, 1450, 1520, 1380, 1620, 1750]

  const realtimeActivities = [
    { type: 'user_signup', customer: 'John Doe', time: '2 minutes ago', value: '+$120' },
    { type: 'lead_converted', customer: 'Sarah Smith', time: '5 minutes ago', value: '+$450' },
    { type: 'click_event', customer: 'Mike Johnson', time: '8 minutes ago', value: '+1 click' },
    { type: 'revenue', customer: 'Emma Davis', time: '12 minutes ago', value: '+$230' },
    { type: 'user_signup', customer: 'Alex Brown', time: '15 minutes ago', value: '+$95' },
  ]

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 mb-2 xxs:mb-1 xs:mb-3 sm:mb-6">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Overview of your business metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 w-full">
        <Link href="/dashboard/customers">
          <InteractiveCard className="transition-all duration-300 w-full min-h-[140px] cursor-pointer group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-primary truncate group-hover:text-yellow-300 transition-colors">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-bold">Total Customers</div>
                <div className="text-xs text-green-500 font-semibold flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +12.5% this month
                </div>
                <div className="text-xs text-blue-400 font-medium mt-1">
                  Click to manage customers →
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0 group-hover:shadow-2xl transition-all duration-300">
                <UsersIcon size={18} className="text-black sm:w-[20px] sm:h-[20px]" />
              </div>
            </div>

            {/* Customer Breakdown */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-400">{Math.floor(stats.totalUsers * 0.78)}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">+{Math.floor(stats.totalUsers * 0.15)}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>
          </InteractiveCard>
        </Link>

        <InteractiveCard className="transition-all duration-300 w-full min-h-[120px]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary truncate">
                {stats.totalLeads.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Quality Leads</div>
              <div className="text-xs text-blue-400 font-semibold">+8.3% conversion</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <EventsIcon size={16} className="text-black sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
        </InteractiveCard>

        <InteractiveCard className="transition-all duration-300 w-full min-h-[120px]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary truncate">
                {stats.totalClicks.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Click Events</div>
              <div className="text-xs text-purple-400 font-semibold">+15.7% CTR</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <ClicksIcon size={16} className="text-black sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
        </InteractiveCard>

        <InteractiveCard className="transition-all duration-300 w-full min-h-[120px]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary truncate">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Monthly Revenue</div>
              <div className="text-xs text-emerald-400 font-semibold">+24.1% MoM</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <AnalyticsIcon size={16} className="text-black sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>
        </InteractiveCard>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 w-full">
        {/* Revenue Performance */}
        <InteractiveCard className="col-span-1 lg:col-span-2 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            <div className="lg:col-span-1 flex flex-col justify-center">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-primary mb-1">Revenue Performance</h3>
                <p className="text-xs text-muted-foreground">Monthly trends & insights</p>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-emerald-400 font-semibold">+24.1% growth</div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-2 bg-muted/10 rounded-lg">
                    <div className="text-sm font-bold text-primary">$52.3K</div>
                    <div className="text-xs text-muted-foreground">Avg Monthly</div>
                  </div>
                  <div className="text-center p-2 bg-muted/10 rounded-lg">
                    <div className="text-sm font-bold text-green-400">+18%</div>
                    <div className="text-xs text-muted-foreground">YoY Growth</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="h-28 lg:h-32 bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                <HistogramChart data={revenueData} height={88} />
              </div>
              <div className="mt-3 text-center">
                <div className="inline-flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span className="text-primary font-semibold">Jul</span>
                </div>
              </div>
            </div>
          </div>
        </InteractiveCard>

        {/* Key Metrics */}
        <InteractiveCard className="col-span-1 w-full">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-primary mb-2">Key Metrics</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Performance indicators</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary">Conversion Rate</div>
                <div className="text-xs text-muted-foreground">Users to leads</div>
              </div>
              <div className="flex-shrink-0 ml-3">
                <PieChart percentage={68} size={60} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary">Engagement</div>
                <div className="text-xs text-muted-foreground">User activity</div>
              </div>
              <div className="flex-shrink-0 ml-3">
                <PieChart percentage={84} size={60} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary">Retention</div>
                <div className="text-xs text-muted-foreground">30-day return</div>
              </div>
              <div className="flex-shrink-0 ml-3">
                <PieChart percentage={92} size={60} />
              </div>
            </div>

            <div className="pt-4 border-t border-border/20">
              <div className="text-sm font-medium text-primary mb-2">Activity Trend</div>
              <SparklineChart data={chartData.concat([31, 28, 35, 42])} height={40} />
            </div>
          </div>
        </InteractiveCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 w-full">
        {/* Mini Calendar */}
        <InteractiveCard className="col-span-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-primary">Calendar</h3>
            <CalendarIcon size={14} />
          </div>

          <div className="space-y-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-muted-foreground font-medium p-1">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1
                const isToday = day === new Date().getDate()
                return (
                  <div key={i} className={`p-1 rounded text-xs ${
                    isToday
                      ? 'bg-primary text-black font-bold'
                      : 'text-muted-foreground hover:bg-muted/20'
                  }`}>
                    {day}
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">3 meetings today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">5 leads follow-up</span>
              </div>
            </div>
          </div>
        </InteractiveCard>

        {/* Live Activity */}
        <InteractiveCard className="col-span-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-primary">Live Activity</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {realtimeActivities.map((activity, index) => {
              const getActivityIcon = (type: string) => {
                switch(type) {
                  case 'user_signup': return <UserIcon size={12} className="text-black" />
                  case 'lead_converted': return <ClicksIcon size={12} className="text-black" />
                  case 'click_event': return <AnalyticsIcon size={12} className="text-black" />
                  case 'revenue': return <AnalyticsIcon size={12} className="text-black" />
                  default: return <UserIcon size={12} className="text-black" />
                }
              }

              return (
                <div key={index} className="flex items-center space-x-3 p-2 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary truncate">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {activity.value}
                  </div>
                </div>
              )
            })}
          </div>
        </InteractiveCard>

        {/* Top Quality Leads */}
        <InteractiveCard className="col-span-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-primary">Top Quality Leads</h3>
            <Link href="/dashboard/leads" className="text-xs text-primary hover:text-primary/80">View all</Link>
          </div>

          <div className="space-y-3">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.slice(0, 4).map((lead: any, index) => {
                const qualityScore = lead.qualityScore || [95, 87, 92, 78][index] || 85
                const scoreColor = qualityScore >= 90 ? 'text-green-400' : qualityScore >= 80 ? 'text-primary' : 'text-orange-400'

                return (
                  <div key={lead.id} className="flex items-center space-x-3 p-3 bg-muted/5 rounded-lg hover:bg-muted/10 transition-all duration-200 group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform">
                      <UserIcon size={14} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {lead.firstName && lead.lastName ? `${lead.firstName} ${lead.lastName}` : lead.email || lead.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.campaign || ['Google Ads', 'Facebook', 'LinkedIn', 'Direct'][index % 4]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${scoreColor}`}>
                        {qualityScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Quality
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClicksIcon size={18} className="text-black" />
                </div>
                <p className="text-sm text-muted-foreground">No leads yet</p>
                <p className="text-xs text-muted-foreground">Start your first campaign</p>
              </div>
            )}
          </div>
        </InteractiveCard>
      </div>

      {/* System Status */}
      <InteractiveCard className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-primary">System Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-xs text-primary">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 w-full">
          {[
            { name: 'Database', uptime: '99.9%' },
            { name: 'API', uptime: '99.8%' },
            { name: 'Analytics', uptime: '99.7%' },
            { name: 'Security', uptime: '100%' },
          ].map((service) => (
            <div key={service.name} className="text-center premium-card p-2 sm:p-3 transition-all duration-300 w-full">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 bg-primary rounded-lg flex items-center justify-center">
                <CheckIcon size={10} className="text-black sm:w-3 sm:h-3" />
              </div>
              <p className="text-xs font-bold text-primary mb-1 truncate">{service.name}</p>
              <p className="text-xs text-primary font-medium">{service.uptime}</p>
              <div className="flex items-center justify-center mt-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs text-green-500 font-medium">Online</span>
              </div>
            </div>
          ))}
        </div>
      </InteractiveCard>
    </div>
  )
}