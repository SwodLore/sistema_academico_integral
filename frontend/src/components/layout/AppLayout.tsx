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
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
