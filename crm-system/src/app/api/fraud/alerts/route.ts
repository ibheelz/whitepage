import { NextResponse } from 'next/server'
import { FraudService } from '@/lib/fraud-service'

export async function GET() {
  try {
    const alerts = await FraudService.detectAllFraud()

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length
    })

  } catch (error) {
    console.error('Fraud detection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to detect fraud'
    }, { status: 500 })
  }
}