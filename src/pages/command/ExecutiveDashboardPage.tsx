import React, { useState } from 'react'
import {
  ShieldAlert,
  Radio,
  BellRing,
  Activity,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Clock,
  ShieldCheck,
  Send,
  UserCheck,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { IncidentRecord, AIDecisionRecommendation } from '../../types/command'
import { formatDateTime, formatRelativeTime } from '../../lib/utils'

export const ExecutiveDashboardPage: React.FC = () => {
  const {
    incidents,
    alerts,
    serviceHealth,
    agencies,
    activeAgencyId,
    personas,
    activePersonaId,
    aiRecommendations,
    radios,
    addIncident,
    updateIncidentStatus,
    assignUnitToIncident,
    addToast,
    logAuditEvent,
  } = useVanguardStore()

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null)
  const [newIncidentModalOpen, setNewIncidentModalOpen] = useState(false)
  const [assignUnitModalOpen, setAssignUnitModalOpen] = useState(false)
  const [unitToAssign, setUnitToAssign] = useState('UNIT-Echo-2')
  const [selectedIncidentForUnit, setSelectedIncidentForUnit] = useState<string | null>(null)
  const [incidentPriorityFilter, setIncidentPriorityFilter] = useState<string>('ALL')
  const [defconLevel, setDefconLevel] = useState<'DEFCON 4' | 'DEFCON 3' | 'DEFCON 2'>('DEFCON 4')

  // Incident Intake Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'PHYSICAL_SECURITY_BREACH',
    priority: 'P1_CRITICAL' as IncidentRecord['priority'],
    address: '1800 F Street NW, Federal Complex B',
    zone: 'Zone 4 - Server Vault Outer Corridor',
    summary: '',
  })

  // Hourly operational trend data for Recharts
  const trendData = [
    { hour: '08:00', incidents: 1, alerts: 3, avgResponseSec: 42 },
    { hour: '10:00', incidents: 2, alerts: 6, avgResponseSec: 38 },
    { hour: '12:00', incidents: 4, alerts: 8, avgResponseSec: 35 },
    { hour: '14:00', incidents: 3, alerts: 5, avgResponseSec: 40 },
    { hour: '16:00', incidents: 5, alerts: 11, avgResponseSec: 32 },
    { hour: '18:00', incidents: 4, alerts: 7, avgResponseSec: 29 },
    { hour: '20:00', incidents: incidents.length, alerts: alerts.length, avgResponseSec: 28 },
  ]

  // Source domain distribution data
  const domainAlertData = [
    { name: 'PACS Access', count: 4, fill: '#0D9488' },
    { name: 'VMS Optical', count: 3, fill: '#2563EB' },
    { name: 'C-UAS Radar', count: 2, fill: '#7C3AED' },
    { name: 'SOC Cyber', count: 3, fill: '#DC2626' },
    { name: 'P25 Radio', count: 2, fill: '#D97706' },
  ]

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const newInc: IncidentRecord = {
      id: 'inc-' + Math.floor(1000 + Math.random() * 9000),
      trackingNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      status: 'DISPATCHED',
      location: {
        address: formData.address,
        coordinates: [38.8977, -77.0365],
        zone: formData.zone,
        jurisdiction: activeAgency.jurisdiction,
      },
      agencyId: activeAgency.id,
      openedAt: new Date().toISOString(),
      assignedUnits: ['UNIT-Echo-1', 'FPS-Patrol-402'],
      linkedEntities: {},
      commander: activePersona.name,
      summary: formData.summary || 'Immediate tactical dispatch authorized under standard operating procedure.',
      classification: activeAgency.defaultClassification,
    }

    addIncident(newInc)
    setNewIncidentModalOpen(false)
    setFormData({
      title: '',
      type: 'PHYSICAL_SECURITY_BREACH',
      priority: 'P1_CRITICAL',
      address: '1800 F Street NW, Federal Complex B',
      zone: 'Zone 4 - Server Vault Outer Corridor',
      summary: '',
    })
  }

  const handleAssignUnit = () => {
    if (selectedIncidentForUnit && unitToAssign) {
      assignUnitToIncident(selectedIncidentForUnit, unitToAssign)
      setAssignUnitModalOpen(false)
      if (selectedIncident && selectedIncident.id === selectedIncidentForUnit) {
        setSelectedIncident({
          ...selectedIncident,
          assignedUnits: [...selectedIncident.assignedUnits, unitToAssign],
        })
      }
    }
  }

  const handleAuthorizeAIRec = (rec: AIDecisionRecommendation) => {
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.role,
      action: 'AI_RECOMMENDATION_AUTHORIZE',
      targetEntity: 'IncidentRecord',
      targetId: rec.incidentId,
      outcome: 'SUCCESS',
      purpose: `Authorized AI recommendation: ${rec.suggestedAction}`,
    })
    addToast({
      title: 'Tactical Action Authorized',
      message: `Executed AI recommendation for ${rec.incidentId}: ${rec.suggestedAction}`,
      type: 'success',
    })
  }

  const filteredIncidents =
    incidentPriorityFilter === 'ALL'
      ? incidents
      : incidents.filter((i) => i.priority === incidentPriorityFilter)

  const incidentColumns: Column<IncidentRecord>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      sortable: true,
      className: 'w-32 font-mono font-bold text-cyan-800',
    },
    {
      key: 'title',
      header: 'Incident Title & Summary',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-[11px] text-slate-500 truncate max-w-md">
            {row.location.address} • {row.summary}
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (row) => (
        <Badge
          severity={
            row.priority === 'P1_CRITICAL'
              ? 'CRITICAL'
              : row.priority === 'P2_HIGH'
              ? 'HIGH'
              : row.priority === 'P3_MEDIUM'
              ? 'MEDIUM'
              : 'LOW'
          }
        >
          {row.priority.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'CAD Status',
      sortable: true,
      render: (row) => {
        const styles: Record<string, string> = {
          NEW: 'bg-red-50 text-red-700 border-red-200',
          TRIAGED: 'bg-blue-50 text-blue-700 border-blue-200',
          DISPATCHED: 'bg-amber-50 text-amber-700 border-amber-200',
          ON_SCENE: 'bg-purple-50 text-purple-700 border-purple-200',
          CONTAINED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              styles[row.status] || 'bg-slate-100'
            }`}
          >
            {row.status.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      key: 'assignedUnits',
      header: 'Tactical Units',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.assignedUnits.map((u) => (
            <span
              key={u}
              className="px-1.5 py-0.2 bg-blue-50 text-blue-800 rounded text-[10px] font-mono border border-blue-200 font-semibold"
            >
              {u}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIncidentForUnit(row.id)
              setAssignUnitModalOpen(true)
            }}
          >
            Dispatch
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIncident(row)
            }}
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Executive Command Banner with DEFCON Threat Posture */}
      <div className="bg-gradient-to-r from-[#070F1E] via-[#0B192C] to-[#1E3E62] text-white p-5 rounded-lg shadow-lg border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Interactive DEFCON Posture Switcher */}
            <div className="flex items-center gap-1 bg-black/40 border border-slate-700 rounded p-0.5">
              {(['DEFCON 4', 'DEFCON 3', 'DEFCON 2'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setDefconLevel(lvl)
                    addToast({
                      title: 'DEFCON Threat Posture Changed',
                      message: `Federal operational readiness set to: ${lvl}`,
                      type: lvl === 'DEFCON 2' ? 'error' : lvl === 'DEFCON 3' ? 'warning' : 'info',
                    })
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono cursor-pointer transition-colors ${
                    defconLevel === lvl
                      ? lvl === 'DEFCON 2'
                        ? 'bg-red-600 text-white animate-pulse'
                        : lvl === 'DEFCON 3'
                        ? 'bg-amber-600 text-white'
                        : 'bg-cyan-800 text-cyan-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <Badge classification={activeAgency.defaultClassification} />
            <span className="text-[11px] font-mono text-cyan-400">
              OPERATIONAL COMMANDER: {activePersona.name}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            {activeAgency.name} — Federal Mission Operations Center
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Operating under {activeAgency.subAgency} • Jurisdiction: {activeAgency.jurisdiction}
          </p>
        </div>

        {/* Global Command Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="teal"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setNewIncidentModalOpen(true)}
          >
            New CAD Incident
          </Button>

          <Button
            variant="outline"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => {
              logAuditEvent({
                agencyId: activeAgency.id,
                actor: activePersona.name,
                actorRole: activePersona.role,
                action: 'SHIFT_REPORT_EXPORT',
                targetEntity: 'CommandSummary',
                targetId: 'SHIFT-' + new Date().toISOString().substring(0, 10),
                outcome: 'SUCCESS',
                purpose: 'Cryptographically signed operational shift handover export',
              })
              addToast({
                title: 'Export Generated',
                message: 'Shift Summary & SHA-256 Manifest downloaded successfully',
                type: 'success',
              })
            }}
          >
            Export Shift Report
          </Button>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="interactive" onClick={() => setIncidentPriorityFilter('P1_CRITICAL')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Incidents
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {incidents.length}
              </h3>
              <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                <span>{incidents.filter((i) => i.priority === 'P1_CRITICAL').length} Priority 1 (Critical)</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Deployed Field Units
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {activeAgency.totalUnits}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>{radios.length} P25 AES-256 Online</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Radio className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Operational Alerts
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {alerts.length}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <span>{alerts.filter((a) => !a.acknowledged).length} Unacknowledged</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <BellRing className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Platform Availability
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                99.98%
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>All 16 Subsystems Nominal</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Trend & Telemetry Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Velocity & Dispatch Response Times Area Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                  <span>Incident Velocity & Dispatch Response Latency</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  12-hour trailing telemetry: incoming incident volume vs average time to unit dispatch
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Avg Dispatch: 28s (Target: &lt;45s)
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B192C" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0B192C" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B192C',
                        color: '#FFF',
                        borderRadius: 6,
                        fontSize: 12,
                        border: 'none',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      name="Active Incidents"
                      stroke="#0B192C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorIncidents)"
                    />
                    <Area
                      type="monotone"
                      dataKey="avgResponseSec"
                      name="Response Time (sec)"
                      stroke="#0D9488"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLatency)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-Domain Sensor & Alarm Distribution Bar Chart */}
        <div>
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Alarms by Domain</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Sensor triggers across defense layers</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainAlertData} layout="vertical" margin={{ top: 5, right: 15, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B192C',
                        color: '#FFF',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" name="Alarm Count" radius={[0, 4, 4, 0]}>
                      {domainAlertData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI-Assisted Decision Support & Tactical Recommendations (Section 5 of Blueprint) */}
      <Card className="border-l-4 border-l-cyan-600 bg-gradient-to-r from-cyan-50/40 via-white to-white">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded text-cyan-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  AI-Assisted Decision Support & Anomaly Correlation
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Automated sensor fusion and tactical action recommendations (NIST SP 800-53 Human-in-the-Loop)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded">
              ADVISORY ONLY // HUMAN MUST SIGN
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 bg-white border border-slate-200 rounded-md shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                      {rec.incidentId.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Confidence: {rec.confidenceScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.rationale}</p>

                <div className="p-2 bg-slate-50 rounded text-xs font-semibold text-slate-800 flex items-center justify-between gap-2 border border-slate-200">
                  <span className="truncate">Suggested: {rec.suggestedAction}</span>
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => handleAuthorizeAIRec(rec)}
                  >
                    Authorize Action
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Affected: {rec.affectedAssets.join(', ')}</span>
                  <span>{rec.advisoryDisclaimer}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Active Incidents Table & Subsystem Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Active Operational Incidents (CAD)
              </h2>
              <p className="text-xs text-slate-500">
                Live inter-agency dispatch coordination and tactical responder status
              </p>
            </div>

            {/* Priority Filter Tabs */}
            <div className="flex items-center gap-1">
              {['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM'].map((pri) => (
                <button
                  key={pri}
                  onClick={() => setIncidentPriorityFilter(pri)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                    incidentPriorityFilter === pri
                      ? 'bg-[#0B192C] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pri.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={incidentColumns}
            data={filteredIncidents}
            keyField="id"
            pageSize={5}
            onRowClick={(row) => setSelectedIncident(row)}
            searchPlaceholder="Search active incidents by tracking #, keyword, location..."
          />
        </div>

        {/* Subsystem Health Status (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Subsystem Telemetry
              </h2>
              <p className="text-xs text-slate-500">Real-time health, latency and event brokers</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-slate-100">
              {serviceHealth.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">{item.serviceName}</span>
                    <Badge status={item.status} dot />
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{item.details}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Latency: {item.latencyMs}ms</span>
                    <span>Uptime: {item.availabilityPct}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Slide-Over Drawer for Incident Details & Multi-Agency Linkages */}
      <Drawer
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.trackingNumber || 'Incident Details'}
        subtitle={selectedIncident?.title}
        width="xl"
        footer={
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedIncident) {
                    setSelectedIncidentForUnit(selectedIncident.id)
                    setAssignUnitModalOpen(true)
                  }
                }}
              >
                Dispatch Additional Unit
              </Button>
              {selectedIncident?.status !== 'CLOSED' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedIncident) {
                      updateIncidentStatus(selectedIncident.id, 'CLOSED')
                      setSelectedIncident(null)
                    }
                  }}
                >
                  Close Incident & File AAR
                </Button>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSelectedIncident(null)}>
              Dismiss
            </Button>
          </div>
        }
      >
        {selectedIncident && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Status & Priority Row */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
              <Badge severity={selectedIncident.priority === 'P1_CRITICAL' ? 'CRITICAL' : 'HIGH'}>
                {selectedIncident.priority.replace('_', ' ')}
              </Badge>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-800">CAD Status: {selectedIncident.status}</span>
              <span className="text-slate-400">|</span>
              <Badge classification={selectedIncident.classification} />
            </div>

            {/* Location & Jurisdiction */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Facility & Jurisdiction
              </h4>
              <p className="font-semibold text-slate-800">{selectedIncident.location.address}</p>
              <p className="text-slate-500">{selectedIncident.location.zone}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Coordinates: {selectedIncident.location.coordinates.join(', ')} • {selectedIncident.location.jurisdiction}
              </p>
            </div>

            {/* Narrative Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Command Narrative & Orders
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed text-slate-800">
                {selectedIncident.summary}
              </div>
            </div>

            {/* Assigned Units */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Assigned Responders & Talkgroups
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedIncident.assignedUnits.map((unit) => (
                  <span
                    key={unit}
                    className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded font-mono font-semibold"
                  >
                    {unit}
                  </span>
                ))}
              </div>
            </div>

            {/* Cross-Module Linked Records */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Interconnected Evidence & Sensor Records
              </h4>
              <div className="space-y-1.5">
                {selectedIncident.linkedEntities.callSessionId && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <span>NG911 Emergency Call: {selectedIncident.linkedEntities.callSessionId}</span>
                    <span className="text-cyan-700 font-mono font-medium">96% Location Conf</span>
                  </div>
                )}
                {selectedIncident.linkedEntities.cameraIds?.map((cam) => (
                  <div key={cam} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <span>VMS Camera Stream: {cam}</span>
                    <span className="text-emerald-700 font-mono font-medium">4K 60fps Active</span>
                  </div>
                ))}
                {selectedIncident.linkedEntities.pacsEventId && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <span>PACS Access Reader: {selectedIncident.linkedEntities.pacsEventId}</span>
                    <span className="text-red-700 font-mono font-medium">TAMPER TRIGGER</span>
                  </div>
                )}
                {selectedIncident.linkedEntities.evidenceIds?.map((evd) => (
                  <div key={evd} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <span>DEMS Evidence Vault: {evd}</span>
                    <span className="text-purple-700 font-mono font-medium">SHA-256 Validated</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal Dialog for New CAD Incident Intake */}
      <Modal
        isOpen={newIncidentModalOpen}
        onClose={() => setNewIncidentModalOpen(false)}
        title="Intake New CAD Incident"
        subtitle="Create validated mission operational record"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewIncidentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleCreateIncident}>
              Authorize & Dispatch Units
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <Input
            label="Incident Title"
            placeholder="e.g. Unauthorized Vehicle in South Gate Sally Port"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as IncidentRecord['priority'] })
              }
              options={[
                { value: 'P1_CRITICAL', label: 'P1 - Life Safety / Critical' },
                { value: 'P2_HIGH', label: 'P2 - High Threat' },
                { value: 'P3_MEDIUM', label: 'P3 - Medium Operational' },
                { value: 'P4_LOW', label: 'P4 - Low / Routine' },
              ]}
            />

            <Select
              label="Incident Category"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'PHYSICAL_SECURITY_BREACH', label: 'Physical Security Breach' },
                { value: 'AIRSPACE_INTRUSION', label: 'C-UAS Airspace Intrusion' },
                { value: 'CYBER_ATTACK_OT', label: 'Cyber / OT SCADA Event' },
                { value: 'DIGNITARY_PROTECTION', label: 'Dignitary Protection' },
              ]}
            />
          </div>

          <Input
            label="Facility Address / Location"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <Input
            label="Specific Zone / Corridor"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Operational Narrative
            </label>
            <textarea
              className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Describe observations, caller info, and immediate tactical orders..."
            />
          </div>
        </form>
      </Modal>

      {/* Modal Dialog for Dispatching Additional Unit */}
      <Modal
        isOpen={assignUnitModalOpen}
        onClose={() => setAssignUnitModalOpen(false)}
        title="Dispatch Tactical Unit to Incident"
        subtitle="Select available responder from P25 radio fleet"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleAssignUnit}>
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <Select
            label="Select Available Tactical Unit"
            value={unitToAssign}
            onChange={(e) => setUnitToAssign(e.target.value)}
            options={[
              { value: 'UNIT-Echo-2', label: 'UNIT-Echo-2 (Field Tactical Team B) - Sugarloaf' },
              { value: 'FPS-Patrol-408', label: 'FPS-Patrol-408 (Officer Miller) - Downtown' },
              { value: 'K9-Security-Bravo', label: 'K9-Security-Bravo (Canine Handler) - Sector 2' },
              { value: 'USSS-Prot-Lead', label: 'USSS-Prot-Lead (Special Agent In Charge) - Perimeter Alpha' },
            ]}
          />

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
            <span className="font-bold block mb-1">P25 Dispatch Encryption Binding</span>
            <p className="text-[11px] text-blue-800">
              Assigned unit will automatically subscribe to incident talkgroup{' '}
              <span className="font-mono font-bold">TG-101-FPS-TAC-1</span> with OTAR AES-256 keying.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
