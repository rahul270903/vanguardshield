import React, { useState, useEffect, useRef } from 'react'
import {
  Shield,
  Search,
  Bell,
  Menu,
  ChevronDown,
  Building2,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  LogOut,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Drawer } from '../ui/Drawer'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatRelativeTime } from '../../lib/utils'

export const Header: React.FC = () => {
  const {
    activeAgencyId,
    activePersonaId,
    agencies,
    personas,
    alerts,
    setActiveAgency,
    setActivePersona,
    toggleSidebar,
    omniSearchQuery,
    setOmniSearchQuery,
    acknowledgeAlert,
    resetToFactoryDefaults,
    logout,
  } = useVanguardStore()

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)

  // Global Ctrl+K / Cmd+K listener to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileDropdownOpen])

  return (
    <>
      <header className="h-14 bg-[#0B192C] text-white border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 z-40 select-none shadow-md">
        {/* Left: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1E3E62] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-sm text-white">VANGUARDSHIELD</span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.2 rounded font-mono">
                  UFSOS v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">Unified Federal Security Operating System</p>
            </div>
          </div>
        </div>

        {/* Center: Federal Tenant Selector & Omni-Search */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-2xl mx-3 lg:mx-6">
          {/* Tenant Switcher */}
          <div className="h-8.5 flex items-center gap-1.5 bg-[#12233C] border border-slate-700/80 rounded-md px-2.5 text-xs text-slate-300 shrink-0 max-w-[185px] lg:max-w-[210px] xl:max-w-[240px]">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={activeAgencyId}
              onChange={(e) => setActiveAgency(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs truncate w-full"
              title="Switch Federal Agency Tenant"
            >
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id} className="bg-slate-900 text-white">
                  {agency.code} — {agency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Global Omni-Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={omniSearchQuery}
              onChange={(e) => setOmniSearchQuery(e.target.value)}
              placeholder="Search incidents, call signs, badges... (Ctrl+K)"
              className="w-full h-8.5 bg-[#12233C] border border-slate-700/80 rounded-md pl-8.5 pr-14 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {omniSearchQuery ? (
              <button
                onClick={() => setOmniSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[11px] cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400 border border-slate-700/70 font-mono pointer-events-none">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>

        {/* Right: Telemetry, Notifications, Role Selector & Officer Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Platform Health Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 h-8.5 bg-emerald-950/40 border border-emerald-800/60 rounded-md text-[11px] text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold font-mono">SLO: 99.98%</span>
            <span className="text-slate-400 hidden xl:inline text-[10px]">Nominal</span>
          </div>

          {/* Notification Alert Bell */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative h-8.5 w-8.5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 rounded-md transition-colors cursor-pointer"
            title="Operational Alerts & Alarms"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold animate-pulse shadow-sm">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          {/* Role Impersonator / Simulated Role Selector */}
          <div className="flex items-center gap-1.5 h-8.5 bg-[#12233C] border border-slate-700/80 hover:border-slate-600 rounded-md px-2.5 text-xs transition-colors">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden xl:inline">Role:</span>
            <select
              value={activePersonaId}
              onChange={(e) => setActivePersona(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs max-w-[130px] sm:max-w-[160px] truncate"
              title="Simulate Federal Watch Role"
            >
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id} className="bg-slate-900 text-white">
                  {persona.roleLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Federal Officer PIV Identity Chip */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-8.5 px-2 bg-[#1E3E62] hover:bg-[#254D7B] border border-slate-600 rounded-md flex items-center gap-2 transition-colors cursor-pointer"
              title="Federal Watch Officer Profile"
            >
              <div className="w-6 h-6 rounded bg-cyan-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {activePersona.avatarInitials}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-white leading-none flex items-center gap-1.5">
                  <span className="whitespace-nowrap">{activePersona.name}</span>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-1 py-0.2 rounded font-mono font-bold">PIV</span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Officer Profile & Enclave Card Popover */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3.5 z-50 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-9 h-9 rounded-full bg-cyan-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {activePersona.avatarInitials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{activePersona.name}</p>
                      <p className="text-cyan-400 text-xs font-medium">{activePersona.roleLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge classification={activePersona.clearanceLevel} />
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {activeAgency.code}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> FIPS 201
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-200 font-medium text-right truncate max-w-[170px]">{activePersona.department}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">PIV Card ID:</span>
                    <span className="font-mono text-cyan-400">{activePersona.pivCardId}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Validation Authority:</span>
                    <span className="text-emerald-400 font-mono">FIPS 201 OCSP OK</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Enclave Boundary:</span>
                    <span className="text-amber-400 font-mono">{activeAgency.jurisdiction}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2.5 mt-3 space-y-1">
                  <button
                    onClick={() => {
                      logout()
                      setProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-amber-400 hover:bg-amber-950/40 rounded flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sign Out / Disconnect PIV</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToFactoryDefaults()
                      setProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset Demonstration Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Notifications / Operational Alert Drawer */}
      <Drawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        title="Operational Alerts & Alarms"
        subtitle={`Active incidents & life-safety triggers for ${activeAgency.name}`}
        width="lg"
      >
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded border text-xs ${
                  alert.acknowledged
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-red-50/80 border-red-300'
                    : 'bg-amber-50/80 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge severity={alert.severity} dot pulse={!alert.acknowledged} />
                    <span className="font-semibold text-slate-900">{alert.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-slate-700 text-xs mb-2">{alert.description}</p>
                <div className="text-[11px] text-slate-500 mb-2">
                  <span className="font-medium text-slate-700">Location:</span> {alert.location}
                </div>
                {alert.recommendedPlaybook && (
                  <div className="p-1.5 bg-slate-100 rounded text-[11px] text-slate-700 font-mono mb-2">
                    {alert.recommendedPlaybook}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500">Source: {alert.sourceDomain}</span>
                  {!alert.acknowledged ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge Alert
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Acknowledged by {alert.acknowledgedBy}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No active operational alerts.</p>
          )}
        </div>
      </Drawer>
    </>
  )
}
