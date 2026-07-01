import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
          {
            default: 'bg-neutral-900 text-white hover:bg-neutral-700',
            outline: 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900',
            ghost: 'hover:bg-neutral-100 text-neutral-900',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
          }[variant],
          {
            default: 'h-9 px-4 py-2',
            sm: 'h-8 px-3 text-xs',
            lg: 'h-10 px-6',
          }[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
