import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    if (includeStats) {
      // Get campaigns with detailed analytics
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
      })

      // Calculate stats for each campaign
      const campaignsWithStats = await Promise.all(
        campaigns.map(async (campaign) => {
          const [clickStats, leadStats, eventStats] = await Promise.all([
            // Clicks
            prisma.click.aggregate({
              where: { campaign: campaign.slug },
              _count: true
            }),
            // Leads
            prisma.lead.aggregate({
              where: { campaign: campaign.slug },
              _count: true,
              _sum: { value: true },
              _avg: { qualityScore: true }
            }),
            // Events
            prisma.event.aggregate({
              where: { campaign: campaign.slug },
              _count: true,
              _sum: { value: true }
            })
          ])

          // Get unique customers for this campaign
          const uniqueCustomers = await prisma.customer.count({
            where: {
              OR: [
                { clicks: { some: { campaign: campaign.slug } } },
                { leads: { some: { campaign: campaign.slug } } },
                { events: { some: { campaign: campaign.slug } } }
              ]
            }
          })

          // Get duplicates
          const duplicateLeads = await prisma.lead.count({
            where: {
              campaign: campaign.slug,
              isDuplicate: true
            }
          })

          // Get fraud flags
          const fraudClicks = await prisma.click.count({
            where: {
              campaign: campaign.slug,
              isFraud: true
            }
          })

          // Calculate rates
          const totalClicks = clickStats._count || 0
          const totalLeads = leadStats._count || 0
          const totalEvents = eventStats._count || 0

          const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0
          const duplicateRate = totalLeads > 0 ? (duplicateLeads / totalLeads) * 100 : 0
          const fraudRate = totalClicks > 0 ? (fraudClicks / totalClicks) * 100 : 0

          return {
            ...campaign,
            stats: {
              totalClicks,
              totalLeads,
              totalEvents,
              uniqueCustomers,
              duplicateLeads,
              fraudClicks,
              conversionRate: Math.round(conversionRate * 100) / 100,
              duplicateRate: Math.round(duplicateRate * 100) / 100,
              fraudRate: Math.round(fraudRate * 100) / 100,
              avgQualityScore: Math.round((leadStats._avg.qualityScore || 0) * 100) / 100,
              totalLeadValue: Number(leadStats._sum.value || 0),
              totalEventValue: Number(eventStats._sum.value || 0),
              totalRevenue: Number(leadStats._sum.value || 0) + Number(eventStats._sum.value || 0)
            }
          }
        })
      )

      return NextResponse.json({
        success: true,
        campaigns: campaignsWithStats
      })
    } else {
      // Get basic campaign list
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        campaigns
      })
    }

  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch campaigns'
    }, { status: 500 })
  }
}