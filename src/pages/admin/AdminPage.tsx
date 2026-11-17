import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Users,
  Shield,
  Sliders,
  Settings,
  FileCheck2,
  CheckCircle,
  KeyRound,
  Building,
  Plus,
  Search,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Database,
  FileCode,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  HardDrive,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useVanguardStore } from '../../store/useVanguardStore'
import { UserPersona, AgencyTenant, UserRole } from '../../types/tenant'
import { ClassificationLevel } from '../../types/common'

export const AdminPage: React.FC = () => {
  const { adminSection } = useParams<{ adminSection: string }>()
  const store = useVanguardStore()
  const {
    personas,
    agencies,
    activeAgencyId,
    activePersonaId,
    setActiveAgency,
    setActivePersona,
    resetToFactoryDefaults,
    addToast,
    logAuditEvent,
  } = store

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  const currentSection = adminSection || 'users'
  const [activeTab, setActiveTab] = useState<string>('overview')

  // --- USERS SECTION STATE ---
  const [userList, setUserList] = useState<UserPersona[]>(personas)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [newUserModalOpen, setNewUserModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<UserRole>('DISPATCHER')
  const [newUserRoleLabel, setNewUserRoleLabel] = useState('Senior Dispatcher')
  const [newUserPiv, setNewUserPiv] = useState(`PIV-9902-8812-${Math.floor(100 + Math.random() * 900)}`)
  const [newUserClearance, setNewUserClearance] = useState<ClassificationLevel>('SECRET')
  const [newUserDept, setNewUserDept] = useState('Tactical Operations')

  // --- ROLES & PERMISSIONS STATE ---
  const [rolePermissions, setRolePermissions] = useState([
    {
      role: 'WATCH_COMMANDER',
      label: 'Watch Commander',
      clearance: 'SECRET',
      membersCount: personas.filter(p => p.role === 'WATCH_COMMANDER').length,
      canBroadcast: true,
      canOverridePACS: true,
      canExportDEMS: true,
      canManageUsers: false,
    },
    {
      role: 'DISPATCHER',
      label: 'Dispatcher / Call-Taker',
      clearance: 'CUI',
      membersCount: personas.filter(p => p.role === 'DISPATCHER').length,
      canBroadcast: false,
      canOverridePACS: false,
      canExportDEMS: false,
      canManageUsers: false,
    },
    {
      role: 'SOC_ANALYST',
      label: 'SOC Cyber Analyst',
      clearance: 'SECRET',
      membersCount: personas.filter(p => p.role === 'SOC_ANALYST').length,
      canBroadcast: false,
      canOverridePACS: false,
      canExportDEMS: false,
      canManageUsers: false,
    },
    {
      role: 'SYSTEM_ADMIN',
      label: 'System Administrator',
      clearance: 'TOP SECRET',
      membersCount: personas.filter(p => p.role === 'SYSTEM_ADMIN').length,
      canBroadcast: true,
      canOverridePACS: true,
      canExportDEMS: true,
      canManageUsers: true,
    },
    {
      role: 'EVIDENCE_CUSTODIAN',
      label: 'Evidence Custodian',
      clearance: 'SECRET',
      membersCount: personas.filter(p => p.role === 'EVIDENCE_CUSTODIAN').length,
      canBroadcast: false,
      canOverridePACS: false,
      canExportDEMS: true,
      canManageUsers: false,
    },
    {
      role: 'AUDITOR_PRIVACY',
      label: 'Privacy / OIG Auditor',
      clearance: 'SECRET',
      membersCount: personas.filter(p => p.role === 'AUDITOR_PRIVACY').length,
      canBroadcast: false,
      canOverridePACS: false,
      canExportDEMS: true,
      canManageUsers: false,
    },
  ])

  // --- AGENCY TENANT STATE ---
  const [tenantList, setTenantList] = useState<AgencyTenant[]>(agencies)
  const [selectedTenantId, setSelectedTenantId] = useState<string>(activeAgencyId)
  const currentSelectedTenant = tenantList.find(t => t.id === selectedTenantId) || activeAgency
  const [cadBridgeEnabled, setCadBridgeEnabled] = useState(true)
  const [interopShareAudio, setInteropShareAudio] = useState(true)
  const [crossDomainFedcon, setCrossDomainFedcon] = useState(false)

  // --- SYSTEM CONFIGURATION STATE ---
  const [fipsMode, setFipsMode] = useState(true)
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(15)
  const [failedLoginLockout, setFailedLoginLockout] = useState(3)
  const [pqcEnforced, setPqcEnforced] = useState(true)
  const [auditLogRetentionYears, setAuditLogRetentionYears] = useState(7)
  const [ntpServerHost, setNtpServerHost] = useState('time.nist.gov')

  // --- COMPLIANCE & REPORTS STATE ---
  const [reportsList, setReportsList] = useState([
    {
      id: 'RPT-2026-Q1',
      title: 'FedRAMP High Continuous Monitoring (ConMon)',
      framework: 'NIST SP 800-53 Rev 5',
      date: '2026-03-31',
      status: 'AUDITED & VALIDATED',
      score: '100% (421/421 Controls)',
      type: 'PDF / JSON',
    },
    {
      id: 'RPT-2026-CJIS',
      title: 'CJIS Security Policy v5.9 Compliance Package',
      framework: 'FBI CJIS CSP v5.9',
      date: '2026-02-28',
      status: 'AUDITED & VALIDATED',
      score: '100% Hardware 2FA & FIPS Cryptography',
      type: 'PDF',
    },
    {
      id: 'RPT-2026-FIPS',
      title: 'FIPS 140-3 Cryptographic Module Benchmark',
      framework: 'NIST CMVP Level 3',
      date: '2026-01-15',
      status: 'CERTIFIED',
      score: 'AES-256-GCM + ML-KEM-768 Verified',
      type: 'PDF / JSON',
    },
    {
      id: 'RPT-2026-SLA',
      title: 'Platform High Availability & Subsystem SLA Report',
      framework: 'Federal Mission SLA 99.99%',
      date: '2026-04-01',
      status: 'NOMINAL',
      score: '99.98% Actual Uptime (All 16 Apps)',
      type: 'PDF',
    },
  ])

  // Section Headers & Metadata
  const sectionMeta: Record<string, {
    number: string
    title: string
    subtitle: string
    icon: React.ReactNode
    standards: string
    badge: string
    kpis: { label: string; value: string; detail: string; status?: string }[]
    tabs: { id: string; label: string; icon: React.ReactNode }[]
  }> = {
    users: {
      number: 'ADMIN 01',
      title: 'User & Credential Directory (FIPS 201)',
      subtitle: 'Authoritative personnel registry, PIV smart card hardware bindings, and clearance assurance',
      icon: <Users className="w-5 h-5" />,
      standards: 'FIPS 201-3 // NIST SP 800-63-3 (IAL3 / AAL3)',
      badge: 'PIV / CAC Directory',
      kpis: [
        { label: 'Total Registered Personnel', value: `${userList.length}`, detail: 'Authoritative Agency Store', status: 'text-slate-900' },
        { label: 'Validated PIV Tokens', value: `${userList.length} Valid`, detail: '100% Hardware Key Bound', status: 'text-emerald-600' },
        { label: 'Secret / Top Secret Cleared', value: `${userList.filter(u => u.clearanceLevel === 'SECRET' || u.clearanceLevel === 'TOP SECRET').length}`, detail: 'Federal Investigation Passed', status: 'text-blue-600' },
        { label: 'Active Sessions', value: '8 Online', detail: 'Mutual TLS 1.3 Active', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'User Directory', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'provision', label: 'Credential Lifecycle', icon: <KeyRound className="w-3.5 h-3.5" /> },
      ],
    },
    roles: {
      number: 'ADMIN 02',
      title: 'Roles, Entitlements & ABAC Permissions Matrix',
      subtitle: 'Granular job-function permissions, multi-custody quorum rules, and separation of duties',
      icon: <Shield className="w-5 h-5" />,
      standards: 'NIST SP 800-53 AC-2 / AC-3 / AC-5',
      badge: 'ABAC / RBAC Matrix',
      kpis: [
        { label: 'Authoritative Security Roles', value: `${rolePermissions.length} Defined`, detail: 'Strict separation of duties', status: 'text-slate-900' },
        { label: 'Dual-Custody Quorum Gates', value: '4 Enforced', detail: 'Root keys, mass alerts, DEMS', status: 'text-emerald-600' },
        { label: 'Top Secret Entitled Roles', value: '1 Role', detail: 'System Admin only', status: 'text-blue-600' },
        { label: 'Least-Privilege Audit', value: 'PASSED', detail: 'Zero unmapped permissions', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Role Permissions Matrix', icon: <Shield className="w-3.5 h-3.5" /> },
        { id: 'privileges', label: 'Privilege Boundaries', icon: <Lock className="w-3.5 h-3.5" /> },
      ],
    },
    agency: {
      number: 'ADMIN 03',
      title: 'Agency & Multi-Tenant Partition Settings',
      subtitle: 'Jurisdiction boundaries, data-sharing agreements, CAD bridges, and default security enclaves',
      icon: <Building className="w-5 h-5" />,
      standards: 'FedRAMP High Multi-Tenancy // CJIS Part 5',
      badge: 'Multi-Tenant Isolation',
      kpis: [
        { label: 'Configured Federal Tenants', value: `${tenantList.length} Tenants`, detail: 'FPS, USSS, FEMA, CBP, FBI', status: 'text-slate-900' },
        { label: 'Active Tenant Context', value: currentSelectedTenant.code, detail: currentSelectedTenant.name, status: 'text-emerald-600' },
        { label: 'Total Field Units Deployed', value: `${tenantList.reduce((acc, t) => acc + t.totalUnits, 0)} Units`, detail: 'Across all partitions', status: 'text-blue-600' },
        { label: 'Tenant SOC Health State', value: 'NOMINAL', detail: '100% cryptographic separation', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Tenant Registry', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'jurisdiction', label: 'Jurisdiction & CAD Bridges', icon: <Sliders className="w-3.5 h-3.5" /> },
      ],
    },
    config: {
      number: 'ADMIN 04',
      title: 'System Configuration & Security Baselines',
      subtitle: 'FIPS 140-3 cryptography parameters, session timeouts, and drift detection controls',
      icon: <Settings className="w-5 h-5" />,
      standards: 'FIPS 140-3 Level 3 // NIST SP 800-128',
      badge: 'FIPS 140-3 Baseline',
      kpis: [
        { label: 'Cryptographic Engine Mode', value: fipsMode ? 'FIPS 140-3' : 'STANDARD', detail: 'HSM Cryptographic Root', status: fipsMode ? 'text-emerald-600' : 'text-amber-600' },
        { label: 'Post-Quantum Crypto', value: pqcEnforced ? 'ML-KEM ACTIVE' : 'DISABLED', detail: 'Hybrid Kyber Algorithm', status: pqcEnforced ? 'text-blue-600' : 'text-slate-500' },
        { label: 'Session Idle Timeout', value: `${sessionTimeoutMin} Minutes`, detail: 'Mandatory CAC/PIV re-auth', status: 'text-slate-900' },
        { label: 'Config Drift Check', value: 'SYNCED', detail: 'Zero deviation from baseline', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Cryptographic Baselines', icon: <Settings className="w-3.5 h-3.5" /> },
        { id: 'timeouts', label: 'Session & Lockout Policies', icon: <Clock className="w-3.5 h-3.5" /> },
      ],
    },
    reports: {
      number: 'ADMIN 05',
      title: 'Federal Compliance & Operational SLA Reports',
      subtitle: 'Continuous monitoring metrics, FedRAMP High audit packages, and CJIS certificates',
      icon: <FileCheck2 className="w-5 h-5" />,
      standards: 'FedRAMP High // CJIS 5.9 // NIST SP 800-53',
      badge: 'FedRAMP High 99.99%',
      kpis: [
        { label: 'Authoritative Compliance Audits', value: `${reportsList.length} Reports`, detail: 'Signed by Independent Assessor (3PAO)', status: 'text-slate-900' },
        { label: 'NIST Controls Passed', value: '421 / 421', detail: '100% FedRAMP High Baseline', status: 'text-emerald-600' },
        { label: 'Platform Availability SLA', value: '99.98%', detail: 'Exceeds 99.95% Federal SLA', status: 'text-blue-600' },
        { label: 'Audit Package Export', value: 'SIGNED', detail: 'FIPS 140-3 Tamper-Evident SHA-256', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Compliance Reports Registry', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
        { id: 'export', label: 'Package Export & Verification', icon: <Download className="w-3.5 h-3.5" /> },
      ],
    },
  }

  const meta = sectionMeta[currentSection] || sectionMeta.users

  // Handlers
  const handleCreateUser = () => {
    if (!newUserName) return
    const initials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const newUser: UserPersona = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      role: newUserRole,
      roleLabel: newUserRoleLabel,
      agencyId: activeAgency.id,
      pivCardId: newUserPiv,
      clearanceLevel: newUserClearance,
      department: newUserDept,
      avatarInitials: initials || 'US',
    }

    setUserList(prev => [newUser, ...prev])
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.roleLabel,
      action: 'USER_CREDENTIAL_PROVISIONED',
      targetEntity: 'UserDirectory',
      targetId: newUser.pivCardId,
      outcome: 'SUCCESS',
      purpose: `New PIV credential bound and provisioned for ${newUser.name} under ${activeAgency.code} authority.`,
    })

    addToast({
      title: 'Personnel Provisioned',
      message: `${newUser.name} enrolled with PIV token ${newUser.pivCardId}.`,
      type: 'success',
    })

    setNewUserModalOpen(false)
    setNewUserName('')
  }

  const handleDeactivateUser = (user: UserPersona) => {
    setUserList(prev => prev.filter(u => u.id !== user.id))
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.roleLabel,
      action: 'USER_CREDENTIAL_DEACTIVATED',
      targetEntity: 'UserDirectory',
      targetId: user.pivCardId,
      outcome: 'SUCCESS',
      purpose: `Personnel ${user.name} decommissioned from active directory. PIV credentials revoked.`,
    })
    addToast({
      title: 'Credential Decommissioned',
      message: `${user.name} removed from active federal directory.`,
      type: 'warning',
    })
  }

  const handleTogglePermission = (roleName: string, field: 'canBroadcast' | 'canOverridePACS' | 'canExportDEMS' | 'canManageUsers') => {
    setRolePermissions(prev =>
      prev.map(r => {
        if (r.role === roleName) {
          const next = !r[field]
          addToast({
            title: 'Entitlement Mutated',
            message: `${r.label} -> [${field}] set to ${next ? 'ALLOWED' : 'REVOKED'}.`,
            type: next ? 'info' : 'warning',
          })
          return { ...r, [field]: next }
        }
        return r
      })
    )
  }

  const handleSaveSystemConfig = () => {
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.roleLabel,
      action: 'SYSTEM_CONFIGURATION_COMMITTED',
      targetEntity: 'PlatformConfig',
      targetId: 'Baseline-2026',
      outcome: 'SUCCESS',
      purpose: `System security baseline synchronized: FIPS Mode=${fipsMode}, PQC=${pqcEnforced}, SessionTimeout=${sessionTimeoutMin}m.`,
    })
    addToast({
      title: 'System Configuration Saved',
      message: 'Cryptographic security baselines synchronized across all 16 platform subsystems.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {meta.number} // {meta.badge}
                </span>
                <span className="text-xs text-slate-400">{meta.standards}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Administration Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {meta.title}
              </h1>
              <p className="text-xs text-slate-400">
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentSection === 'users' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNewUserModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision New Personnel</span>
              </Button>
            )}
            {currentSection === 'config' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSystemConfig}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </Button>
            )}
            {currentSection === 'reports' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => addToast({ title: 'Full Compliance Bundle Exported', message: 'Signed FedRAMP High audit zip created.', type: 'success' })}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Compliance Archive</span>
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetToFactoryDefaults()
                addToast({ title: 'State Re-synchronized', message: 'Demo seed baseline refreshed.', type: 'info' })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Reset Demo State</span>
            </Button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          {meta.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {meta.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <div className="text-slate-500 text-xs mb-1 font-medium">{kpi.label}</div>
            <div className={`text-xl font-bold font-mono ${kpi.status || 'text-slate-900'}`}>
              {kpi.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{kpi.detail}</div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. USERS & CREDENTIAL DIRECTORY */}
      {/* ========================================================= */}
      {currentSection === 'users' && (
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Authoritative Personnel Registry</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative government credentials tied to NIST SP 800-63-3 identity assurance levels</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <Input
                    placeholder="Search personnel..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 text-xs h-8 w-44"
                  />
                </div>
                <Select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs h-8"
                >
                  <option value="ALL">All Roles</option>
                  <option value="WATCH_COMMANDER">Watch Commander</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                  <option value="SOC_ANALYST">SOC Analyst</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {userList
                  .filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.pivCardId.toLowerCase().includes(userSearch.toLowerCase()))
                  .filter(u => userRoleFilter === 'ALL' || u.role === userRoleFilter)
                  .map((user) => (
                    <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {user.avatarInitials}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                            <span className="font-mono text-cyan-800 text-xs">({user.pivCardId})</span>
                            <Badge classification={user.clearanceLevel} />
                            <Badge variant="nominal" dot>ACTIVE</Badge>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {user.roleLabel} • {user.department} • Tenant Enclave: <span className="font-mono text-slate-700">{user.agencyId}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActivePersona(user.id)
                            addToast({ title: 'Active Persona Switched', message: `Now simulating operations as ${user.name}.`, type: 'info' })
                          }}
                          className={`text-xs ${user.id === activePersonaId ? 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold' : 'text-slate-700'}`}
                        >
                          {user.id === activePersonaId ? 'Current Persona' : 'Switch To User'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user)}
                          className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                        >
                          Decommission
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ROLES & ABAC PERMISSIONS */}
      {/* ========================================================= */}
      {currentSection === 'roles' && (
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">ABAC Job-Function Entitlement Matrix</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Toggle operational privileges across administrative and mission execution boundaries</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Security Role</th>
                      <th className="p-3.5">Assigned Members</th>
                      <th className="p-3.5 text-center">Mass Broadcast</th>
                      <th className="p-3.5 text-center">PACS Lockdown</th>
                      <th className="p-3.5 text-center">Export DEMS</th>
                      <th className="p-3.5 text-center">Manage Personnel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rolePermissions.map((rp) => (
                      <tr key={rp.role} className="hover:bg-slate-50/80">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{rp.label}</span>
                          <span className="font-mono text-[10px] text-slate-400">{rp.role}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono">
                          {rp.membersCount} Active Personnel
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(rp.role, 'canBroadcast')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              rp.canBroadcast ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rp.canBroadcast ? 'ALLOWED' : 'DENIED'}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(rp.role, 'canOverridePACS')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              rp.canOverridePACS ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rp.canOverridePACS ? 'ALLOWED' : 'DENIED'}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(rp.role, 'canExportDEMS')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              rp.canExportDEMS ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rp.canExportDEMS ? 'ALLOWED' : 'DENIED'}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(rp.role, 'canManageUsers')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              rp.canManageUsers ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rp.canManageUsers ? 'ALLOWED' : 'DENIED'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. AGENCY TENANT SETTINGS */}
      {/* ========================================================= */}
      {currentSection === 'agency' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Tenant Partitions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {tenantList.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => setSelectedTenantId(tenant.id)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                        selectedTenantId === tenant.id ? 'bg-blue-50/60 font-semibold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{tenant.name}</span>
                        <span className="font-mono text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                          {tenant.code}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{tenant.jurisdiction}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    {currentSelectedTenant.name} Configuration
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Partition settings, default markings, and CAD inter-agency bridges</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveAgency(currentSelectedTenant.id)
                    addToast({ title: 'Active Tenant Switched', message: `Now managing ${currentSelectedTenant.name} enclave.`, type: 'success' })
                  }}
                  className="text-xs font-semibold"
                >
                  Set as Active Operational Enclave
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-xs pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-bold text-slate-700 block mb-1">Default Security Enclave Marking</span>
                    <Badge classification={currentSelectedTenant.defaultClassification} />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-bold text-slate-700 block mb-1">Assigned Jurisdiction Area</span>
                    <span className="font-mono text-cyan-900">{currentSelectedTenant.jurisdiction}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    Inter-Agency Sharing Bridges
                  </span>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                    <div>
                      <span className="font-semibold text-slate-800">Automated CAD Cross-Dispatch Bridge</span>
                      <p className="text-slate-500 text-[11px]">Sync high-priority calls to municipal 911 dispatch centers</p>
                    </div>
                    <button
                      onClick={() => setCadBridgeEnabled(!cadBridgeEnabled)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        cadBridgeEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cadBridgeEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                    <div>
                      <span className="font-semibold text-slate-800">Critical Connect P25 Talkgroup Audio Bridge</span>
                      <p className="text-slate-500 text-[11px]">Permit mutual-aid radio patch across agency repeaters</p>
                    </div>
                    <button
                      onClick={() => setInteropShareAudio(!interopShareAudio)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        interopShareAudio ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {interopShareAudio ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SYSTEM CONFIGURATION */}
      {/* ========================================================= */}
      {currentSection === 'config' && (
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Cryptographic &amp; Security Baselines (FIPS 140-3 Level 3)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">FIPS 140-3 Strict Cryptographic Mode</span>
                    <button
                      onClick={() => setFipsMode(!fipsMode)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        fipsMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {fipsMode ? 'ENFORCED' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-slate-600">Disallow non-approved cryptographic ciphers across all internal microservices and database engines.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Post-Quantum Cryptography (PQC)</span>
                    <button
                      onClick={() => setPqcEnforced(!pqcEnforced)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        pqcEnforced ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {pqcEnforced ? 'ML-KEM ACTIVE' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-slate-600">Enforce NIST FIPS 203 Module-Lattice Key Encapsulation Mechanism alongside classic RSA/ECDSA.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Inactivity Lockout</label>
                  <Select
                    value={sessionTimeoutMin.toString()}
                    onChange={(e) => setSessionTimeoutMin(parseInt(e.target.value))}
                    className="w-full text-xs"
                  >
                    <option value="5">5 Minutes (Ultra Strict)</option>
                    <option value="15">15 Minutes (NIST Standard)</option>
                    <option value="30">30 Minutes</option>
                  </Select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Failed Login Attempts Threshold</label>
                  <Select
                    value={failedLoginLockout.toString()}
                    onChange={(e) => setFailedLoginLockout(parseInt(e.target.value))}
                    className="w-full text-xs"
                  >
                    <option value="3">3 Attempts (Account Lockout)</option>
                    <option value="5">5 Attempts</option>
                  </Select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Atomic Clock Sync Source (NTP)</label>
                  <Input
                    value={ntpServerHost}
                    onChange={(e) => setNtpServerHost(e.target.value)}
                    className="w-full text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. COMPLIANCE & SLA REPORTS */}
      {/* ========================================================= */}
      {currentSection === 'reports' && (
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Federal Compliance &amp; Continuous Monitoring Audit Registry</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative assessments validating FedRAMP High, CJIS v5.9, and FIPS 140-3 adherence</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast({ title: 'Compliance Scan Dispatched', message: 'Triggered automated 421-control continuous assessment.', type: 'info' })}
              >
                Trigger ConMon Assessment
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {reportsList.map((rpt) => (
                  <div key={rpt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{rpt.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">({rpt.id})</span>
                        <Badge variant="nominal" dot>{rpt.status}</Badge>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5">
                        Framework: <span className="font-semibold text-slate-800">{rpt.framework}</span> • Benchmark: <span className="font-mono text-cyan-800">{rpt.score}</span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Assessment Date: {rpt.date} • Format: {rpt.type}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addToast({ title: 'Report Downloaded', message: `Downloaded ${rpt.title} (${rpt.type}).`, type: 'success' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Export {rpt.type}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: PROVISION NEW PERSONNEL */}
      <Modal
        isOpen={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        title="Provision Authorized Personnel & PIV Credential"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Enroll authoritative personnel record with mutual cryptographic PIV hardware smart card serial number.
          </p>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Special Agent John Doe"
              className="text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Operational Role</label>
              <Select
                value={newUserRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole
                  setNewUserRole(role)
                  if (role === 'WATCH_COMMANDER') setNewUserRoleLabel('Watch Commander')
                  else if (role === 'DISPATCHER') setNewUserRoleLabel('Emergency Dispatcher')
                  else if (role === 'SOC_ANALYST') setNewUserRoleLabel('SOC Cyber Analyst')
                  else if (role === 'SYSTEM_ADMIN') setNewUserRoleLabel('System Administrator')
                }}
                className="w-full text-xs"
              >
                <option value="DISPATCHER">Dispatcher</option>
                <option value="WATCH_COMMANDER">Watch Commander</option>
                <option value="SOC_ANALYST">SOC Analyst</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
                <option value="EVIDENCE_CUSTODIAN">Evidence Custodian</option>
                <option value="AUDITOR_PRIVACY">Privacy Auditor</option>
              </Select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Security Clearance</label>
              <Select
                value={newUserClearance}
                onChange={(e) => setNewUserClearance(e.target.value as ClassificationLevel)}
                className="w-full text-xs"
              >
                <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                <option value="CUI">CUI // FEDCON</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
                <option value="TOP SECRET">TOP SECRET // SCI</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">PIV Smart Card Serial Number</label>
            <Input
              value={newUserPiv}
              onChange={(e) => setNewUserPiv(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Department / Assigned Division</label>
            <Input
              value={newUserDept}
              onChange={(e) => setNewUserDept(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNewUserModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateUser} disabled={!newUserName}>
              Provision Credential
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminPage
