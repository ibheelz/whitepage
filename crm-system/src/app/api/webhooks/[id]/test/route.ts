import { NextRequest, NextResponse } from 'next/server'
import { WebhookService } from '@/lib/webhook-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = params.id

    const result = await WebhookService.testWebhook(webhookId)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Webhook test successful' : 'Webhook test failed',
      error: result.error
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test webhook'
    }, { status: 500 })
  }
}