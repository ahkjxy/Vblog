'use client'

import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'overlay'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div
      className={cn(
        'inline-block rounded-full border-solid border-gray-300 border-t-purple-600 animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// Loading overlay for specific containers
export function LoadingOverlay({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        <LoadingSpinner size="lg" />
      </div>
      {children}
    </div>
  )
}
