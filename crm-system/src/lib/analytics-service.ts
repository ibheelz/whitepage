import { prisma } from './prisma'

export interface AnalyticsData {
  timeSeries: {
    date: string
    clicks: number
    leads: number
    events: number
    revenue: number
    conversions: number
  }[]
  geoData: {
    country: string
    clicks: number
    leads: number
    revenue: number
  }[]
  sourceData: {
    source: string
    clicks: number
    leads: number
    conversionRate: number
    revenue: number
  }[]
  campaignData: {
    campaign: string
    clicks: number
    leads: number
    revenue: number
    qualityScore: number
    fraudRate: number
  }[]
  deviceData: {
    device: string
    clicks: number
    leads: number
    conversionRate: number
  }[]
  hourlyData: {
    hour: number
    clicks: number
    leads: number
    events: number
  }[]
}

export class AnalyticsService {
  static async getAdvancedAnalytics(
    days = 30,
    campaign?: string,
    source?: string,
    country?: string
  ): Promise<AnalyticsData> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build base filters
    const whereClause: any = {
      createdAt: { gte: startDate }
    }

    if (campaign) whereClause.campaign = campaign
    if (source) whereClause.source = source
    if (country) whereClause.country = country

    // Get time series data
    const timeSeries = await this.getTimeSeriesData(startDate, whereClause)

    // Get geographical data
    const geoData = await this.getGeoData(whereClause)

    // Get source performance data
    const sourceData = await this.getSourceData(whereClause)

    // Get campaign performance data
    const campaignData = await this.getCampaignData(whereClause)

    // Get device data
    const deviceData = await this.getDeviceData(whereClause)

    // Get hourly patterns
    const hourlyData = await this.getHourlyData(whereClause)

