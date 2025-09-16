import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/customer-service'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('id')

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 })
    }

    const deletedCustomer = await CustomerService.deleteCustomer(customerId)

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
      deletedCustomer
    })

  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete customer'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const query = searchParams.get('q')

    if (query) {
      // Search customers
      const customers = await CustomerService.searchCustomers(query)
      return NextResponse.json({
        success: true,
        customers,
        total: customers.length,
        page: 1,
        limit: customers.length,
        totalPages: 1
      })
    } else {
      // List customers with pagination
      const result = await CustomerService.listCustomers(page, limit)
      return NextResponse.json({
        success: true,
        ...result
      })
    }

  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customers'
    }, { status: 500 })
  }
}