import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get basic counts
    const [totalUsers, totalLeads, totalClicks, totalEvents] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.click.count(),
      prisma.event.count()
    ])

    // Get total revenue
    const revenueResult = await prisma.user.aggregate({
      _sum: {
        totalRevenue: true
      }
    })

    const totalRevenue = Number(revenueResult._sum.totalRevenue || 0)

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        masterEmail: true,
        masterPhone: true,
        firstName: true,
        lastName: true,
        country: true,
        city: true,
        createdAt: true,
      }
    })

    // Get recent leads (last 10)
    const recentLeads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        campaign: true,
        qualityScore: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      totalUsers,
      totalLeads,
      totalClicks,
      totalEvents,
      totalRevenue,
      recentUsers,
      recentLeads
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    }, { status: 500 })
  }
}