    return {
      timeSeries,
      geoData,
      sourceData,
      campaignData,
      deviceData,
      hourlyData
    }
  }

  private static async getTimeSeriesData(startDate: Date, whereClause: any) {
    const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const timeSeries = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayFilter = {
        ...whereClause,
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }

      const [clicksCount, leadsCount, eventsData] = await Promise.all([
        prisma.click.count({ where: dayFilter }),
        prisma.lead.count({ where: dayFilter }),
        prisma.event.aggregate({
          where: dayFilter,
          _count: true,
          _sum: { value: true }
        })
      ])

      // Count conversions (events that are marked as converted)
      const conversions = await prisma.event.count({
        where: { ...dayFilter, isConverted: true }
      })

      timeSeries.push({
        date: date.toISOString().split('T')[0],
        clicks: clicksCount,
        leads: leadsCount,
        events: eventsData._count || 0,
        revenue: Number(eventsData._sum.value || 0),
        conversions
      })
    }

    return timeSeries
  }

  private static async getGeoData(whereClause: any) {
    const geoClicksRaw = await prisma.$queryRaw<Array<{
      country: string
      clicks: bigint
    }>>`
      SELECT country, COUNT(*) as clicks
      FROM clicks
      WHERE country IS NOT NULL
        AND created_at >= ${whereClause.createdAt.gte}
        ${whereClause.campaign ? `AND campaign = ${whereClause.campaign}` : ''}
      GROUP BY country
      ORDER BY clicks DESC
      LIMIT 20
    `

    const geoLeadsRaw = await prisma.$queryRaw<Array<{
      country: string
      leads: bigint
      revenue: number
    }>>`
      SELECT country, COUNT(*) as leads, SUM(COALESCE(value, 0)) as revenue
      FROM leads
      WHERE country IS NOT NULL
        AND created_at >= ${whereClause.createdAt.gte}
        ${whereClause.campaign ? `AND campaign = ${whereClause.campaign}` : ''}
      GROUP BY country
    `

    // Combine clicks and leads data
    const geoMap = new Map()

    geoClicksRaw.forEach(item => {
      geoMap.set(item.country, {
        country: item.country,
        clicks: Number(item.clicks),
        leads: 0,
        revenue: 0
      })
    })

    geoLeadsRaw.forEach(item => {
      const existing = geoMap.get(item.country) || { country: item.country, clicks: 0, leads: 0, revenue: 0 }
      geoMap.set(item.country, {
        ...existing,
        leads: Number(item.leads),
        revenue: Number(item.revenue || 0)
      })
    })

    return Array.from(geoMap.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 15)
  }

  private static async getSourceData(whereClause: any) {
    const sourceStatsRaw = await prisma.$queryRaw<Array<{
      source: string
      clicks: bigint
      leads: bigint
      revenue: number
    }>>`
      SELECT
        COALESCE(c.source, l.source, 'unknown') as source,
        COUNT(DISTINCT c.id) as clicks,
        COUNT(DISTINCT l.id) as leads,
        SUM(COALESCE(l.value, 0)) as revenue
      FROM clicks c
      FULL OUTER JOIN leads l ON c.source = l.source
      WHERE (c.created_at >= ${whereClause.createdAt.gte} OR l.created_at >= ${whereClause.createdAt.gte})
        AND COALESCE(c.source, l.source) IS NOT NULL
      GROUP BY COALESCE(c.source, l.source)
      ORDER BY clicks DESC
      LIMIT 15
    `

    return sourceStatsRaw.map(item => ({
      source: item.source,
      clicks: Number(item.clicks),
      leads: Number(item.leads),
      conversionRate: Number(item.clicks) > 0 ? Math.round((Number(item.leads) / Number(item.clicks)) * 10000) / 100 : 0,
      revenue: Number(item.revenue || 0)
    }))
  }

  private static async getCampaignData(whereClause: any) {
    const campaignStatsRaw = await prisma.$queryRaw<Array<{
      campaign: string
      clicks: bigint
      leads: bigint
      revenue: number
      avg_quality: number
      fraud_clicks: bigint
    }>>`
      SELECT
        COALESCE(c.campaign, l.campaign, 'unknown') as campaign,
        COUNT(DISTINCT c.id) as clicks,
        COUNT(DISTINCT l.id) as leads,
        SUM(COALESCE(l.value, 0)) as revenue,
        AVG(COALESCE(l.quality_score, 0)) as avg_quality,
        COUNT(DISTINCT CASE WHEN c.is_fraud = true THEN c.id END) as fraud_clicks
      FROM clicks c
      FULL OUTER JOIN leads l ON c.campaign = l.campaign
      WHERE (c.created_at >= ${whereClause.createdAt.gte} OR l.created_at >= ${whereClause.createdAt.gte})
        AND COALESCE(c.campaign, l.campaign) IS NOT NULL
      GROUP BY COALESCE(c.campaign, l.campaign)
      ORDER BY clicks DESC
      LIMIT 10
    `

    return campaignStatsRaw.map(item => ({
      campaign: item.campaign,
      clicks: Number(item.clicks),
      leads: Number(item.leads),
      revenue: Number(item.revenue || 0),
      qualityScore: Math.round(Number(item.avg_quality || 0) * 100) / 100,
      fraudRate: Number(item.clicks) > 0 ? Math.round((Number(item.fraud_clicks) / Number(item.clicks)) * 10000) / 100 : 0
    }))
  }

  private static async getDeviceData(whereClause: any) {
    const deviceStatsRaw = await prisma.$queryRaw<Array<{
      device: string
      clicks: bigint
      leads: bigint
    }>>`
      SELECT
        CASE
          WHEN c.is_mobile = true THEN 'Mobile'
          WHEN c.is_tablet = true THEN 'Tablet'
          WHEN c.is_desktop = true THEN 'Desktop'
          ELSE 'Unknown'
        END as device,
        COUNT(c.id) as clicks,
        COUNT(l.id) as leads
      FROM clicks c
      LEFT JOIN leads l ON c.ip = l.ip AND DATE(c.created_at) = DATE(l.created_at)
      WHERE c.created_at >= ${whereClause.createdAt.gte}
      GROUP BY
        CASE
          WHEN c.is_mobile = true THEN 'Mobile'
          WHEN c.is_tablet = true THEN 'Tablet'
          WHEN c.is_desktop = true THEN 'Desktop'
          ELSE 'Unknown'
        END
      ORDER BY clicks DESC
    `

    return deviceStatsRaw.map(item => ({
      device: item.device,
      clicks: Number(item.clicks),
      leads: Number(item.leads),
      conversionRate: Number(item.clicks) > 0 ? Math.round((Number(item.leads) / Number(item.clicks)) * 10000) / 100 : 0
    }))
  }

  private static async getHourlyData(whereClause: any) {
    const hourlyStatsRaw = await prisma.$queryRaw<Array<{
      hour: number
      clicks: bigint
      leads: bigint
      events: bigint
    }>>`
      SELECT
        EXTRACT(hour FROM c.created_at) as hour,
        COUNT(c.id) as clicks,
        COUNT(l.id) as leads,
        COUNT(e.id) as events
      FROM clicks c
      LEFT JOIN leads l ON EXTRACT(hour FROM c.created_at) = EXTRACT(hour FROM l.created_at)
      LEFT JOIN events e ON EXTRACT(hour FROM c.created_at) = EXTRACT(hour FROM e.created_at)
      WHERE c.created_at >= ${whereClause.createdAt.gte}
      GROUP BY EXTRACT(hour FROM c.created_at)
      ORDER BY hour
    `

    // Fill in all 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      clicks: 0,
      leads: 0,
      events: 0
    }))

    hourlyStatsRaw.forEach(item => {
      const hour = Number(item.hour)
      if (hour >= 0 && hour <= 23) {
        hourlyData[hour] = {
          hour,
          clicks: Number(item.clicks),
          leads: Number(item.leads),
          events: Number(item.events)
        }
      }
    })

    return hourlyData
  }

  static async getCohortAnalysis(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const cohortData = await prisma.$queryRaw<Array<{
      cohort_date: string
      users_count: bigint
      retention_day_1: bigint
      retention_day_7: bigint
      retention_day_30: bigint
    }>>`
      WITH cohorts AS (
        SELECT
          DATE(created_at) as cohort_date,
          user_id,
          created_at as first_activity
        FROM leads
        WHERE created_at >= ${startDate}
      ),
      retention AS (
        SELECT
          c.cohort_date,
          c.user_id,
          MIN(e.created_at) as first_return
        FROM cohorts c
        LEFT JOIN events e ON c.user_id = e.user_id
          AND e.created_at > c.first_activity
          AND e.created_at <= c.first_activity + INTERVAL '30 days'
        GROUP BY c.cohort_date, c.user_id
      )
      SELECT
        cohort_date::text,
        COUNT(DISTINCT r.user_id) as users_count,
        COUNT(DISTINCT CASE WHEN first_return <= cohort_date::date + INTERVAL '1 day' THEN r.user_id END) as retention_day_1,
        COUNT(DISTINCT CASE WHEN first_return <= cohort_date::date + INTERVAL '7 days' THEN r.user_id END) as retention_day_7,
        COUNT(DISTINCT CASE WHEN first_return <= cohort_date::date + INTERVAL '30 days' THEN r.user_id END) as retention_day_30
      FROM retention r
      GROUP BY cohort_date
      ORDER BY cohort_date DESC
      LIMIT 30
    `

    return cohortData.map(item => ({
      cohortDate: item.cohort_date,
      usersCount: Number(item.users_count),
      retentionDay1: Number(item.retention_day_1),
      retentionDay7: Number(item.retention_day_7),
      retentionDay30: Number(item.retention_day_30),
      retentionDay1Rate: Number(item.users_count) > 0 ? Math.round((Number(item.retention_day_1) / Number(item.users_count)) * 10000) / 100 : 0,
      retentionDay7Rate: Number(item.users_count) > 0 ? Math.round((Number(item.retention_day_7) / Number(item.users_count)) * 10000) / 100 : 0,
      retentionDay30Rate: Number(item.users_count) > 0 ? Math.round((Number(item.retention_day_30) / Number(item.users_count)) * 10000) / 100 : 0,
    }))
  }

  static async getFunnelAnalysis(campaign?: string) {
    const whereClause = campaign ? { campaign } : {}

    const [
      totalClicks,
      totalLeads,
      totalSignups,
      totalDeposits,
      totalPurchases
    ] = await Promise.all([
      prisma.click.count({ where: whereClause }),
      prisma.lead.count({ where: whereClause }),
      prisma.event.count({ where: { ...whereClause, eventType: 'signup' } }),
      prisma.event.count({ where: { ...whereClause, eventType: 'deposit' } }),
      prisma.event.count({ where: { ...whereClause, eventType: 'purchase' } })
    ])

    return {
      steps: [
        { name: 'Clicks', count: totalClicks, rate: 100 },
        {
          name: 'Leads',
          count: totalLeads,
          rate: totalClicks > 0 ? Math.round((totalLeads / totalClicks) * 10000) / 100 : 0
        },
        {
          name: 'Signups',
          count: totalSignups,
          rate: totalLeads > 0 ? Math.round((totalSignups / totalLeads) * 10000) / 100 : 0
        },
        {
          name: 'Deposits',
          count: totalDeposits,
          rate: totalSignups > 0 ? Math.round((totalDeposits / totalSignups) * 10000) / 100 : 0
        },
        {
          name: 'Purchases',
          count: totalPurchases,
          rate: totalDeposits > 0 ? Math.round((totalPurchases / totalDeposits) * 10000) / 100 : 0
        }
      ]
    }
  }
}