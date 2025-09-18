import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST() {
  // Generate a simple ID (since we can't import cuid in this context)
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  try {
    console.log('🚀 Starting database initialization...')

    // First, try to create the schema using raw SQL
    console.log('📋 Creating database schema...')

    // Create the tables if they don't exist
    const createTablesSQL = `
      -- Create AdminUser table
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "first_name" TEXT,
        "last_name" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
      );

      -- Create Customer table
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" TEXT NOT NULL,
        "master_email" TEXT,
        "master_phone" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "first_name" TEXT,
        "last_name" TEXT,
        "company" TEXT,
        "job_title" TEXT,
        "source" TEXT,
        "country" TEXT,
        "region" TEXT,
        "city" TEXT,
        "timezone" TEXT,
        "language" TEXT,
        "profile_image" TEXT,
        "total_clicks" INTEGER NOT NULL DEFAULT 0,
        "total_leads" INTEGER NOT NULL DEFAULT 0,
        "total_events" INTEGER NOT NULL DEFAULT 0,
        "total_revenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
        "conversion_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
        "quality_score" INTEGER NOT NULL DEFAULT 50,
        "fraud_score" INTEGER NOT NULL DEFAULT 0,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "is_blocked" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
      );

      -- Create Lead table
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "first_name" TEXT,
        "last_name" TEXT,
        "campaign" TEXT,
        "source" TEXT,
        "medium" TEXT,
        "quality_score" INTEGER NOT NULL DEFAULT 50,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
      );

      -- Create Click table
      CREATE TABLE IF NOT EXISTS "clicks" (
        "id" TEXT NOT NULL,
        "ip" TEXT NOT NULL,
        "click_id" TEXT,
        "campaign" TEXT,
        "source" TEXT,
        "medium" TEXT,
        "user_agent" TEXT,
        "landing_page" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
      );

      -- Create Event table
      CREATE TABLE IF NOT EXISTS "events" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "data" JSONB,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "events_pkey" PRIMARY KEY ("id")
      );

      -- Create indexes
      CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "customers_master_email_key" ON "customers"("master_email");
      CREATE UNIQUE INDEX IF NOT EXISTS "customers_master_phone_key" ON "customers"("master_phone");
    `

    // Execute the schema creation
    await prisma.$executeRawUnsafe(createTablesSQL)
    console.log('✅ Database schema created successfully')

    // Now check if admin user exists
    try {
      const existingAdmin = await prisma.adminUser.findFirst({
        where: { email: 'abiola@mieladigital.com' }
      })

      if (!existingAdmin) {
        console.log('👤 Creating admin user...')
        const adminPassword = await bcrypt.hash('admin123', 12)

        await prisma.adminUser.create({
          data: {
            id: generateId(),
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
            data: {
              id: generateId(),
              ...customer
            }
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