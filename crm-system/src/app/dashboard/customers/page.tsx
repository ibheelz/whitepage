'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Edit, Trash2, Grid3X3, List } from 'lucide-react'
import { ExportIcon, ImportIcon, PlusIcon } from '@/components/ui/icons'

// Hook to detect screen size
const useScreenSize = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024) // Less than lg breakpoint
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isSmallScreen
}

// SVG Icons for verification status
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface Customer {
  id: string
  firstName?: string
  lastName?: string
  masterEmail?: string
  masterPhone?: string
  company?: string
  lastSeen?: Date
  source?: string
  country?: string
  region?: string
  city?: string
  createdAt: Date
  // Additional fields for comprehensive data
  clicks?: { clickId: string; campaign: string; ip: string; userAgent?: string; landingPage?: string }[]
  leads?: { campaign: string; ip: string; userAgent?: string; landingPage?: string; ageVerified?: boolean; promotionalConsent?: boolean }[]
  events?: { eventType: string }[]
  identifiers?: { type: string; isVerified: boolean }[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [customersPerPage] = useState(20)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const isSmallScreen = useScreenSize()

  // Force cards view on small screens
  const effectiveViewMode = isSmallScreen ? 'cards' : viewMode

  // Generate avatar URL using real avatar images
  const generateAvatarUrl = (firstName?: string, lastName?: string, customerId?: string) => {
    // Use a deterministic seed based on name/ID to get consistent avatars
    const seed = customerId || `${firstName || ''}-${lastName || ''}`.toLowerCase().replace(/\s+/g, '-')

    // Using DiceBear API for real avatar images with various styles
    const styles = ['avataaars', 'personas', 'bottts', 'identicon', 'initials', 'lorelei', 'micah', 'open-peeps']
    const selectedStyle = styles[parseInt(seed.slice(-1), 36) % styles.length] || 'avataaars'

    return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&size=32&backgroundColor=374151`
  }

  useEffect(() => {
    // Use sample data with all required fields (20 users)
    const loadSampleData = () => {
        // Generate diverse last seen times
        const generateLastSeen = (index: number) => {
          const timeRanges = [
            5 * 60 * 1000, // 5 minutes ago
            30 * 60 * 1000, // 30 minutes ago
            2 * 60 * 60 * 1000, // 2 hours ago
            6 * 60 * 60 * 1000, // 6 hours ago
            24 * 60 * 60 * 1000, // 1 day ago
            3 * 24 * 60 * 60 * 1000, // 3 days ago
            7 * 24 * 60 * 60 * 1000, // 1 week ago
            14 * 24 * 60 * 60 * 1000, // 2 weeks ago
          ]
          return new Date(Date.now() - timeRanges[index % timeRanges.length])
        }

        setCustomers([
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            masterEmail: 'john.doe@example.com',
            masterPhone: '+1234567890',
            company: 'TechCorp Inc',
            lastSeen: generateLastSeen(0),
            source: 'LinkedIn',
            country: 'US',
            city: 'San Francisco',
            createdAt: new Date('2024-01-15'),
            clicks: [{ clickId: 'click_001', campaign: 'summer-2024', ip: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', landingPage: 'https://example.com/landing' }],
            leads: [{ campaign: 'summer-2024', ip: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', landingPage: 'https://example.com/landing', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            masterEmail: 'sarah.j@innovate.com',
            masterPhone: '+1234567891',
            company: 'InnovateMedia',
            lastSeen: generateLastSeen(1),
            source: 'Referral',
            country: 'CA',
            city: 'Toronto',
            createdAt: new Date('2024-01-20'),
            clicks: [{ clickId: 'click_002', campaign: 'black-friday-2024', ip: '192.168.1.101', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', landingPage: 'https://example.com/promo' }],
            leads: [{ campaign: 'black-friday-2024', ip: '192.168.1.101', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', landingPage: 'https://example.com/promo', ageVerified: false, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Chen',
            masterEmail: 'mike.chen@startup.io',
            masterPhone: '+1234567892',
            company: 'StartupX',
            lastSeen: generateLastSeen(2),
            source: 'Google Ads',
            country: 'US',
            city: 'New York',
            createdAt: new Date('2024-01-25'),
            clicks: [{ clickId: 'click_003', campaign: 'winter-sale', ip: '192.168.1.102', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', landingPage: 'https://example.com/sale' }],
            leads: [{ campaign: 'winter-sale', ip: '192.168.1.102', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', landingPage: 'https://example.com/sale', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '4',
            firstName: 'Emma',
            lastName: 'Wilson',
            masterEmail: 'emma.wilson@design.co',
            masterPhone: '+44207123456',
            company: 'DesignStudio',
            lastSeen: generateLastSeen(3),
            source: 'Facebook',
            country: 'GB',
            city: 'London',
            createdAt: new Date('2024-02-01'),
            clicks: [{ clickId: 'click_004', campaign: 'design-promo', ip: '10.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101', landingPage: 'https://example.com/design' }],
            leads: [{ campaign: 'design-promo', ip: '10.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101', landingPage: 'https://example.com/design', ageVerified: true, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '5',
            firstName: 'Alex',
            lastName: 'Rodriguez',
            masterEmail: 'alex.r@consulting.com',
            masterPhone: '+34912345678',
            company: 'Rodriguez Consulting',
            lastSeen: generateLastSeen(4),
            source: 'Direct',
            country: 'ES',
            city: 'Madrid',
            createdAt: new Date('2024-02-05'),
            clicks: [{ clickId: 'click_005', campaign: 'spring-launch', ip: '172.16.0.1', userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)', landingPage: 'https://example.com/launch' }],
            leads: [{ campaign: 'spring-launch', ip: '172.16.0.1', userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)', landingPage: 'https://example.com/launch', ageVerified: false, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '6',
            firstName: 'Lisa',
            lastName: 'Zhang',
            masterEmail: 'lisa.zhang@techsolutions.com',
            masterPhone: '+8613888888888',
            company: 'TechSolutions',
            lastSeen: generateLastSeen(5),
            source: 'LinkedIn',
            country: 'CN',
            city: 'Shanghai',
            createdAt: new Date('2024-02-10'),
            clicks: [{ clickId: 'click_006', campaign: 'asia-expansion', ip: '192.168.2.100', userAgent: 'Mozilla/5.0 (Android 12; Mobile; rv:107.0)', landingPage: 'https://example.com/asia' }],
            leads: [{ campaign: 'asia-expansion', ip: '192.168.2.100', userAgent: 'Mozilla/5.0 (Android 12; Mobile; rv:107.0)', landingPage: 'https://example.com/asia', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '7',
            firstName: 'David',
            lastName: 'Brown',
            masterEmail: 'david.brown@marketing.au',
            masterPhone: '+61298765432',
            company: 'Marketing Pro',
            lastSeen: generateLastSeen(6),
            source: 'Google Ads',
            country: 'AU',
            city: 'Sydney',
            createdAt: new Date('2024-02-15'),
            clicks: [{ clickId: 'click_007', campaign: 'aussie-deals', ip: '203.0.113.1', userAgent: 'Mozilla/5.0 (Windows NT 11.0; Win64; x64)', landingPage: 'https://example.com/australia' }],
            leads: [{ campaign: 'aussie-deals', ip: '203.0.113.1', userAgent: 'Mozilla/5.0 (Windows NT 11.0; Win64; x64)', landingPage: 'https://example.com/australia', ageVerified: true, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '8',
            firstName: 'Sophie',
            lastName: 'Martin',
            masterEmail: 'sophie.martin@creativeagency.fr',
            masterPhone: '+33142345678',
            company: 'Creative Agency',
            lastSeen: generateLastSeen(7),
            source: 'Instagram',
            country: 'FR',
            city: 'Paris',
            createdAt: new Date('2024-02-20'),
            clicks: [{ clickId: 'click_008', campaign: 'french-style', ip: '198.51.100.1', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', landingPage: 'https://example.com/france' }],
            leads: [{ campaign: 'french-style', ip: '198.51.100.1', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', landingPage: 'https://example.com/france', ageVerified: false, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '9',
            firstName: 'James',
            lastName: 'Taylor',
            masterEmail: 'james.taylor@fintech.com',
            masterPhone: '+1555123456',
            company: 'FinTech Solutions',
            lastSeen: generateLastSeen(8),
            source: 'Twitter',
            country: 'US',
            city: 'Austin',
            createdAt: new Date('2024-02-25'),
            clicks: [{ clickId: 'click_009', campaign: 'fintech-revolution', ip: '192.168.3.100', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', landingPage: 'https://example.com/fintech' }],
            leads: [{ campaign: 'fintech-revolution', ip: '192.168.3.100', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', landingPage: 'https://example.com/fintech', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '10',
            firstName: 'Maria',
            lastName: 'Garcia',
            masterEmail: 'maria.garcia@ecommerce.mx',
            masterPhone: '+525512345678',
            company: 'E-Commerce Plus',
            lastSeen: generateLastSeen(9),
            source: 'YouTube',
            country: 'MX',
            city: 'Mexico City',
            createdAt: new Date('2024-03-01'),
            clicks: [{ clickId: 'click_010', campaign: 'mexico-market', ip: '10.1.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0)', landingPage: 'https://example.com/mexico' }],
            leads: [{ campaign: 'mexico-market', ip: '10.1.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0)', landingPage: 'https://example.com/mexico', ageVerified: false, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '11',
            firstName: 'Robert',
            lastName: 'Kim',
            masterEmail: 'robert.kim@tech.kr',
            masterPhone: '+821012345678',
            company: 'Korean Tech',
            lastSeen: generateLastSeen(10),
            source: 'LinkedIn',
            country: 'KR',
            city: 'Seoul',
            createdAt: new Date('2024-03-05'),
            clicks: [{ clickId: 'click_011', campaign: 'korea-tech', ip: '192.168.4.100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', landingPage: 'https://example.com/korea' }],
            leads: [{ campaign: 'korea-tech', ip: '192.168.4.100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', landingPage: 'https://example.com/korea', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '12',
            firstName: 'Anna',
            lastName: 'Petrov',
            masterEmail: 'anna.petrov@digital.ru',
            masterPhone: '+79161234567',
            company: 'Digital Russia',
            lastSeen: generateLastSeen(11),
            source: 'Referral',
            country: 'RU',
            city: 'Moscow',
            createdAt: new Date('2024-03-10'),
            clicks: [{ clickId: 'click_012', campaign: 'russia-digital', ip: '172.17.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0)', landingPage: 'https://example.com/russia' }],
            leads: [{ campaign: 'russia-digital', ip: '172.17.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0)', landingPage: 'https://example.com/russia', ageVerified: true, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '13',
            firstName: 'Carlos',
            lastName: 'Silva',
            masterEmail: 'carlos.silva@startup.br',
            masterPhone: '+5511987654321',
            company: 'Brazil Startup',
            lastSeen: generateLastSeen(12),
            source: 'Facebook',
            country: 'BR',
            city: 'São Paulo',
            createdAt: new Date('2024-03-15'),
            clicks: [{ clickId: 'click_013', campaign: 'brazil-growth', ip: '198.51.100.50', userAgent: 'Mozilla/5.0 (Android 13; SM-G998B)', landingPage: 'https://example.com/brazil' }],
            leads: [{ campaign: 'brazil-growth', ip: '198.51.100.50', userAgent: 'Mozilla/5.0 (Android 13; SM-G998B)', landingPage: 'https://example.com/brazil', ageVerified: false, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '14',
            firstName: 'Jennifer',
            lastName: 'White',
            masterEmail: 'jennifer.white@healthcare.com',
            masterPhone: '+1416555789',
            company: 'Healthcare Innovation',
            lastSeen: generateLastSeen(13),
            source: 'Google Ads',
            country: 'CA',
            city: 'Vancouver',
            createdAt: new Date('2024-03-20'),
            clicks: [{ clickId: 'click_014', campaign: 'health-tech', ip: '10.2.2.2', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X)', landingPage: 'https://example.com/health' }],
            leads: [{ campaign: 'health-tech', ip: '10.2.2.2', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X)', landingPage: 'https://example.com/health', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '15',
            firstName: 'Ahmed',
            lastName: 'Hassan',
            masterEmail: 'ahmed.hassan@middle-east.ae',
            masterPhone: '+971501234567',
            company: 'Middle East Tech',
            lastSeen: generateLastSeen(14),
            source: 'LinkedIn',
            country: 'AE',
            city: 'Dubai',
            createdAt: new Date('2024-03-25'),
            clicks: [{ clickId: 'click_015', campaign: 'mena-expansion', ip: '192.168.5.100', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', landingPage: 'https://example.com/mena' }],
            leads: [{ campaign: 'mena-expansion', ip: '192.168.5.100', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', landingPage: 'https://example.com/mena', ageVerified: true, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '16',
            firstName: 'Linda',
            lastName: 'Anderson',
            masterEmail: 'linda.anderson@retail.com',
            masterPhone: '+1702555123',
            company: 'Retail Solutions',
            lastSeen: generateLastSeen(15),
            source: 'Instagram',
            country: 'US',
            city: 'Las Vegas',
            createdAt: new Date('2024-03-30'),
            clicks: [{ clickId: 'click_016', campaign: 'retail-revolution', ip: '203.0.113.50', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59', landingPage: 'https://example.com/retail' }],
            leads: [{ campaign: 'retail-revolution', ip: '203.0.113.50', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59', landingPage: 'https://example.com/retail', ageVerified: false, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '17',
            firstName: 'Thomas',
            lastName: 'Mueller',
            masterEmail: 'thomas.mueller@automotive.de',
            masterPhone: '+4930123456789',
            company: 'Automotive Tech',
            lastSeen: generateLastSeen(16),
            source: 'Direct',
            country: 'DE',
            city: 'Berlin',
            createdAt: new Date('2024-04-01'),
            clicks: [{ clickId: 'click_017', campaign: 'german-engineering', ip: '10.3.3.3', userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0)', landingPage: 'https://example.com/germany' }],
            leads: [{ campaign: 'german-engineering', ip: '10.3.3.3', userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0)', landingPage: 'https://example.com/germany', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '18',
            firstName: 'Priya',
            lastName: 'Sharma',
            masterEmail: 'priya.sharma@software.in',
            masterPhone: '+919876543210',
            company: 'India Software',
            lastSeen: generateLastSeen(17),
            source: 'YouTube',
            country: 'IN',
            city: 'Bangalore',
            createdAt: new Date('2024-04-05'),
            clicks: [{ clickId: 'click_018', campaign: 'india-innovation', ip: '192.168.6.100', userAgent: 'Mozilla/5.0 (Android 11; Mobile; LG-M255)', landingPage: 'https://example.com/india' }],
            leads: [{ campaign: 'india-innovation', ip: '192.168.6.100', userAgent: 'Mozilla/5.0 (Android 11; Mobile; LG-M255)', landingPage: 'https://example.com/india', ageVerified: false, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: false }, { type: 'PHONE', isVerified: true }]
          },
          {
            id: '19',
            firstName: 'Marco',
            lastName: 'Rossi',
            masterEmail: 'marco.rossi@fashion.it',
            masterPhone: '+390612345678',
            company: 'Italian Fashion',
            lastSeen: generateLastSeen(18),
            source: 'Pinterest',
            country: 'IT',
            city: 'Milan',
            createdAt: new Date('2024-04-10'),
            clicks: [{ clickId: 'click_019', campaign: 'italian-style', ip: '172.18.0.1', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6)', landingPage: 'https://example.com/italy' }],
            leads: [{ campaign: 'italian-style', ip: '172.18.0.1', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6)', landingPage: 'https://example.com/italy', ageVerified: true, promotionalConsent: true }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: false }]
          },
          {
            id: '20',
            firstName: 'Yuki',
            lastName: 'Tanaka',
            masterEmail: 'yuki.tanaka@gaming.jp',
            masterPhone: '+81312345678',
            company: 'Gaming Studio',
            lastSeen: generateLastSeen(19),
            source: 'TikTok',
            country: 'JP',
            city: 'Tokyo',
            createdAt: new Date('2024-04-15'),
            clicks: [{ clickId: 'click_020', campaign: 'japan-gaming', ip: '198.51.100.100', userAgent: 'Mozilla/5.0 (Nintendo Switch; WebApplet)', landingPage: 'https://example.com/japan' }],
            leads: [{ campaign: 'japan-gaming', ip: '198.51.100.100', userAgent: 'Mozilla/5.0 (Nintendo Switch; WebApplet)', landingPage: 'https://example.com/japan', ageVerified: true, promotionalConsent: false }],
            identifiers: [{ type: 'EMAIL', isVerified: true }, { type: 'PHONE', isVerified: true }]
          }
        ])
        setLoading(false)
    }

    loadSampleData()
  }, [])

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    searchQuery === '' ||
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.masterEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage)

  // Helper function to get country flag emoji from country code
  const getCountryFlag = (countryCode?: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'ES': '🇪🇸', 'CN': '🇨🇳',
      'AU': '🇦🇺', 'FR': '🇫🇷', 'MX': '🇲🇽', 'KR': '🇰🇷', 'RU': '🇷🇺',
      'BR': '🇧🇷', 'AE': '🇦🇪', 'DE': '🇩🇪', 'IN': '🇮🇳', 'IT': '🇮🇹',
      'JP': '🇯🇵'
    }
    return flags[countryCode || ''] || '🌍'
  }

  // Helper function to get language from country
  const getLanguage = (country?: string) => {
    switch (country) {
      case 'US': case 'CA': return 'EN'
      case 'ES': return 'ES'
      case 'FR': return 'FR'
      case 'DE': return 'DE'
      default: return 'EN'
    }
  }

  // Helper function to format "last seen" time
  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never'

    return lastSeen.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted/20 rounded"></div>
          <div className="h-12 bg-muted/20 rounded"></div>
          <div className="bg-muted/10 rounded-2xl p-6" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-muted/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 xxs:space-y-1 xs:space-y-3 sm:space-y-6 p-1 xxs:p-1 xs:p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xxs:gap-1 xs:gap-3 sm:gap-4 mb-2 xxs:mb-1 xs:mb-3 sm:mb-6">
        <h1 className="text-base xxs:text-sm xs:text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">Customer Management</h1>
        <div className="flex flex-row gap-1 xxs:gap-1 xs:gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
          <button className="flex-1 sm:flex-none min-w-[40px] xxs:min-w-[36px] max-w-[120px] sm:max-w-none px-1 xxs:px-1 xs:px-2 sm:px-4 lg:px-5 py-1.5 xxs:py-1 xs:py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 hover:scale-105 active:scale-95" style={{
            background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 198, 0, 0.3)',
            color: '#080708',
            boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
          }}>
            <ImportIcon size={16} className="h-3 w-3 xxs:h-2.5 xxs:w-2.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline text-xs sm:text-sm truncate">Import</span>
          </button>
          <button className="flex-1 sm:flex-none min-w-[40px] xxs:min-w-[36px] max-w-[120px] sm:max-w-none px-1 xxs:px-1 xs:px-2 sm:px-4 lg:px-5 py-1.5 xxs:py-1 xs:py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 hover:scale-105 active:scale-95" style={{
            background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 198, 0, 0.3)',
            color: '#080708',
            boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
          }}>
            <ExportIcon size={16} className="h-3 w-3 xxs:h-2.5 xxs:w-2.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline text-xs sm:text-sm truncate">Export</span>
          </button>
          <button className="flex-1 sm:flex-none min-w-[40px] xxs:min-w-[36px] max-w-[140px] sm:max-w-none px-1 xxs:px-1 xs:px-2 sm:px-4 lg:px-5 py-1.5 xxs:py-1 xs:py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 hover:scale-105 active:scale-95" style={{
            background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(253, 198, 0, 0.3)',
            color: '#080708',
            boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
          }}>
            <PlusIcon size={16} className="h-3 w-3 xxs:h-2.5 xxs:w-2.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline text-xs sm:text-sm truncate">Add Customer</span>
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-48 md:w-64 lg:w-80 py-3 text-sm rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          {selectedCustomers.size > 0 && (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground text-center xs:text-left">
                {selectedCustomers.size} selected
              </span>
              <button className="px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2" style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--foreground)'
              }}>
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Delete Selected</span>
                <span className="xs:hidden">Delete</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 lg:flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left order-2 sm:order-1">
            Showing {Math.min(customersPerPage, currentCustomers.length)} of {filteredCustomers.length} customers
          </p>

          {!isSmallScreen && (
            <div className="flex items-center justify-center gap-1 rounded-xl p-1 order-1 sm:order-2" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{
                  background: viewMode === 'table'
                    ? 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                    : 'transparent'
                }}
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'cards' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{
                  background: viewMode === 'cards'
                    ? 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                    : 'transparent'
                }}
              >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {effectiveViewMode === 'table' ? (
        <div className="rounded-2xl shadow-xl overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div className="overflow-x-auto custom-scrollbar mobile-table">
            <table className="w-full min-w-max touch-manipulation">
            <thead style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <tr>
                <th className="px-3 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === currentCustomers.length && currentCustomers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(new Set(currentCustomers.map(c => c.id)))
                      } else {
                        setSelectedCustomers(new Set())
                      }
                    }}
                    className="w-4 h-4 rounded border-2 accent-primary"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </th>
                <th className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">Click ID</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">Full Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[180px]">Email</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Phone</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Traffic Source</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Campaign</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">IP Address</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">Location</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[80px]">Language</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[300px]">User Agent</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Timestamp</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Verifications</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">Landing Page</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'transparent' }}>
              {currentCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="transition-all duration-200 border-b border-white/5"
                  style={{
                    background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedCustomers)
                        if (e.target.checked) {
                          newSelected.add(customer.id)
                        } else {
                          newSelected.delete(customer.id)
                        }
                        setSelectedCustomers(newSelected)
                      }}
                      className="w-4 h-4 rounded border-2 accent-primary"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground font-medium">
                    {(currentPage - 1) * customersPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-yellow-400 px-2 py-1 rounded" style={{
                      background: 'rgba(253, 198, 0, 0.1)',
                      border: '1px solid rgba(253, 198, 0, 0.3)'
                    }}>
                      {customer.clicks?.[0]?.clickId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={generateAvatarUrl(customer.firstName, customer.lastName, customer.id)}
                        alt={`${customer.firstName} ${customer.lastName}`}
                        className="w-8 h-8 rounded-full ring-2 ring-white/10"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">Last seen: {formatLastSeen(customer.lastSeen)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{customer.masterEmail}</span>
                      {customer.identifiers?.some(i => i.type === 'EMAIL' && i.isVerified) ? (
                        <CheckIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <XIcon className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{customer.masterPhone || 'N/A'}</span>
                      {customer.identifiers?.some(i => i.type === 'PHONE' && i.isVerified) ? (
                        <CheckIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <XIcon className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-primary" style={{
                      background: 'rgba(253, 198, 0, 0.1)',
                      border: '1px solid rgba(253, 198, 0, 0.2)'
                    }}>
                      {customer.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {customer.leads?.[0]?.campaign || customer.clicks?.[0]?.campaign || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-green-400 px-2 py-1 rounded" style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      {customer.leads?.[0]?.ip || customer.clicks?.[0]?.ip || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(customer.country)}</span>
                      <span>{customer.city}, {customer.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {getLanguage(customer.country)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]" title={customer.leads?.[0]?.userAgent || customer.clicks?.[0]?.userAgent}>
                      {customer.leads?.[0]?.userAgent || customer.clicks?.[0]?.userAgent || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Age:</span>
                        {customer.leads?.[0]?.ageVerified ? (
                          <CheckIcon className="w-3 h-3 text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Promo:</span>
                        {customer.leads?.[0]?.promotionalConsent ? (
                          <CheckIcon className="w-3 h-3 text-green-400" />
                        ) : (
                          <XIcon className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={customer.leads?.[0]?.landingPage || customer.clicks?.[0]?.landingPage}>
                      {customer.leads?.[0]?.landingPage || customer.clicks?.[0]?.landingPage || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        /* Cards View */
        <div className="grid gap-2 xxs:gap-1 xs:gap-2 sm:gap-4 lg:gap-6 touch-manipulation safe-area-inset" style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))'
        }}>
          {currentCustomers.map((customer, index) =>
            isSmallScreen ? (
              /* Compact Card for Small Screens */
              <div
                key={customer.id}
                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={generateAvatarUrl(customer.firstName, customer.lastName, customer.id)}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="w-10 h-10 rounded-full ring-2 ring-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.masterEmail}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.has(customer.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedCustomers)
                      if (e.target.checked) {
                        newSelected.add(customer.id)
                      } else {
                        newSelected.delete(customer.id)
                      }
                      setSelectedCustomers(newSelected)
                    }}
                    className="w-4 h-4 rounded border-2 accent-primary flex-shrink-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>

                {/* Compact Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Location</span>
                    <div className="flex items-center gap-1.5 max-w-[120px]">
                      <span className="text-sm">{getCountryFlag(customer.country)}</span>
                      <span className="text-foreground truncate">
                        {customer.city}, {customer.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Source</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-primary" style={{
                      background: 'rgba(253, 198, 0, 0.1)',
                      border: '1px solid rgba(253, 198, 0, 0.2)'
                    }}>
                      {customer.source}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last seen</span>
                    <span className="text-foreground truncate max-w-[120px]">
                      {formatLastSeen(customer.lastSeen)}
                    </span>
                  </div>
                </div>

                {/* Compact Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-muted-foreground">
                    #{(currentPage - 1) * customersPerPage + index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground" style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Edit className="h-3 w-3" />
                    </button>
                    <button className="p-1.5 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300" style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Full Card for Large Screens */
            <div
              key={customer.id}
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Card Header with Avatar and Name */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={generateAvatarUrl(customer.firstName, customer.lastName, customer.id)}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full ring-2 ring-white/10"
                    />
                    {/* Status indicator */}
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white/20" style={{
                      background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                    }}></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg truncate">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-400 truncate font-mono">
                      {customer.clicks?.[0]?.clickId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.has(customer.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedCustomers)
                      if (e.target.checked) {
                        newSelected.add(customer.id)
                      } else {
                        newSelected.delete(customer.id)
                      }
                      setSelectedCustomers(newSelected)
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 accent-primary"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">Email</span>
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 justify-end">
                    <span className="text-xs sm:text-sm text-foreground truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[150px]" title={customer.masterEmail}>
                      {customer.masterEmail}
                    </span>
                    {customer.identifiers?.some(i => i.type === 'EMAIL' && i.isVerified) ? (
                      <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 flex-shrink-0" />
                    ) : (
                      <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">Phone</span>
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 justify-end">
                    <span className="text-xs sm:text-sm text-foreground truncate max-w-[100px] sm:max-w-[120px]">
                      {customer.masterPhone || 'N/A'}
                    </span>
                    {customer.identifiers?.some(i => i.type === 'PHONE' && i.isVerified) ? (
                      <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 flex-shrink-0" />
                    ) : (
                      <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">Location</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{getCountryFlag(customer.country)}</span>
                    <span className="text-xs sm:text-sm text-foreground truncate text-right">
                      {customer.city}, {customer.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">Source</span>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium text-primary" style={{
                    background: 'rgba(253, 198, 0, 0.1)',
                    border: '1px solid rgba(253, 198, 0, 0.2)'
                  }}>
                    {customer.source}
                  </span>
                </div>
              </div>

              {/* Campaign and Traffic Info */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">Campaign</span>
                  <span className="text-xs text-foreground font-medium truncate text-right max-w-[100px] sm:max-w-[120px]" title={customer.leads?.[0]?.campaign || customer.clicks?.[0]?.campaign}>
                    {customer.leads?.[0]?.campaign || customer.clicks?.[0]?.campaign || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">IP Address</span>
                  <span className="text-xs font-mono text-green-400 truncate">
                    {customer.leads?.[0]?.ip || customer.clicks?.[0]?.ip || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">Language</span>
                  <span className="text-xs text-foreground">
                    {getLanguage(customer.country)}
                  </span>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">Age Verified</span>
                  {customer.leads?.[0]?.ageVerified ? (
                    <div className="flex items-center gap-1">
                      <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-400">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-400">No</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">Promo Consent</span>
                  {customer.leads?.[0]?.promotionalConsent ? (
                    <div className="flex items-center gap-1">
                      <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-400">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-400">No</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Seen */}
              <div className="mb-3 sm:mb-4 p-2 rounded-lg text-center" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-xs text-muted-foreground block">Last seen</span>
                <span className="text-xs sm:text-sm text-foreground font-medium break-all">
                  {formatLastSeen(customer.lastSeen)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-white/10 gap-2">
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  #{(currentPage - 1) * customersPerPage + index + 1}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="p-1 sm:p-1.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                  <button className="p-1 sm:p-1.5 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </div>
              </div>
            </div>
            )
          )}
        </div>
      )}

      {/* Pagination (shared between both views) */}
      <div className="mt-6 sm:mt-8">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left order-2 sm:order-1">
              Showing {Math.min(customersPerPage, currentCustomers.length)} of {filteredCustomers.length} customers
            </p>

            <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage > totalPages - 3) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                const isActive = currentPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 font-medium ${
                      isActive ? 'text-black' : 'text-foreground'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))'
                        : 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${isActive ? 'rgba(253, 198, 0, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                      boxShadow: isActive ? '0 4px 16px rgba(253, 198, 0, 0.3)' : 'none'
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}