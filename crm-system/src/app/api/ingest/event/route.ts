import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/lib/user-service'

const eventSchema = z.object({
  // Event details
  eventType: z.string(),
  eventName: z.string().optional(),
  category: z.string().optional(),

  // Event data
  properties: z.record(z.any()).optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  quantity: z.number().optional(),

  // User identification (at least one required)
  email: z.string().email().optional(),
  phone: z.string().optional(),
  clickId: z.string().optional(),
  deviceId: z.string().optional(),
  sessionId: z.string().optional(),
  fingerprint: z.string().optional(),

  // Attribution
  campaign: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),

  // Technical context
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  pageUrl: z.string().optional(),

  // Client/Brand
  clientId: z.string().optional(),
  brandId: z.string().optional(),

  // Status flags
  isConverted: z.boolean().optional(),
  isRevenue: z.boolean().optional(),
  isFraud: z.boolean().optional(),

  // Timing
  eventTime: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    // Validate at least one user identifier
    if (!validatedData.email && !validatedData.phone && !validatedData.clickId &&
        !validatedData.deviceId && !validatedData.sessionId && !validatedData.fingerprint) {
      return NextResponse.json({
        success: false,
        error: 'At least one user identifier is required'
      }, { status: 400 })
    }

    // Find or create user
    const user = await UserService.findOrCreateUser({
      email: validatedData.email,
      phone: validatedData.phone,
      clickId: validatedData.clickId,
      deviceId: validatedData.deviceId,
      sessionId: validatedData.sessionId,
      fingerprint: validatedData.fingerprint,
      ip: validatedData.ip,
      userAgent: validatedData.userAgent,
    })

    if (!user) {
      throw new Error('Failed to create or find user')
    }

    // Determine if this is a revenue event
    const isRevenue = validatedData.isRevenue ||
      (validatedData.value && validatedData.value > 0) ||
      ['deposit', 'purchase', 'payment', 'sale'].includes(validatedData.eventType.toLowerCase())

    // Determine if this is a conversion event
    const isConverted = validatedData.isConverted ||
      isRevenue ||
      ['signup', 'register', 'subscribe', 'conversion'].includes(validatedData.eventType.toLowerCase())

    // Create event record
    const eventData: any = {
      userId: user.id,
      eventType: validatedData.eventType,
      eventName: validatedData.eventName,
      category: validatedData.category,
      properties: validatedData.properties,
      value: validatedData.value,
      currency: validatedData.currency || 'USD',
      quantity: validatedData.quantity || 1,
      campaign: validatedData.campaign,
      source: validatedData.source,
      medium: validatedData.medium,
      ip: validatedData.ip,
      userAgent: validatedData.userAgent,
      referrer: validatedData.referrer,
      pageUrl: validatedData.pageUrl,
      clientId: validatedData.clientId,
      brandId: validatedData.brandId,
      isConverted,
      isRevenue,
      isFraud: validatedData.isFraud || false,
      eventTime: validatedData.eventTime ? new Date(validatedData.eventTime) : new Date(),
    }

    const event = await prisma.event.create({
      data: eventData
    })

    // Update user stats
    const updateData: any = {
      totalEvents: { increment: 1 },
      lastSeen: new Date()
    }

    if (isRevenue && validatedData.value && validatedData.value > 0) {
      updateData.totalRevenue = { increment: validatedData.value }
    }

    await prisma.customer.update({
      where: { id: user.id },
      data: updateData
    })

    // Update campaign stats if campaign is provided
    if (validatedData.campaign) {
      const updateCampaignData: any = {
        totalEvents: { increment: 1 }
      }

      if (isRevenue && validatedData.value && validatedData.value > 0) {
        updateCampaignData.totalRevenue = { increment: validatedData.value }
      }

      await prisma.campaign.upsert({
        where: { slug: validatedData.campaign },
        update: updateCampaignData,
        create: {
          name: validatedData.campaign,
          slug: validatedData.campaign,
          clientId: validatedData.clientId,
          totalEvents: 1,
          totalRevenue: (isRevenue && validatedData.value) ? validatedData.value : 0,
        }
      })
    }

    return NextResponse.json({
      success: true,
      eventId: event.id,
      userId: user.id,
      isConverted,
      isRevenue,
      message: 'Event tracked successfully'
    })

  } catch (error) {
    console.error('Event tracking error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Event Tracking',
    method: 'POST',
    description: 'Track user events with conversion and revenue attribution'
  })
}