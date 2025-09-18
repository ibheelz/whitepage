'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  firstName?: string
  lastName?: string
  userId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ firstName, lastName, userId, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [useInitials, setUseInitials] = useState(true) // Start with initials

  // Generate initials fallback
  const getInitials = () => {
    const first = (firstName || '').charAt(0).toUpperCase()
    const last = (lastName || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // Test if DiceBear API is accessible with timeout
  useEffect(() => {
    if (!firstName && !lastName && !userId) return

    const testImage = new Image()
    const seed = userId || `${firstName || ''}-${lastName || ''}`.toLowerCase().replace(/\s+/g, '-')
    const timeout = setTimeout(() => {
      // If image doesn't load within 2 seconds, stick with initials
      setUseInitials(true)
    }, 2000)

    testImage.onload = () => {
      clearTimeout(timeout)
      setUseInitials(false) // Switch to avatar if it loads quickly
    }

    testImage.onerror = () => {
      clearTimeout(timeout)
      setUseInitials(true)
    }

    testImage.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&size=32&backgroundColor=374151`
  }, [firstName, lastName, userId])

  // Generate avatar URL
  const generateAvatarUrl = () => {
    const seed = userId || `${firstName || ''}-${lastName || ''}`.toLowerCase().replace(/\s+/g, '-')
    const sizeMap = { sm: 32, md: 40, lg: 48 }
    const avatarSize = sizeMap[size]

    // Use the more reliable initials style from DiceBear
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&size=${avatarSize}&backgroundColor=374151`
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  // Generate consistent background color based on initials
  const getBackgroundColor = () => {
    const initials = getInitials()
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ]
    const colorIndex = initials.charCodeAt(0) % colors.length
    return colors[colorIndex]
  }

  if (useInitials || imageError) {
    // Show custom initials fallback (more reliable than DiceBear)
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white/10',
          sizeClasses[size],
          getBackgroundColor(),
          className
        )}
      >
        {getInitials()}
      </div>
    )
  }

  return (
    <img
      src={generateAvatarUrl()}
      alt={`${firstName || ''} ${lastName || ''}`.trim() || 'User avatar'}
      className={cn(
        'rounded-full ring-2 ring-white/10 object-cover',
        sizeClasses[size],
        className
      )}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}