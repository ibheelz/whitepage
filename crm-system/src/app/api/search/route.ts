import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters'
      }, { status: 400 })
    }

    const users = await UserService.searchUsers(query.trim())

    return NextResponse.json({
      success: true,
      query: query.trim(),
      results: users,
      count: users.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 })
  }
}