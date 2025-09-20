import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').optional(),
  slug: z.string().min(1, 'Campaign slug is required').optional(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  brandId: z.string().optional(),
  logoUrl: z.string().optional(),
  conversionTypes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string()
  })).optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateCampaignSchema.parse(body)

    // Update the campaign
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.clientId !== undefined && { clientId: validatedData.clientId }),
        ...(validatedData.brandId !== undefined && { brandId: validatedData.brandId }),
        ...(validatedData.logoUrl !== undefined && { logoUrl: validatedData.logoUrl }),
        ...(validatedData.conversionTypes !== undefined && { conversionTypes: validatedData.conversionTypes })
      }
    })

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Update campaign error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
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
    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete campaign'
    }, { status: 500 })
  }
}