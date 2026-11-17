import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ClassificationBanner } from './ClassificationBanner'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BreadcrumbBar } from './BreadcrumbBar'
import { StatusBar } from './StatusBar'
import { ToastContainer } from '../ui/Toast'
import { useVanguardStore } from '../../store/useVanguardStore'

export const AppShell: React.FC = () => {
  const { activeFont } = useVanguardStore()

  useEffect(() => {
    document.body.classList.remove('font-inter', 'font-plus-jakarta', 'font-public-sans', 'font-ibm-plex')
    document.body.classList.add(`font-${activeFont}`)
  }, [activeFont])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Top Federal Classification Marking Banner */}
      <ClassificationBanner position="top" />

      {/* Primary Global Navigation Header */}
      <Header />

      {/* Main Operational Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unified Application Sidebar */}
        <Sidebar />

        {/* Viewport Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden">
          {/* Contextual Breadcrumb Bar & Quick Controls */}
          <BreadcrumbBar />

          {/* Active Viewport Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Operational Status Bar */}
      <StatusBar />

      {/* Bottom Federal Classification Marking Banner */}
      <ClassificationBanner position="bottom" />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  )
}
