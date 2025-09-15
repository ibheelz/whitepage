import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const user = await UserService.getUserDetails(userId)

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get user details error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user details'
    }, { status: 500 })
  }
}