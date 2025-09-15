import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const leadsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  campaign: z.string().optional(),
  source: z.string().optional(),
  country: z.string().optional(),
  isDuplicate: z.string().optional(),
  qualityScore: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = leadsQuerySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(params.page)
    const limit = parseInt(params.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (params.campaign) {
      where.campaign = { contains: params.campaign, mode: 'insensitive' }
    }

    if (params.source) {
      where.source = { contains: params.source, mode: 'insensitive' }
    }

    if (params.country) {
      where.country = params.country
    }

    if (params.isDuplicate) {
      where.isDuplicate = params.isDuplicate === 'true'
    }

    if (params.qualityScore) {
      const score = parseInt(params.qualityScore)
      where.qualityScore = { gte: score }
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {}
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom)
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo)
      }
    }

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    // Get leads with user data
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              masterEmail: true,
              masterPhone: true,
              firstName: true,
              lastName: true,
              totalRevenue: true,
              _count: {
                select: {
                  clicks: true,
                  events: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where })
    ])

    // Get filter options
    const [campaigns, sources, countries] = await Promise.all([
      prisma.lead.findMany({
        where: { campaign: { not: null } },
        select: { campaign: true },
        distinct: ['campaign'],
        orderBy: { campaign: 'asc' }
      }),
      prisma.lead.findMany({
        where: { source: { not: null } },
        select: { source: true },
        distinct: ['source'],
        orderBy: { source: 'asc' }
      }),
      prisma.lead.findMany({
        where: { country: { not: null } },
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' }
      })
    ])

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        campaigns: campaigns.map(c => c.campaign).filter(Boolean),
        sources: sources.map(s => s.source).filter(Boolean),
        countries: countries.map(c => c.country).filter(Boolean)
      }
    })

  } catch (error) {
    console.error('Get leads error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leads'
    }, { status: 500 })
  }
}