import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/customer-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 })
    }

    const customer = await CustomerService.getCustomerDetails(customerId)

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      customer
    })

  } catch (error) {
    console.error('Get customer details error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customer details'
    }, { status: 500 })
  }
}