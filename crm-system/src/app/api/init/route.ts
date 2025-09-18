import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('🚀 Starting database initialization...')

    // First, try to create the schema (this will fail if tables already exist, which is fine)
    try {
      console.log('📋 Pushing database schema...')
      // We can't directly run prisma db push from the API, but we can create essential data

      // Check if admin user exists
      const existingAdmin = await prisma.adminUser.findFirst({
        where: { email: 'abiola@mieladigital.com' }
      })

      if (!existingAdmin) {
        console.log('👤 Creating admin user...')
        const adminPassword = await bcrypt.hash('admin123', 12)

        await prisma.adminUser.create({
          data: {
            email: 'abiola@mieladigital.com',
            passwordHash: adminPassword,
            role: 'SUPER_ADMIN',
            firstName: 'Abiola',
            lastName: 'Admin',
            isActive: true
          }
        })
        console.log('✅ Admin user created successfully')
      } else {
        console.log('👤 Admin user already exists')
      }

      // Create a few sample customers if none exist
      const customerCount = await prisma.customer.count()
      if (customerCount === 0) {
        console.log('👥 Creating sample customers...')

        const sampleCustomers = [
          {
            masterEmail: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Tech Corp',
            country: 'United States',
            city: 'New York',
            source: 'Website'
          },
          {
            masterEmail: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            company: 'Design Studio',
            country: 'Canada',
            city: 'Toronto',
            source: 'Social Media'
          },
          {
            masterEmail: 'mike.jones@example.com',
            firstName: 'Mike',
            lastName: 'Jones',
            company: 'Startup Inc',
            country: 'United Kingdom',
            city: 'London',
            source: 'Referral'
          }
        ]

        for (const customer of sampleCustomers) {
          await prisma.customer.create({
            data: customer
          })
        }
        console.log('✅ Sample customers created')
      }

      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error('Database initialization error:', dbError)

      return NextResponse.json({
        success: false,
        error: 'Database initialization failed',
        details: dbError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Init API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Initialization failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}