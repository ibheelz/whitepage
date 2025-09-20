'use client'

import { useEffect, useState } from 'react'
import { RefreshIcon, ExportIcon, AlertIcon, EmailIcon, PhoneIcon, ShieldIcon, BotIcon, FlashIcon, DuplicateIcon, WarningIcon, CheckIcon, BlockIcon, AnalyticsIcon, SettingsIcon } from '@/components/ui/icons'

interface FraudAlert {
  id: string
  type: 'IP_SPAM' | 'EMAIL_SPAM' | 'PHONE_SPAM' | 'VPN_DETECTED' | 'BOT_DETECTED' | 'RAPID_FIRE' | 'DUPLICATE_BURST'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  data: any
  affectedEntities: string[]
  createdAt: string
  resolved: boolean
}

interface FraudStats {
  totalClicks: number
  totalLeads: number
  fraudClicks: number
  botClicks: number
  vpnClicks: number
  duplicateLeads: number
  flaggedUsers: number
  fraudClickRate: number
  botClickRate: number
  vpnClickRate: number
  duplicateLeadRate: number
}

export default function FraudMonitorPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [stats, setStats] = useState<FraudStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFraudData()
  }, [])

  const fetchFraudData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [alertsResponse, statsResponse] = await Promise.all([
        fetch('/api/fraud/alerts'),
        fetch('/api/fraud/stats?days=7')
      ])

      const alertsData = await alertsResponse.json()
      const statsData = await statsResponse.json()

      if (alertsData.success && statsData.success) {
        setAlerts(alertsData.alerts)
        setStats(statsData.stats)
      } else {
        setError('Failed to load fraud monitoring data')
      }
    } catch (err) {
      setError('Failed to fetch fraud data')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-primary border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-blue-100 text-foreground border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 24 }
    switch (type) {
      case 'IP_SPAM': return <AlertIcon {...iconProps} />
      case 'EMAIL_SPAM': return <EmailIcon {...iconProps} />
      case 'PHONE_SPAM': return <PhoneIcon {...iconProps} />
      case 'VPN_DETECTED': return <ShieldIcon {...iconProps} />
      case 'BOT_DETECTED': return <BotIcon {...iconProps} />
      case 'RAPID_FIRE': return <FlashIcon {...iconProps} />
      case 'DUPLICATE_BURST': return <DuplicateIcon {...iconProps} />
      default: return <WarningIcon {...iconProps} />
    }
  }

  const getRateColor = (rate: number) => {
    if (rate <= 5) return 'text-primary'
    if (rate <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-primary">
              Fraud Monitor
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              Advanced security monitoring and fraud protection system
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  if (error) {
    return (
      <div className="space-y-8">
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6">
            <WarningIcon size={32} />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Fraud System Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={fetchFraudData} className="premium-button-primary">
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length
  const threatLevel = criticalAlerts > 0 ? 'high' : highAlerts > 0 ? 'medium' : 'low'

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">Fraud Monitor</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Advanced security monitoring and fraud protection system</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
            threatLevel === 'high' ? 'bg-red-500/20' :
            threatLevel === 'medium' ? 'bg-yellow-500/20' :
            'bg-green-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              threatLevel === 'high' ? 'bg-red-500' :
              threatLevel === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            <span className={`font-bold text-sm uppercase ${
              threatLevel === 'high' ? 'text-red-500' :
              threatLevel === 'medium' ? 'text-yellow-500' :
              'text-primary'
            }`}>
              {threatLevel} Risk
            </span>
          </div>
          <button onClick={fetchFraudData} className="premium-button-secondary">
            <RefreshIcon size={16} className="mr-2" />
            Refresh
          </button>
          <button className="premium-button-primary">
            <ExportIcon size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`premium-card p-6 text-center ${criticalAlerts > 0 ? 'border-red-500/30' : ''}`}>
          <div className={`text-3xl font-black mb-2 ${criticalAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {criticalAlerts}
          </div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Critical Alerts
          </div>
        </div>
        <div className={`premium-card p-6 text-center ${highAlerts > 0 ? 'border-orange-500/30' : ''}`}>
          <div className={`text-3xl font-black mb-2 ${highAlerts > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {highAlerts}
          </div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            High Priority
          </div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-primary mb-2">{alerts.length}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Total Alerts
          </div>
        </div>
        <div className="premium-card p-6 text-center">
          <div className="text-3xl font-black text-foreground mb-2">{stats?.flaggedUsers || 0}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Flagged Users
          </div>
        </div>
      </div>

      {/* Fraud Statistics */}
      {stats && (
        <div className="premium-card p-8">
          <h2 className="text-2xl font-black text-foreground mb-6">Fraud Statistics (Last 7 Days)</h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="text-center p-4 bg-muted/10 rounded-2xl">
              <div className="text-xl font-black text-foreground mb-1">
                {stats.totalClicks.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Total Clicks</div>
            </div>
            <div className="text-center p-4 bg-muted/10 rounded-2xl">
              <div className="text-xl font-black text-primary mb-1">
                {stats.totalLeads.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Total Leads</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-2xl">
              <div className={`text-xl font-black mb-1 ${getRateColor(stats.fraudClickRate)}`}>
                {stats.fraudClickRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Fraud Rate</div>
              <div className="text-xs text-muted-foreground">{stats.fraudClicks} clicks</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 rounded-2xl">
              <div className={`text-xl font-black mb-1 ${getRateColor(stats.duplicateLeadRate)}`}>
                {stats.duplicateLeadRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Duplicate Rate</div>
              <div className="text-xs text-muted-foreground">{stats.duplicateLeads} leads</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-2xl">
              <div className={`text-xl font-black mb-1 ${getRateColor(stats.botClickRate)}`}>
                {stats.botClickRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Bot Rate</div>
              <div className="text-xs text-muted-foreground">{stats.botClicks} clicks</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-2xl">
              <div className={`text-xl font-black mb-1 ${getRateColor(stats.vpnClickRate)}`}>
                {stats.vpnClickRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase">VPN Rate</div>
              <div className="text-xs text-muted-foreground">{stats.vpnClicks} clicks</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="premium-card p-8">
        <h2 className="text-2xl font-black text-foreground mb-8 flex items-center">
          <AlertIcon size={24} className="mr-3" />
          Active Fraud Alerts
        </h2>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6">
              <CheckIcon size={32} />
            </div>
            <h3 className="text-xl font-black text-primary mb-2">No Active Fraud Alerts</h3>
            <p className="text-muted-foreground">System is operating normally with no security threats detected</p>
          </div>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="premium-card p-6 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-black text-foreground">{alert.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{alert.description}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div><strong>Type:</strong> {alert.type.replace('_', ' ')}</div>
                        <div><strong>Detected:</strong> {new Date(alert.createdAt).toLocaleString()}</div>
                        {alert.affectedEntities.length > 0 && (
                          <div><strong>Affected:</strong> {alert.affectedEntities.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="premium-button-secondary px-4 py-2 text-xs">
                      Investigate
                    </button>
                    <button className="premium-button-primary px-4 py-2 text-xs">
                      Resolve
                    </button>
                  </div>
                </div>
                {alert.data && (
                  <div className="mt-4 p-4 bg-muted/10 rounded-xl border border-border/20">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Alert Details
                    </div>
                    <pre className="text-xs text-muted-foreground overflow-x-auto font-mono">
                      {JSON.stringify(alert.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="premium-card p-8 transition-all duration-300 text-left">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              <BlockIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-foreground mb-2">Block IP Range</h4>
              <p className="text-sm text-muted-foreground">Prevent access from suspicious IP addresses and ranges</p>
            </div>
          </div>
        </button>
        <button className="premium-card p-8 transition-all duration-300 text-left">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              <AnalyticsIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-foreground mb-2">Generate Report</h4>
              <p className="text-sm text-muted-foreground">Create comprehensive fraud analysis and security reports</p>
            </div>
          </div>
        </button>
        <button className="premium-card p-8 transition-all duration-300 text-left">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-foreground mb-2">Configure Rules</h4>
              <p className="text-sm text-muted-foreground">Adjust fraud detection settings and protection rules</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}