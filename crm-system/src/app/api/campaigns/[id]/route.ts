import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  clientId: z.string().optional(),
  brandId: z.string().optional(),
  conversionTypeIds: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PAUSED', 'DRAFT']).optional(),
  isActive: z.boolean().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateCampaignSchema.parse(body)
    const { conversionTypeIds, ...campaignData } = validatedData

    // Convert empty logoUrl to null
    if (campaignData.logoUrl === '') {
      campaignData.logoUrl = null
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: campaignData
    })

    // Update conversion type relationships if provided
    if (conversionTypeIds !== undefined) {
      // Remove existing relationships
      await prisma.campaignConversionType.deleteMany({
        where: { campaignId: campaign.id }
      })

      // Add new relationships
      if (conversionTypeIds.length > 0) {
        await prisma.campaignConversionType.createMany({
          data: conversionTypeIds.map(conversionTypeId => ({
            campaignId: campaign.id,
            conversionTypeId
          }))
        })
      }
    }

    // Return updated campaign with conversion types
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        conversionTypes: {
          include: {
            conversionType: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCampaign
    })
  } catch (error) {
    console.error('Error updating campaign:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        error: 'Campaign with this slug already exists'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update campaign'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete campaign conversion type relationships first
    await prisma.campaignConversionType.deleteMany({
      where: { campaignId: params.id }
    })

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete campaign'
    }, { status: 500 })
  }
}