'use client'

import { useState } from 'react'
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
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon, description: 'Identity Graph' },
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

      {/* Wider Sidebar - Always Visible on Desktop */}
      <div className="fixed inset-y-0 left-0 z-30 w-80 hidden lg:block">
        <div className="flex h-full flex-col" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '0 24px 24px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>

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
          <nav className="flex-1 px-4 py-6 space-y-3 relative">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-nav-item group relative ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary shadow-lg'
                      : 'bg-muted/20 hover:bg-muted/30'
                  }`}>
                    <item.icon size={20} className={isActive ? 'text-black' : 'text-yellow-400'} />
                  </div>
                  <div className="fade-in flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
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
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                  <UserIcon size={20} className="text-black" />
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

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 lg:hidden`}>
        <div className="flex h-full flex-col" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '0 24px 24px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
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
          <nav className="flex-1 px-4 py-6 space-y-3 relative">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-nav-item group relative ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary shadow-lg'
                      : 'bg-muted/20 hover:bg-muted/30'
                  }`}>
                    <item.icon size={20} className={isActive ? 'text-black' : 'text-yellow-400'} />
                  </div>
                  <div className="fade-in flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
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
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                  <UserIcon size={20} className="text-black" />
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
      <div className="transition-all duration-300 lg:ml-80">
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
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-2xl hover:bg-muted/20 transition-all duration-300 text-primary hover:text-primary/80 lg:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transition-all duration-300">
                {mobileMenuOpen ? (
                  <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                ) : (
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                )}
              </svg>
            </button>

            {/* Glass Morphism Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary group-focus-within:text-primary/80" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search users, leads, campaigns..."
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
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{
                  background: 'linear-gradient(135deg, rgba(253, 198, 0, 0.9), rgba(253, 198, 0, 0.7))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(253, 198, 0, 0.3)',
                  boxShadow: '0 8px 32px rgba(253, 198, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                  <UserIcon size={20} className="text-black" />
                </div>
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