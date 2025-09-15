const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: 'abiola@mieladigital.com' },
    update: {},
    create: {
      email: 'abiola@mieladigital.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      firstName: 'Abiola',
      lastName: 'Admin',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 12)

  const client = await prisma.client.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Example Client',
      slug: 'example-client',
      email: 'client@example.com',
      passwordHash: clientPassword,
      isActive: true,
      canViewReports: true,
      canExportData: true,
      canViewAnalytics: true,
    },
  })

  console.log('✅ Created client:', client.name)

  // Create sample campaigns
  const campaign1 = await prisma.campaign.upsert({
    where: { slug: 'summer-promotion-2024' },
    update: {},
    create: {
      name: 'Summer Promotion 2024',
      slug: 'summer-promotion-2024',
      description: 'Summer promotion campaign for new user acquisition',
      clientId: client.id,
      isActive: true,
    },
  })

  const campaign2 = await prisma.campaign.upsert({
    where: { slug: 'black-friday-2024' },
    update: {},
    create: {
      name: 'Black Friday 2024',
      slug: 'black-friday-2024',
      description: 'Black Friday special offers campaign',
      clientId: client.id,
      isActive: true,
    },
  })

  console.log('✅ Created campaigns:', campaign1.name, campaign2.name)

  // Create sample users with full journey
  const user1 = await prisma.user.create({
    data: {
      masterEmail: 'john.doe@example.com',
      masterPhone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      country: 'US',
      region: 'California',
      city: 'San Francisco',
      totalClicks: 3,
      totalLeads: 1,
      totalEvents: 2,
      totalRevenue: 150.00,
      identifiers: {
        create: [
          {
            type: 'EMAIL',
            value: 'john.doe@example.com',
            isVerified: true,
            isPrimary: true,
            source: 'lead',
            campaign: campaign1.slug,
          },
          {
            type: 'PHONE',
            value: '+1234567890',
            isVerified: true,
            source: 'lead',
            campaign: campaign1.slug,
          },
        ],
      },
      clicks: {
        create: [
          {
            clickId: 'click_001',
            campaign: campaign1.slug,
            source: 'google',
            medium: 'cpc',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: 'https://google.com',
            landingPage: 'https://example.com/landing',
            country: 'US',
            region: 'California',
            city: 'San Francisco',
            device: 'desktop',
            browser: 'Chrome',
            os: 'Windows',
            isDesktop: true,
          },
        ],
      },
      leads: {
        create: [
          {
            email: 'john.doe@example.com',
            phone: '+1234567890',
            firstName: 'John',
            lastName: 'Doe',
            campaign: campaign1.slug,
            source: 'google',
            medium: 'cpc',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            landingPage: 'https://example.com/landing',
            country: 'US',
            region: 'California',
            city: 'San Francisco',
            isEmailValid: true,
            isPhoneValid: true,
            qualityScore: 95,
            clientId: client.id,
            value: 50.00,
            currency: 'USD',
          },
        ],
      },
      events: {
        create: [
          {
            eventType: 'signup',
            eventName: 'User Registration',
            category: 'conversion',
            properties: {
              source: 'landing_page',
              signup_method: 'email',
            },
            campaign: campaign1.slug,
            source: 'google',
            medium: 'cpc',
            ip: '192.168.1.100',
            clientId: client.id,
            isConverted: true,
            value: 0,
          },
          {
            eventType: 'deposit',
            eventName: 'First Deposit',
            category: 'revenue',
            properties: {
              amount: 100,
              payment_method: 'credit_card',
            },
            campaign: campaign1.slug,
            source: 'google',
            medium: 'cpc',
            ip: '192.168.1.100',
            clientId: client.id,
            isConverted: true,
            isRevenue: true,
            value: 100.00,
            currency: 'USD',
          },
        ],
      },
    },
  })

  console.log('✅ Created sample user with full journey:', user1.masterEmail)

  // Create another user
  const user2 = await prisma.user.create({
    data: {
      masterEmail: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      country: 'UK',
      region: 'England',
      city: 'London',
      totalClicks: 1,
      totalLeads: 1,
      totalEvents: 1,
      identifiers: {
        create: [
          {
            type: 'EMAIL',
            value: 'jane.smith@example.com',
            isVerified: true,
            isPrimary: true,
            source: 'lead',
            campaign: campaign2.slug,
          },
        ],
      },
      clicks: {
        create: [
          {
            clickId: 'click_002',
            campaign: campaign2.slug,
            source: 'facebook',
            medium: 'social',
            ip: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            referrer: 'https://facebook.com',
            landingPage: 'https://example.com/promo',
            country: 'UK',
            region: 'England',
            city: 'London',
            device: 'mobile',
            browser: 'Safari',
            os: 'iOS',
            isMobile: true,
          },
        ],
      },
      leads: {
        create: [
          {
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            campaign: campaign2.slug,
            source: 'facebook',
            medium: 'social',
            ip: '192.168.1.101',
            landingPage: 'https://example.com/promo',
            country: 'UK',
            region: 'England',
            city: 'London',
            isEmailValid: true,
            qualityScore: 88,
            clientId: client.id,
            value: 0,
          },
        ],
      },
      events: {
        create: [
          {
            eventType: 'signup',
            eventName: 'User Registration',
            category: 'conversion',
            campaign: campaign2.slug,
            source: 'facebook',
            medium: 'social',
            ip: '192.168.1.101',
            clientId: client.id,
            isConverted: true,
            value: 0,
          },
        ],
      },
    },
  })

  console.log('✅ Created second user:', user2.masterEmail)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })