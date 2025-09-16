import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/customer-service'
import { z } from 'zod'

const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  masterEmail: z.string().email('Invalid email format'),
  masterPhone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  assignedTeam: z.array(z.string()).optional()
})

const updateCustomerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  masterEmail: z.string().email().optional(),
  masterPhone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  assignedTeam: z.array(z.string()).optional()
})

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    // Use CustomerService to create customer with proper identity graph
    const identificationData = {
      email: validatedData.masterEmail,
      phone: validatedData.masterPhone
    }

    const contextData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      company: validatedData.company,
      jobTitle: validatedData.jobTitle,
      source: validatedData.source,
      country: validatedData.country,
      region: validatedData.region,
      city: validatedData.city,
      timezone: validatedData.timezone,
      language: validatedData.language,
      assignedTeam: validatedData.assignedTeam
    }

    const customer = await CustomerService.findOrCreateCustomer(identificationData, contextData)

    return NextResponse.json({
      success: true,
      customer,
      message: 'Customer created successfully'
    })

  } catch (error) {
    console.error('Create customer error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create customer'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('id')

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateCustomerSchema.parse(body)

    const updatedCustomer = await CustomerService.updateCustomer(customerId, validatedData)

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('Update customer error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update customer'
    }, { status: 500 })
  }
}