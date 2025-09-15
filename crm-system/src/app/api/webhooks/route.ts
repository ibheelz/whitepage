import { NextRequest, NextResponse } from 'next/server'
import { WebhookService } from '@/lib/webhook-service'

export async function GET() {
  try {
    const webhooks = WebhookService.getWebhooks()

    return NextResponse.json({
      success: true,
      webhooks,
      count: webhooks.length
    })

  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch webhooks'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, url, secret, events, isActive, retryAttempts, timeout, headers } = body

    if (!name || !url || !secret || !events) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, url, secret, events'
      }, { status: 400 })
    }

    const webhook = await WebhookService.registerWebhook({
      name,
      url,
      secret,
      events,
      isActive: isActive !== undefined ? isActive : true,
      retryAttempts: retryAttempts || 3,
      timeout: timeout || 30000,
      headers
    })

    return NextResponse.json({
      success: true,
      webhook,
      message: 'Webhook registered successfully'
    })

  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create webhook'
    }, { status: 500 })
  }
}