import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/lib/user-service'

const leadSchema = z.object({
  // Required fields
  email: z.string().email().optional(),
  phone: z.string().optional(),
  ip: z.string(),

  // Personal data
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  // Custom fields (flexible)
  customFields: z.record(z.any()).optional(),

  // Attribution
  clickId: z.string().optional(),
  campaign: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),

  // Technical
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
  formUrl: z.string().optional(),

  // Geographic
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),

  // Client/Brand
  clientId: z.string().optional(),
  brandId: z.string().optional(),

  // Value
  value: z.number().optional(),
  currency: z.string().optional(),

  // Additional identifiers
  deviceId: z.string().optional(),
  sessionId: z.string().optional(),
  fingerprint: z.string().optional(),

  // Timing
  submittedAt: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = leadSchema.parse(body)

    // Validate at least one identifier
    if (!validatedData.email && !validatedData.phone && !validatedData.clickId && !validatedData.deviceId) {
      return NextResponse.json({
        success: false,
        error: 'At least one identifier (email, phone, clickId, or deviceId) is required'
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
    }, {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      country: validatedData.country,
      region: validatedData.region,
      city: validatedData.city,
    })

    if (!user) {
      throw new Error('Failed to create or find user')
    }

    // Check for duplicate leads
    const existingLead = await prisma.lead.findFirst({
      where: {
        userId: user.id,
        OR: [
          validatedData.email ? { email: validatedData.email } : {},
          validatedData.phone ? { phone: validatedData.phone } : {},
        ].filter(condition => Object.keys(condition).length > 0),
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // within last 24 hours
        }
      }
    })

    const isDuplicate = !!existingLead

    // Basic email validation
    const isEmailValid = validatedData.email ?
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validatedData.email) : false

    // Basic phone validation
    const isPhoneValid = validatedData.phone ?
      /^\+?[\d\s\-\(\)]{10,}$/.test(validatedData.phone) : false

    // Quality score calculation (0-100)
    let qualityScore = 0
    if (validatedData.email && isEmailValid) qualityScore += 30
    if (validatedData.phone && isPhoneValid) qualityScore += 30
    if (validatedData.firstName) qualityScore += 15
    if (validatedData.lastName) qualityScore += 15
    if (!isDuplicate) qualityScore += 10

    // Create lead record
    const leadData: any = {
      userId: user.id,
      email: validatedData.email,
      phone: validatedData.phone,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      customFields: validatedData.customFields,
      clickId: validatedData.clickId,
      campaign: validatedData.campaign,
      source: validatedData.source,
      medium: validatedData.medium,
      ip: validatedData.ip,
      userAgent: validatedData.userAgent,
      referrer: validatedData.referrer,
      landingPage: validatedData.landingPage,
      formUrl: validatedData.formUrl,
      country: validatedData.country,
      region: validatedData.region,
      city: validatedData.city,
      isEmailValid,
      isPhoneValid,
      isDuplicate,
      qualityScore,
      clientId: validatedData.clientId,
      brandId: validatedData.brandId,
      value: validatedData.value,
      currency: validatedData.currency || 'USD',
      submittedAt: validatedData.submittedAt ? new Date(validatedData.submittedAt) : new Date(),
    }

    const lead = await prisma.lead.create({
      data: leadData
    })

    // Update user lead count and revenue
    const updateData: any = {
      totalLeads: { increment: 1 },
      lastSeen: new Date()
    }

    if (validatedData.value && validatedData.value > 0) {
      updateData.totalRevenue = { increment: validatedData.value }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    // Update campaign stats if campaign is provided
    if (validatedData.campaign) {
      await prisma.campaign.upsert({
        where: { slug: validatedData.campaign },
        update: {
          totalLeads: { increment: 1 },
          totalRevenue: validatedData.value ? { increment: validatedData.value } : undefined,
        },
        create: {
          name: validatedData.campaign,
          slug: validatedData.campaign,
          clientId: validatedData.clientId,
          totalLeads: 1,
          totalRevenue: validatedData.value || 0,
        }
      })
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      userId: user.id,
      isDuplicate,
      qualityScore,
      message: 'Lead captured successfully'
    })

  } catch (error) {
    console.error('Lead capture error:', error)

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
    endpoint: 'Lead Capture',
    method: 'POST',
    description: 'Capture leads with deduplication and quality scoring'
  })
}