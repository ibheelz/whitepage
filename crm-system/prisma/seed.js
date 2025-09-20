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

  // Create sample customers with full journey
  const customer1 = await prisma.customer.upsert({
    where: { masterEmail: 'john.doe@example.com' },
    update: {},
    create: {
      masterEmail: 'john.doe@example.com',
      masterPhone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      company: 'TechCorp Inc',
      source: 'LinkedIn',
      assignedTeam: ['team1', 'team2'],
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

  console.log('✅ Created sample customer with full journey:', customer1.masterEmail)

  // Create another customer
  const customer2 = await prisma.customer.upsert({
    where: { masterEmail: 'jane.smith@example.com' },
    update: {},
    create: {
      masterEmail: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      company: 'InnovateMedia',
      source: 'Referral',
      assignedTeam: ['team1'],
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

  console.log('✅ Created second customer:', customer2.masterEmail)

  // Create 18 additional leads with diverse data
  const additionalLeadsData = [
    { firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@techstart.com', phone: '+1555123456', company: 'TechStart Solutions', source: 'google', campaign: campaign1.slug, country: 'US', city: 'New York', value: 75 },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.w@digitalagency.com', phone: '+1555234567', company: 'Digital Agency Pro', source: 'linkedin', campaign: campaign2.slug, country: 'US', city: 'Los Angeles', value: 120 },
    { firstName: 'David', lastName: 'Brown', email: 'david.brown@startup.io', phone: '+1555345678', company: 'Startup Innovations', source: 'facebook', campaign: campaign1.slug, country: 'US', city: 'Chicago', value: 90 },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@creativetech.com', phone: '+1555456789', company: 'Creative Tech Hub', source: 'twitter', campaign: campaign2.slug, country: 'CA', city: 'Toronto', value: 200 },
    { firstName: 'James', lastName: 'Miller', email: 'james.miller@fintech.co', phone: '+1555567890', company: 'FinTech Solutions', source: 'google', campaign: campaign1.slug, country: 'US', city: 'Miami', value: 150 },
    { firstName: 'Jessica', lastName: 'Wilson', email: 'jessica.wilson@marketpro.com', phone: '+1555678901', company: 'Market Pro Analytics', source: 'referral', campaign: campaign2.slug, country: 'UK', city: 'Manchester', value: 80 },
    { firstName: 'Robert', lastName: 'Moore', email: 'robert.moore@devstudio.net', phone: '+1555789012', company: 'Dev Studio Plus', source: 'instagram', campaign: campaign1.slug, country: 'AU', city: 'Sydney', value: 110 },
    { firstName: 'Lisa', lastName: 'Taylor', email: 'lisa.taylor@brandworks.com', phone: '+1555890123', company: 'Brand Works LLC', source: 'youtube', campaign: campaign2.slug, country: 'US', city: 'Seattle', value: 95 },
    { firstName: 'Christopher', lastName: 'Anderson', email: 'chris.anderson@cloudtech.io', phone: '+1555901234', company: 'Cloud Tech Solutions', source: 'google', campaign: campaign1.slug, country: 'DE', city: 'Berlin', value: 180 },
    { firstName: 'Amanda', lastName: 'Thomas', email: 'amanda.thomas@datainsights.com', phone: '+1555012345', company: 'Data Insights Corp', source: 'linkedin', campaign: campaign2.slug, country: 'US', city: 'Boston', value: 130 },
    { firstName: 'Matthew', lastName: 'Jackson', email: 'matthew.jackson@saascompany.com', phone: '+1555123457', company: 'SaaS Company Inc', source: 'facebook', campaign: campaign1.slug, country: 'FR', city: 'Paris', value: 160 },
    { firstName: 'Nicole', lastName: 'White', email: 'nicole.white@ecommerce.store', phone: '+1555234568', company: 'E-commerce Plus', source: 'pinterest', campaign: campaign2.slug, country: 'US', city: 'Austin', value: 70 },
    { firstName: 'Daniel', lastName: 'Harris', email: 'daniel.harris@mobilefirst.com', phone: '+1555345679', company: 'Mobile First Design', source: 'tiktok', campaign: campaign1.slug, country: 'NL', city: 'Amsterdam', value: 140 },
    { firstName: 'Rachel', lastName: 'Martin', email: 'rachel.martin@aidriventech.com', phone: '+1555456780', company: 'AI Driven Tech', source: 'google', campaign: campaign2.slug, country: 'US', city: 'Denver', value: 220 },
    { firstName: 'Kevin', lastName: 'Garcia', email: 'kevin.garcia@blockchainpro.com', phone: '+1555567891', company: 'Blockchain Pro Ltd', source: 'reddit', campaign: campaign1.slug, country: 'SG', city: 'Singapore', value: 190 },
    { firstName: 'Stephanie', lastName: 'Rodriguez', email: 'stephanie.r@cybersecure.net', phone: '+1555678902', company: 'Cyber Secure Systems', source: 'linkedin', campaign: campaign2.slug, country: 'US', city: 'Phoenix', value: 85 },
    { firstName: 'Brian', lastName: 'Lewis', email: 'brian.lewis@greentech.eco', phone: '+1555789013', company: 'Green Tech Innovations', source: 'organic', campaign: campaign1.slug, country: 'CA', city: 'Vancouver', value: 105 },
    { firstName: 'Melissa', lastName: 'Lee', email: 'melissa.lee@healthtech.app', phone: '+1555890124', company: 'Health Tech Apps', source: 'google', campaign: campaign2.slug, country: 'JP', city: 'Tokyo', value: 175 }
  ]

  for (let i = 0; i < additionalLeadsData.length; i++) {
    const leadData = additionalLeadsData[i]
    const customer = await prisma.customer.create({
      data: {
        masterEmail: leadData.email,
        masterPhone: leadData.phone,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        source: leadData.source,
        assignedTeam: ['team1'],
        country: leadData.country,
        city: leadData.city,
        totalClicks: 1,
        totalLeads: 1,
        totalEvents: 0,
        totalRevenue: leadData.value,
        identifiers: {
          create: [
            {
              type: 'EMAIL',
              value: leadData.email,
              isVerified: true,
              isPrimary: true,
              source: 'lead',
              campaign: leadData.campaign,
            },
            {
              type: 'PHONE',
              value: leadData.phone,
              isVerified: true,
              source: 'lead',
              campaign: leadData.campaign,
            },
          ],
        },
        clicks: {
          create: [
            {
              clickId: `click_${1000 + i}`,
              campaign: leadData.campaign,
              source: leadData.source,
              medium: leadData.source === 'google' ? 'cpc' : 'organic',
              ip: `192.168.1.${150 + i}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              referrer: `https://${leadData.source}.com`,
              landingPage: 'https://example.com/landing',
              country: leadData.country,
              city: leadData.city,
              device: i % 2 === 0 ? 'desktop' : 'mobile',
              browser: i % 3 === 0 ? 'Chrome' : i % 3 === 1 ? 'Safari' : 'Firefox',
              os: i % 2 === 0 ? 'Windows' : 'macOS',
              isDesktop: i % 2 === 0,
              isMobile: i % 2 === 1,
            },
          ],
        },
        leads: {
          create: [
            {
              email: leadData.email,
              phone: leadData.phone,
              firstName: leadData.firstName,
              lastName: leadData.lastName,
              campaign: leadData.campaign,
              source: leadData.source,
              medium: leadData.source === 'google' ? 'cpc' : 'organic',
              ip: `192.168.1.${150 + i}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              landingPage: 'https://example.com/landing',
              country: leadData.country,
              city: leadData.city,
              isEmailValid: true,
              isPhoneValid: true,
              qualityScore: 75 + (i % 25),
              clientId: client.id,
              value: leadData.value,
              currency: 'USD',
              createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread across different days
            },
          ],
        },
      },
    })

    console.log(`✅ Created additional customer ${i + 1}/18: ${customer.masterEmail}`)
  }

  console.log('🎉 Database seeded successfully with 20 total customers!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })