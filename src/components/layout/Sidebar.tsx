import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  AlertOctagon,
  BellRing,
  Activity,
  CheckSquare,
  FileText,
  PhoneCall,
  Video,
  KeyRound,
  Compass,
  Radio,
  FileCheck2,
  Mic,
  Megaphone,
  RadioTower,
  Camera,
  Server,
  Smartphone,
  ShieldCheck,
  Wrench,
  ShieldAlert,
  Network,
  Users,
  Lock,
  Workflow,
  Database,
  Sliders,
  Settings,
  Shield,
  ChevronRight,
  ChevronDown,
  Search,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { cn } from '../../lib/utils'

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number | string
  badgeVariant?: 'red' | 'amber' | 'blue' | 'gray'
}

interface NavSection {
  title: string
  items: NavItem[]
}

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { sidebarCollapsed, alerts, tasks } = useVanguardStore()
  const [filterQuery, setFilterQuery] = useState('')

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Command Center': true,
    'Mission Applications': true,
    'Shared Platform Services': false,
    'System Administration': false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length
  const pendingTasksCount = tasks.filter((t) => t.status === 'WAITING_APPROVAL').length

  const navigationSections: NavSection[] = [
    {
      title: 'Command Center',
      items: [
        {
          name: 'Executive Mission Dashboard',
          path: '/command/executive',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Common Operating Picture',
          path: '/command/cop',
          icon: <Map className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Incident Management',
          path: '/command/incidents',
          icon: <AlertOctagon className="w-4 h-4 shrink-0" />,
          badge: 4,
          badgeVariant: 'red',
        },
        {
          name: 'Operational Alerts',
          path: '/command/alerts',
          icon: <BellRing className="w-4 h-4 shrink-0" />,
          badge: unacknowledgedCount > 0 ? unacknowledgedCount : undefined,
          badgeVariant: 'amber',
        },
        {
          name: 'Service Health Console',
          path: '/command/health',
          icon: <Activity className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Mission Tasks & Approvals',
          path: '/command/tasks',
          icon: <CheckSquare className="w-4 h-4 shrink-0" />,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          badgeVariant: 'blue',
        },
        {
          name: 'Operational Audit Ledger',
          path: '/command/audit',
          icon: <FileText className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Mission Applications',
      items: [
        {
          name: '01. NG911 / Emergency Calls',
          path: '/apps/ng911',
          icon: <PhoneCall className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'red',
        },
        {
          name: '02. Video Intelligence / VMS',
          path: '/apps/vms',
          icon: <Video className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '03. Physical Access / PIV',
          path: '/apps/pacs',
          icon: <KeyRound className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '04. Situational Intel / COP',
          path: '/apps/situational-intel',
          icon: <Compass className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '05. MANET Tactical Comms',
          path: '/apps/manet',
          icon: <Radio className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '06. Digital Evidence (DEMS)',
          path: '/apps/dems',
          icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '07. Unified Communications',
          path: '/apps/unified-comm',
          icon: <Mic className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '08. Emergency Mass Notification',
          path: '/apps/mass-notification',
          icon: <Megaphone className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'red',
        },
        {
          name: '09. P25 Smart Radio Fleet',
          path: '/apps/p25-fleet',
          icon: <RadioTower className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '10. VRSM / Body-Worn Video',
          path: '/apps/vrsm-bwc',
          icon: <Camera className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '11. On-Prem P25 Infrastructure',
          path: '/apps/p25-infrastructure',
          icon: <Server className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '12. Secure Mobile / MDM',
          path: '/apps/mobile-endpoint',
          icon: <Smartphone className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '13. CSfC Trusted Integration',
          path: '/apps/csfc-integration',
          icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '14. Managed Device Operations',
          path: '/apps/device-operations',
          icon: <Wrench className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '15. Cybersecurity / SOC',
          path: '/apps/cybersecurity-soc',
          icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
        {
          name: '16. Critical Connect Interop',
          path: '/apps/critical-connect',
          icon: <Network className="w-4 h-4 shrink-0" />,
          badge: 'Live',
          badgeVariant: 'blue',
        },
      ],
    },
    {
      title: 'Shared Platform Services',
      items: [
        {
          name: 'Identity & PIV Validation',
          path: '/services/identity',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Zero Trust & Security Policy',
          path: '/services/security-policy',
          icon: <Lock className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Integration Fabric & APIs',
          path: '/services/integrations',
          icon: <Workflow className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Workflow & Approval Inbox',
          path: '/services/workflows',
          icon: <CheckSquare className="w-4 h-4 shrink-0" />,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          badgeVariant: 'amber',
        },
        {
          name: 'Unified Notification Center',
          path: '/services/notifications',
          icon: <BellRing className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Data Governance & Legal Hold',
          path: '/services/governance',
          icon: <Database className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Tamper-Evident Audit Ledger',
          path: '/services/audit',
          icon: <FileText className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'System Administration',
      items: [
        {
          name: 'User & Credential Directory',
          path: '/admin/users',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Roles & ABAC Permissions',
          path: '/admin/roles',
          icon: <Shield className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Agency Tenant Settings',
          path: '/admin/agency',
          icon: <Sliders className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'System Configuration',
          path: '/admin/config',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Compliance & SLA Reports',
          path: '/admin/reports',
          icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ]

  const badgeStyles = {
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    gray: 'bg-slate-700 text-slate-300',
  }

  return (
    <aside
      className={cn(
        'bg-[#070F1E] text-slate-300 border-r border-slate-800 transition-all duration-200 flex flex-col shrink-0 select-none overflow-hidden z-30',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Search Modules Filter Input (When Expanded) */}
      {!sidebarCollapsed && (
        <div className="p-2.5 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Jump to module..."
              className="w-full bg-[#0B192C] border border-slate-700/80 rounded pl-8 pr-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto dark-scroll py-2 px-2 space-y-4">
        {navigationSections.map((section) => {
          const filteredItems = section.items.filter((item) =>
            item.name.toLowerCase().includes(filterQuery.toLowerCase())
          )

          if (filteredItems.length === 0) return null

          return (
            <div key={section.title} className="space-y-1">
              {/* Section Header */}
              {!sidebarCollapsed ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                >
                  <span>{section.title}</span>
                  {expandedSections[section.title] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              ) : (
                <div className="h-2" />
              )}

              {/* Items List */}
              {(sidebarCollapsed || expandedSections[section.title] || filterQuery) && (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={sidebarCollapsed ? item.name : undefined}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors group relative cursor-pointer',
                            isActive
                              ? 'bg-[#1E3E62] text-white font-medium shadow-xs border-l-2 border-l-cyan-400'
                              : 'text-slate-300 hover:bg-[#0B192C] hover:text-white'
                          )
                        }
                      >
                        <div
                          className={cn(
                            'transition-colors',
                            isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                          )}
                        >
                          {item.icon}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 ml-1',
                                  badgeStyles[item.badgeVariant || 'gray']
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Collapsed Active Indicator Pill */}
                        {sidebarCollapsed && isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-400 rounded-l" />
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
