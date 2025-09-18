'use client'

import { useState } from 'react'
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

  // Generate initials fallback
  const getInitials = () => {
    const first = (firstName || '').charAt(0).toUpperCase()
    const last = (lastName || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // Generate avatar URL
  const generateAvatarUrl = () => {
    const seed = userId || `${firstName || ''}-${lastName || ''}`.toLowerCase().replace(/\s+/g, '-')
    const styles = ['avataaars', 'personas', 'identicon', 'initials']
    const selectedStyle = styles[Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % styles.length]

    const sizeMap = { sm: 32, md: 40, lg: 48 }
    const avatarSize = sizeMap[size]

    return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&size=${avatarSize}&backgroundColor=374151`
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

  if (imageError) {
    // Show initials fallback
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