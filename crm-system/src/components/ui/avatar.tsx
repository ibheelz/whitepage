'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  firstName?: string
  lastName?: string
  userId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ firstName, lastName, userId, size = 'md', className }: AvatarProps) {
  // Always use initials to avoid DiceBear API timeouts completely
  const useInitials = true

  // Generate initials fallback
  const getInitials = () => {
    const first = (firstName || '').charAt(0).toUpperCase()
    const last = (lastName || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // No external API calls - use custom initials only

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

  // Always show custom initials (no external API calls)
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