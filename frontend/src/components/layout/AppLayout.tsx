import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'

const SIDEBAR_KEY = 'uncp-sidebar-collapsed'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  function toggleSidebar() {
    setCollapsed((value) => !value)
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
