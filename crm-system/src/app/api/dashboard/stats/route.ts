import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get basic counts
    const [totalCustomers, totalLeads, totalClicks, totalEvents] = await Promise.all([
      prisma.customer.count(),
      prisma.lead.count(),
      prisma.click.count(),
      prisma.event.count()
    ])

    // Get total revenue
    const revenueResult = await prisma.customer.aggregate({
      _sum: {
        totalRevenue: true
      }
    })

    const totalRevenue = Number(revenueResult._sum.totalRevenue || 0)

    // Get recent customers (last 10)
    const recentCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        masterEmail: true,
        masterPhone: true,
        firstName: true,
        lastName: true,
        company: true,
        source: true,
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
      totalUsers: totalCustomers, // Keep backward compatibility for now
      totalCustomers,
      totalLeads,
      totalClicks,
      totalEvents,
      totalRevenue,
      recentUsers: recentCustomers, // Keep backward compatibility for now
      recentCustomers,
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