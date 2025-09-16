'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  AnalyticsIcon,
  UsersIcon,
  ClicksIcon,
  EventsIcon,
  CampaignIcon,
  FraudIcon,
  SettingsIcon,
  SearchIcon,
  FlashIcon,
  UserIcon
} from '@/components/ui/icons'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: AnalyticsIcon, description: 'Overview & Analytics' },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon, description: 'Customer Management' },
  { name: 'Leads', href: '/dashboard/leads', icon: ClicksIcon, description: 'Lead Management' },
  { name: 'Clicks', href: '/dashboard/clicks', icon: ClicksIcon, description: 'Click Tracking' },
  { name: 'Events', href: '/dashboard/events', icon: EventsIcon, description: 'User Events' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: CampaignIcon, description: 'Marketing Campaigns' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: AnalyticsIcon, description: 'Performance Insights' },
  { name: 'Fraud Monitor', href: '/dashboard/fraud', icon: FraudIcon, description: 'Security & Fraud' },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, description: 'Configuration' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [compactUserMenuOpen, setCompactUserMenuOpen] = useState(false)
  const compactUserMenuRef = useRef<HTMLDivElement>(null)

  // Close compact user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (compactUserMenuRef.current && !compactUserMenuRef.current.contains(event.target as Node)) {
        setCompactUserMenuOpen(false)
      }
    }

    if (compactUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [compactUserMenuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Wider Sidebar - Collapsible on Desktop */}
      <div className={`fixed inset-y-0 left-0 z-30 transition-all duration-300 hidden lg:block ${
        sidebarCollapsed ? 'w-20' : 'w-80'
      }`}>
        <div className="flex h-full flex-col overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '0 24px 24px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}>
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>

          {sidebarCollapsed ? (
            // No header when collapsed - minimal border
            <div className="border-b border-border/10 h-4"></div>
          ) : (
            // Logo & Brand when expanded
            <div className="flex h-20 items-center justify-between border-b border-border/10 relative px-6">
              <div className="flex items-center flex-1">
                <div className="fade-in">
                  <h1 className="text-xl font-black text-foreground">Miela CRM</h1>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Business System</p>
                </div>
              </div>
              {/* Hamburger button when expanded */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-xl hover:bg-muted/20 transition-all duration-300 text-primary hover:text-primary/80 flex-shrink-0"
                title="Collapse sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transition-all duration-300">
                  <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 px-4 space-y-3 relative overflow-y-auto custom-scrollbar ${sidebarCollapsed ? 'py-4' : 'py-6'}`}>
            {sidebarCollapsed && (
              // Hamburger at top of nav when collapsed
              <div className="mb-2">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-10 h-10 rounded-xl hover:bg-muted/20 transition-all duration-300 text-primary hover:text-primary/80 flex items-center justify-center"
                  title="Expand sidebar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transition-all duration-300">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                  </svg>
                </button>
              </div>
            )}
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center transition-all duration-300 rounded-xl p-3 mb-2 ${
                    sidebarCollapsed
                      ? (isActive ? '' : 'hover:bg-muted/20')
                      : (isActive
                          ? 'bg-primary/20 border border-primary/30 shadow-lg'
                          : 'hover:bg-muted/20 hover:border-muted/30 border border-transparent')
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                    sidebarCollapsed
                      ? (isActive ? 'bg-primary shadow-lg' : 'bg-transparent hover:bg-muted/30')
                      : (isActive ? 'bg-primary shadow-lg' : 'bg-muted/20 hover:bg-muted/30')
                  } ${sidebarCollapsed ? 'mr-0' : 'mr-4'}`}>
                    <item.icon size={20} className={isActive ? 'text-black' : 'text-yellow-400'} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="fade-in flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${
                        isActive ? 'text-primary' : 'text-white'
                      }`}>{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border/10 p-4 relative">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center">
                <div className="relative" ref={compactUserMenuRef}>
                  {/* Only bright yellow circular avatar when compact */}
                  <button
                    onClick={() => setCompactUserMenuOpen(!compactUserMenuOpen)}
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-all duration-300 shadow-lg"
                    title="User menu"
                  >
                    {/* Cartoon avatar for app user (Abiola) */}
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="text-black">
                      <circle cx="16" cy="16" r="16" fill="#FFB800"/>
                      <circle cx="16" cy="14" r="10" fill="#FDD835"/>
                      <circle cx="13" cy="12" r="1.5" fill="#333"/>
                      <circle cx="19" cy="12" r="1.5" fill="#333"/>
                      <path d="M12 16c0 2 1.8 3 4 3s4-1 4-3" stroke="#333" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                      <circle cx="16" cy="8" r="6" fill="#8D6E63"/>
                      <path d="M10 6c0-3 2.7-6 6-6s6 3 6 6" fill="#6D4C41"/>
                    </svg>
                  </button>

                  {/* Simple logout modal */}
                  {compactUserMenuOpen && (
                    <div className="absolute bottom-4 left-16 z-50">
                      <div
                        className="bg-background border border-primary/30 rounded-lg p-2 shadow-2xl min-w-[120px]"
                        style={{
                          background: 'rgba(8, 7, 8, 0.95)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(253, 198, 0, 0.3)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        <button
                          onClick={() => {
                            setCompactUserMenuOpen(false)
                            signOut({ callbackUrl: '/auth/signin' })
                          }}
                          className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg hover:bg-primary/10 text-primary hover:text-primary/80 transition-all duration-300 text-sm font-medium"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="premium-card hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=abiola&size=48&backgroundColor=374151"
                    alt="Abiola"
                    className="w-12 h-12 rounded-full ring-2 ring-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      Abiola
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Business Owner
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="p-2 rounded-xl hover:bg-primary/10 text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110"
                    title="Sign out"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 lg:hidden`}>
        <div className="flex h-full flex-col overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '0 24px 24px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}>

          {/* Logo & Brand */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-border/10 relative">
            <div className="flex items-center">
              <div className="fade-in">
                <h1 className="text-xl font-black text-foreground">Miela CRM</h1>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Business System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3 relative overflow-y-auto custom-scrollbar">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center transition-all duration-300 rounded-xl p-3 mb-2 ${
                    isActive
                      ? 'bg-primary/20 border border-primary/30 shadow-lg'
                      : 'hover:bg-muted/20 hover:border-muted/30 border border-transparent'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 mr-4 ${
                    isActive
                      ? 'bg-primary shadow-lg'
                      : 'bg-muted/20 hover:bg-muted/30'
                  }`}>
                    <item.icon size={20} className={isActive ? 'text-black' : 'text-yellow-400'} />
                  </div>
                  <div className="fade-in flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${
                      isActive ? 'text-primary' : 'text-white'
                    }`}>{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border/10 p-4 relative">
            <div className="premium-card hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  {/* Cartoon avatar for app user (Abiola) */}
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="text-black">
                    <circle cx="16" cy="16" r="16" fill="#FFB800"/>
                    <circle cx="16" cy="14" r="10" fill="#FDD835"/>
                    <circle cx="13" cy="12" r="1.5" fill="#333"/>
                    <circle cx="19" cy="12" r="1.5" fill="#333"/>
                    <path d="M12 16c0 2 1.8 3 4 3s4-1 4-3" stroke="#333" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                    <circle cx="16" cy="8" r="6" fill="#8D6E63"/>
                    <path d="M10 6c0-3 2.7-6 6-6s6 3 6 6" fill="#6D4C41"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    Abiola
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Business Owner
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="p-2 rounded-xl hover:bg-primary/10 text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110"
                  title="Sign out"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 xxs:p-1 ${
        sidebarCollapsed ? 'lg:ml-20 lg:pl-4' : 'lg:ml-80 lg:pl-4'
      }`}>
        {/* Glass Morphism Header */}
        <header className="sticky top-0 z-20" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}>
          <div className="flex h-16 items-center justify-between px-2 xxs:px-1 xs:px-4 sm:px-6 lg:justify-end lg:pl-0 lg:pr-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 xxs:p-1 xs:p-2 sm:p-3 rounded-2xl hover:bg-muted/20 transition-all duration-300 text-primary hover:text-primary/80 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transition-all duration-300 xxs:w-4 xxs:h-4">
                {mobileMenuOpen ? (
                  <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                ) : (
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                )}
              </svg>
            </button>

            {/* Glass Morphism Search - Hide on customers page */}
            {!pathname.includes('/customers') && (
              <form onSubmit={handleSearch} className="flex-1 mr-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary group-focus-within:text-primary/80" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search customers, leads, campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-search w-full pl-12 pr-20 py-3 text-sm lg:text-base rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 hidden sm:block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(253, 198, 0, 0.3)',
                    color: '#080708',
                    boxShadow: '0 4px 16px rgba(253, 198, 0, 0.3)'
                  }}
                >
                  Search
                </button>
              </div>
            </form>
            )}

            {/* Actions & Profile */}
            <div className="flex items-center space-x-4 ml-6">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-foreground">
                  Welcome back, Abiola
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Enhanced Notifications */}
              <button className="relative p-3 rounded-2xl transition-all duration-300 group" style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary group-hover:text-primary/80 transition-colors duration-300">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110" style={{
                  background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(253, 198, 0, 0.3)',
                  color: '#080708',
                  boxShadow: '0 4px 16px rgba(253, 198, 0, 0.4)',
                  animation: 'pulse 2s infinite'
                }}>
                  3
                </div>
              </button>

              {/* Enhanced User Avatar */}
              <div className="relative group cursor-pointer">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=abiola&size=44&backgroundColor=374151"
                  alt="Abiola"
                  className="w-11 h-11 rounded-full ring-2 ring-white/10 transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background transition-all duration-300" style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }}></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with proper spacing for header */}
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6 relative pt-6 lg:pt-8">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>

          <div className="fade-in page-transition relative">
            {children}
          </div>

        </main>
      </div>
    </div>
  )
}