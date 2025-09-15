import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const campaign = searchParams.get('campaign') || undefined
    const source = searchParams.get('source') || undefined
    const country = searchParams.get('country') || undefined
    const type = searchParams.get('type') || 'overview'

    if (type === 'cohort') {
      const cohortData = await AnalyticsService.getCohortAnalysis(days)
      return NextResponse.json({
        success: true,
        type: 'cohort',
        data: cohortData
      })
    }

    if (type === 'funnel') {
      const funnelData = await AnalyticsService.getFunnelAnalysis(campaign)
      return NextResponse.json({
        success: true,
        type: 'funnel',
        data: funnelData
      })
    }

    // Default overview analytics
    const analytics = await AnalyticsService.getAdvancedAnalytics(days, campaign, source, country)

    return NextResponse.json({
      success: true,
      type: 'overview',
      data: analytics,
      filters: { days, campaign, source, country }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 })
  }
}