'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  firstName?: string
  lastName?: string
  userId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ firstName, lastName, userId, size = 'md', className }: AvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  // Generate initials fallback
  const getInitials = () => {
    const first = (firstName || '').charAt(0).toUpperCase()
    const last = (lastName || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // Generate DiceBear avatar URL with robust fallback
  useEffect(() => {
    if (!firstName && !lastName && !userId) return

    const seed = userId || `${firstName || ''}-${lastName || ''}`.toLowerCase().replace(/\s+/g, '-')
    const sizeMap = { sm: 32, md: 40, lg: 48 }
    const avatarSize = sizeMap[size]

    // Use more reliable DiceBear styles
    const styles = ['avataaars', 'personas', 'initials']
    const selectedStyle = styles[Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % styles.length]

    const url = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&size=${avatarSize}&backgroundColor=374151&radius=50`

    // Test image load with timeout
    const img = new Image()
    const timeout = setTimeout(() => {
      setImageError(true)
    }, 3000) // 3 second timeout

    img.onload = () => {
      clearTimeout(timeout)
      setImageUrl(url)
      setImageLoaded(true)
      setImageError(false)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      setImageError(true)
    }

    img.src = url

    return () => {
      clearTimeout(timeout)
    }
  }, [firstName, lastName, userId, size])

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

  // Show DiceBear image if loaded, otherwise show initials
  if (imageLoaded && imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
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

  // Fallback to initials
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