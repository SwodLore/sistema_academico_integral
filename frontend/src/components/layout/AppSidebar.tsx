import { Link, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { getNavLinks } from '@/config/navLinks'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const links = getNavLinks(user.rol)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card',
          'transition-[width] duration-300 ease-in-out sticky top-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn('flex h-16 shrink-0 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-3')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onToggle} className="size-9 p-0">
                  <PanelLeftOpen className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Módulos</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <span className="truncate text-sm font-semibold text-foreground">Módulos</span>
              <Button variant="ghost" size="sm" onClick={onToggle} className="size-9 shrink-0 p-0">
                <PanelLeftClose className="size-4" />
                <span className="sr-only">Contraer módulos</span>
              </Button>
            </>
          )}
        </div>

        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to

              const item = (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center rounded-md text-sm font-medium transition-colors',
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span
                    className={cn(
                      'truncate whitespace-nowrap transition-all duration-300 ease-in-out',
                      collapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={link.to}>
                    <TooltipTrigger asChild>{item}</TooltipTrigger>
                    <TooltipContent side="right">{link.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return item
            })}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}
