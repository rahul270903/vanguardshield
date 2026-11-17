import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Shield, Clock } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../ui/Badge'

export const BreadcrumbBar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { classificationLevel } = useVanguardStore()

  // Generate breadcrumb segments from pathname
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getSectionTitle = (seg: string): string => {
    switch (seg) {
      case 'command':
        return 'Command Center'
      case 'apps':
        return 'Mission Applications'
      case 'services':
        return 'Shared Platform Services'
      case 'admin':
        return 'System Administration'
      case 'executive':
        return 'Executive Mission Dashboard'
      case 'cop':
        return 'Common Operating Picture'
      case 'incidents':
        return 'Incident & Emergency Management'
      case 'alerts':
        return 'Operational Alerts'
      case 'health':
        return 'Service Health Console'
      case 'tasks':
        return 'Mission Tasks & Approvals'
      case 'audit':
        return 'Operational Audit Ledger'
      case 'ng911':
        return 'NG911 Emergency Calls'
      case 'vms':
        return 'Video Intelligence / VMS'
      case 'pacs':
        return 'Physical Access / PIV'
      case 'situational-intel':
        return 'Situational Intelligence / COP'
      case 'manet':
        return 'MANET Tactical Comms'
      case 'dems':
        return 'Digital Evidence (DEMS)'
      case 'unified-comm':
        return 'Unified Communications'
      case 'mass-notification':
        return 'Emergency Mass Notification'
      case 'p25-fleet':
        return 'P25 Smart Radio Fleet'
      case 'vrsm-bodyworn':
        return 'VRSM / Body-Worn Video'
      case 'p25-infrastructure':
        return 'On-Prem P25 Infrastructure'
      case 'mobile-endpoint':
        return 'Secure Mobile / MDM'
      case 'csfc-integration':
        return 'CSfC Trusted Integration'
      case 'device-operations':
        return 'Managed Device Operations'
      case 'cybersecurity-soc':
        return 'Cybersecurity / SOC'
      case 'critical-connect':
        return 'Critical Connect Interop'
      case 'identity':
        return 'Identity & PIV Validation'
      case 'security-policy':
        return 'Zero Trust & Security Policy'
      case 'integrations':
        return 'Integration Fabric & APIs'
      case 'workflows':
        return 'Workflow & Approval Inbox'
      case 'notifications':
        return 'Unified Notification Center'
      case 'governance':
        return 'Data Governance & Legal Hold'
      case 'users':
        return 'User & Credential Directory'
      case 'roles':
        return 'Roles & ABAC Permissions'
      case 'agency':
        return 'Agency Tenant Settings'
      case 'config':
        return 'System Configuration'
      case 'reports':
        return 'Compliance & SLA Reports'
      default:
        return seg.charAt(0).toUpperCase() + seg.slice(1)
    }
  }

  return (
    <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs select-none shadow-2xs">
      {/* Left: Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer mr-1"
          title="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium">
          Home
        </Link>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const title = getSectionTitle(value)

          return (
            <React.Fragment key={to}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                  {title}
                </span>
              ) : (
                <Link to={to} className="text-slate-500 hover:text-slate-800 font-medium truncate">
                  {title}
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Right: Security Classification Indicator & UTC Clock */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{new Date().toISOString().substring(11, 19)} UTC</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <Badge classification={classificationLevel} />
      </div>
    </div>
  )
}
