import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'warning' | 'info' | 'success' | 'destructive'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        {
          default: 'bg-neutral-100 text-neutral-800',
          warning: 'bg-yellow-100 text-yellow-800',
          info: 'bg-blue-100 text-blue-800',
          success: 'bg-green-100 text-green-800',
          destructive: 'bg-red-100 text-red-800',
        }[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
