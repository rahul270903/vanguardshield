import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Megaphone,
  BellRing,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  Radio,
  RadioTower,
  Smartphone,
  Monitor,
  Volume2,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  FileText,
  KeyRound,
  Layers,
  ArrowRight,
  Zap,
  Activity,
  HeartPulse,
  Flame,
  CloudRain,
  Eye,
  Sliders,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import {
  MassNotificationAlert,
  NotificationTemplate,
  DeliveryChannelStatus,
  EvacuationMusterReport,
} from '../../types/modules'
import { SeverityLevel } from '../../types/common'

type MassNotifyTabType =
  | 'dashboard'
  | 'composer'
  | 'channels'
  | 'targeting'
  | 'two-man'
  | 'telemetry'

export default function MassNotificationPage() {
  const [activeTab, setActiveTab] = useState<MassNotifyTabType>('dashboard')
  const [selectedAlertId, setSelectedAlertId] = useState<string>('notif-001')

  // Modals
  const [isComposerModalOpen, setIsComposerModalOpen] = useState(false)
  const [isTwoManModalOpen, setIsTwoManModalOpen] = useState(false)
  const [alertToAuthorize, setAlertToAuthorize] = useState<MassNotificationAlert | null>(null)

  // Composer Form States
  const [composerTitle, setComposerTitle] = useState('')
  const [composerHeadline, setComposerHeadline] = useState('')
  const [composerDescription, setComposerDescription] = useState('')
  const [composerInstruction, setComposerInstruction] = useState('')
  const [composerEventCode, setComposerEventCode] = useState<MassNotificationAlert['eventCode']>('ACTIVE_SHOOTER')
  const [composerCategory, setComposerCategory] = useState<MassNotificationAlert['category']>('SECURITY')
  const [composerSeverity, setComposerSeverity] = useState<SeverityLevel>('CRITICAL')
  const [composerUrgency, setComposerUrgency] = useState<MassNotificationAlert['urgency']>('IMMEDIATE')
  const [composerCertainty, setComposerCertainty] = useState<MassNotificationAlert['certainty']>('OBSERVED')
  const [composerScope, setComposerScope] = useState<MassNotificationAlert['targetScope']>('CAMPUS_SECTOR')
  const [composerGeofence, setComposerGeofence] = useState('Ronald Reagan Federal Complex & Metro Plaza')
  const [composerChannels, setComposerChannels] = useState<string[]>([
    'SMS_CELLULAR',
    'DESKTOP_TAKEOVER',
    'DIGITAL_SIGNAGE_PA',
    'PUSH_MOBILE',
    'IPAWS_WEA',
  ])
  const [composerRequireTwoMan, setComposerRequireTwoMan] = useState(true)

  // Filter States
  const [alertFilterStatus, setAlertFilterStatus] = useState<string>('ALL')
  const [alertSearch, setAlertSearch] = useState('')

  // Language translation tab in composer
  const [previewLanguage, setPreviewLanguage] = useState<'EN' | 'ES'>('EN')

  // Store Hooks
  const {
    massNotifications,
    notificationTemplates,
    deliveryChannels,
    musterReports,
    createMassNotification,
    authorizeTwoManAlert,
    cancelMassNotification,
    broadcastAlertImmediate,
    acknowledgeAlertSafety,
    updateMusterReportHeadcount,
    activePersonaId,
    personas,
    addToast,
  } = useVanguardStore()

  // Selected Alert
  const selectedAlert = useMemo(() => {
    return massNotifications.find((a) => a.id === selectedAlertId) || massNotifications[0]
  }, [massNotifications, selectedAlertId])

  // Computed metrics
  const activeBroadcastsCount = useMemo(() => massNotifications.filter((a) => a.status === 'BROADCAST_ACTIVE').length, [massNotifications])
  const pendingApprovalsCount = useMemo(() => massNotifications.filter((a) => a.status === 'PENDING_TWO_MAN_APPROVAL').length, [massNotifications])
  const totalDeliveredRecipients = useMemo(() => massNotifications.reduce((acc, curr) => acc + curr.deliveredCount, 0), [massNotifications])
  const totalSafeAccounted = useMemo(() => musterReports.reduce((acc, curr) => acc + curr.safeCount, 0), [musterReports])
  const totalNeedAssistance = useMemo(() => musterReports.reduce((acc, curr) => acc + curr.needAssistanceCount, 0), [musterReports])
  const totalUnaccounted = useMemo(() => musterReports.reduce((acc, curr) => acc + curr.unaccountedCount, 0), [musterReports])

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return massNotifications.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(alertSearch.toLowerCase()) ||
        a.alertCode.toLowerCase().includes(alertSearch.toLowerCase()) ||
        a.headline.toLowerCase().includes(alertSearch.toLowerCase())
      const matchStatus = alertFilterStatus === 'ALL' || a.status === alertFilterStatus
      return matchSearch && matchStatus
    })
  }, [massNotifications, alertSearch, alertFilterStatus])

  // Template loader helper
  const handleLoadTemplate = (template: NotificationTemplate) => {
    setComposerTitle(template.title)
    setComposerHeadline(template.defaultHeadline)
    setComposerDescription(template.defaultDescription)
    setComposerInstruction(template.defaultInstruction)
    setComposerEventCode(template.eventCode)
    setComposerCategory(template.category)
    setComposerSeverity(template.severity)
    setComposerChannels(template.defaultChannels)
    addToast({
      title: 'Emergency Template Loaded',
      message: `Populated standard federal CAP v1.2 parameters for ${template.title}`,
      type: 'info',
    })
  }

  // Handle compose submit
  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!composerHeadline.trim()) return

    const activeUser = personas.find((p) => p.id === activePersonaId)
    const authorName = activeUser ? `${activeUser.name} (${activeUser.roleLabel})` : 'Watch Commander'

    const status: MassNotificationAlert['status'] = composerRequireTwoMan
      ? 'PENDING_TWO_MAN_APPROVAL'
      : 'BROADCAST_ACTIVE'

    createMassNotification({
      title: composerTitle || composerHeadline,
      headline: composerHeadline.toUpperCase(),
      description: composerDescription || composerHeadline,
      instruction: composerInstruction || 'Follow federal emergency warden directions.',
      severity: composerSeverity,
      urgency: composerUrgency,
      certainty: composerCertainty,
      category: composerCategory,
      eventCode: composerEventCode,
      status,
      channels: composerChannels as MassNotificationAlert['channels'],
      targetScope: composerScope,
      geofenceAreaName: composerGeofence,
      authorId: activePersonaId,
      authorName,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      totalRecipients: composerScope === 'ALL_OCCUPANTS' ? 12500 : 4280,
    })

    setIsComposerModalOpen(false)
    if (status === 'PENDING_TWO_MAN_APPROVAL') {
      setActiveTab('two-man')
    } else {
      setActiveTab('dashboard')
    }
  }

  // Toggle channel selection in composer
  const toggleChannel = (channel: string) => {
    setComposerChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-900/60 text-red-300 border border-red-700/50">
                  Mission App 08 // MASS-NOTIFY
                </span>
                <span className="text-xs text-slate-400">IPAWS-OPEN v1.2 / CAP v1.2 OASIS</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  IPAWS / EAS Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Emergency Mass Notification System
              </h1>
              <p className="text-xs text-slate-400">
                FEMA IPAWS EAS &amp; WEA Gateway • Multi-Channel Desktop Takeover • SMS / TTS Voice • Two-Man Dual Custody Authorizations
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('two-man')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Two-Man Approvals ({pendingApprovalsCount})</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleLoadTemplate(notificationTemplates[0])
                setIsComposerModalOpen(true)
              }}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose CAP v1.2 Alert</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Notification Dashboard</span>
            {activeBroadcastsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {activeBroadcastsCount} Live
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('composer')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'composer'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CAP v1.2 Alert Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'channels'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <RadioTower className="w-3.5 h-3.5" />
            <span>Multi-Channel Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('targeting')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'targeting'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Targeting &amp; Geofences</span>
          </button>

          <button
            onClick={() => setActiveTab('two-man')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'two-man'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Two-Man Dual Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Evacuation Muster &amp; Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Broadcasts</span>
            <Megaphone className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeBroadcastsCount}</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live On Air
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Two-Man Pending</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">{pendingApprovalsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dual-Key Required</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Channels Ready</span>
            <RadioTower className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {deliveryChannels.filter((c) => c.status === "ONLINE").length} <span className="text-xs font-normal text-slate-500">/ {deliveryChannels.length}</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">IPAWS • WEA • EAS</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Target Zones</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">4 Zones</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">GIS Polygons Armed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Acknowledge Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700 font-mono">94.8%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: &gt;90% Standard</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>System Posture</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">FEDCON CUI</div>
          <div className="text-[10px] text-slate-500 mt-0.5">CAP v1.2 Authenticated</div>
        </div>
      </div>


{/* ===================================================================== */}
      {/* SCREEN 1: NOTIFICATION DASHBOARD & LAUNCHPAD                          */}
      {/* ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Launchpad Templates & Pre-canned Scenarios (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-red-500/30 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    Instant Emergency Launchpad
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Pre-authorized federal hazard scenarios with standard CAP v1.2 profiles
                  </p>
                </div>
                <Badge variant="critical" className="text-[10px]">
                  RAPID DISPATCH
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {notificationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg bg-background/60 border border-slate-200/70 hover:border-red-500/40 hover:bg-white/90 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {template.eventCode === 'ACTIVE_SHOOTER' ? (
                          <Flame className="w-4 h-4 text-red-400 shrink-0" />
                        ) : template.eventCode === 'SEVERE_WEATHER' ? (
                          <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : template.eventCode === 'HAZMAT_EVACUATION' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <h4 className="font-semibold text-xs text-slate-900 truncate">
                          {template.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {template.defaultHeadline}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLoadTemplate(template)
                        setIsComposerModalOpen(true)
                      }}
                      className="text-xs h-7 px-2.5 text-red-400 border-red-500/30 hover:bg-red-500/10 shrink-0"
                    >
                      Stage Alert →
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Gateway Telemetry Gauge Strip */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="p-3.5 border-b border-slate-200">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Primary Broadcast Channels Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {deliveryChannels.slice(0, 4).map((chan) => (
                  <div
                    key={chan.channelId}
                    className="flex items-center justify-between text-xs p-2 rounded bg-background/50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-medium text-slate-900 truncate">{chan.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      <span className="text-emerald-400">{chan.throughputPerSec} msg/s</span>
                      <span className="text-slate-500">{chan.latencyMs}ms</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Broadcasts Feed & Recipient Accountability (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-red-400" />
                    Active Emergency Broadcasts ({massNotifications.length})
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Real-time CAP v1.2 alerts in dissemination and evacuation tracking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={alertFilterStatus}
                    onChange={(e) => setAlertFilterStatus(e.target.value)}
                    className="bg-background border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="BROADCAST_ACTIVE">Broadcast Active</option>
                    <option value="PENDING_TWO_MAN_APPROVAL">Pending Two-Man</option>
                    <option value="EXPIRED">Expired / Cleared</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-white/80 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-red-400">
                            {alert.alertCode}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">
                            {alert.headline}
                          </h4>
                          <Badge
                            variant={
                              alert.status === 'BROADCAST_ACTIVE'
                                ? 'critical'
                                : alert.status === 'PENDING_TWO_MAN_APPROVAL'
                                ? 'warning'
                                : 'neutral'
                            }
                            className="text-[10px]"
                          >
                            {alert.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {alert.description}
                        </p>
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">
                          INSTRUCTION: {alert.instruction}
                        </div>
                      </div>

                      {/* Top Action Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {alert.status === 'PENDING_TWO_MAN_APPROVAL' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setAlertToAuthorize(alert)
                              setIsTwoManModalOpen(true)
                            }}
                            className="text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Dual Authorize
                          </Button>
                        ) : alert.status === 'BROADCAST_ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMassNotification(alert.id, 'Watch Commander Cancelled')}
                            className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                          >
                            Cancel Alert
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Dissemination & Telemetry Progress */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Delivery Scope: {alert.geofenceAreaName || alert.targetScope}</span>
                        <span className="font-mono text-slate-900">
                          {alert.deliveredCount.toLocaleString()} / {alert.totalRecipients.toLocaleString()} Delivered ({Math.round((alert.deliveredCount / (alert.totalRecipients || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{
                            width: `${(alert.acknowledgedSafeCount / (alert.totalRecipients || 1)) * 100}%`,
                          }}
                          title="Acknowledged Safe"
                        />
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{
                            width: `${(alert.acknowledgedAssistanceCount / (alert.totalRecipients || 1)) * 100}%`,
                          }}
                          title="Need Assistance"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-0.5">
                        <span className="text-emerald-400 font-mono">
                          ✓ {alert.acknowledgedSafeCount} Marked Safe
                        </span>
                        <span className="text-rose-400 font-mono">
                          ⚠ {alert.acknowledgedAssistanceCount} Assistance Needed
                        </span>
                        <span className="text-slate-500 font-mono">
                          Auth: {alert.secondAuthorizerName ? alert.secondAuthorizerName.split(' ')[0] : 'Pending IC'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Recipient Check-in Simulation */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Recipient Responder Check-In:
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlertSafety(alert.id, 'SAFE')}
                          className="text-xs h-7 px-2.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Mark Self Safe
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlertSafety(alert.id, 'NEED_ASSISTANCE')}
                          className="text-xs h-7 px-2.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          <HeartPulse className="w-3.5 h-3.5 mr-1" />
                          Request Help
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: ALERT AUTHORING & CAP v1.2 / IPAWS COMPOSER                 */}
      {/* ===================================================================== */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Builder (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-400" />
                    OASIS CAP v1.2 & IPAWS Message Composer
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Construct federated XML broadcast packages conforming to FEMA IPAWS-OPEN specifications
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadTemplate(notificationTemplates[0])}
                    className="text-xs h-7"
                  >
                    Reset to Shooter Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <form onSubmit={handleCreateAlertSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Incident / Alert Title (Internal Reference)
                    </label>
                    <Input
                      value={composerTitle}
                      onChange={(e) => setComposerTitle(e.target.value)}
                      placeholder="e.g. Ronald Reagan Building West Gate Security Intrusion"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-900">
                        Public Alert Headline (Max 140 Characters for WEA 2.0 / EAS)
                      </label>
                      <span className={`text-[10px] font-mono ${
                        composerHeadline.length > 140 ? 'text-red-400 font-bold' : 'text-slate-500'
                      }`}>
                        {composerHeadline.length} / 140 chars
                      </span>
                    </div>
                    <Input
                      value={composerHeadline}
                      onChange={(e) => setComposerHeadline(e.target.value)}
                      placeholder="e.g. SECURITY EMERGENCY: LOCKDOWN ORDER FOR RRB COMPLEX"
                      className="font-bold text-red-400 uppercase tracking-wide"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Event Code
                      </label>
                      <Select
                        value={composerEventCode}
                        onChange={(e) => setComposerEventCode(e.target.value as MassNotificationAlert['eventCode'])}
                      >
                        <option value="ACTIVE_SHOOTER">Active Shooter</option>
                        <option value="FACILITY_LOCKDOWN">Facility Lockdown</option>
                        <option value="HAZMAT_EVACUATION">Hazmat Evacuation</option>
                        <option value="SHELTER_IN_PLACE">Shelter in Place</option>
                        <option value="SEVERE_WEATHER">Severe Weather</option>
                        <option value="ALL_CLEAR">All Clear</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Severity
                      </label>
                      <Select
                        value={composerSeverity}
                        onChange={(e) => setComposerSeverity(e.target.value as SeverityLevel)}
                      >
                        <option value="CRITICAL">Critical (Immediate Danger)</option>
                        <option value="HIGH">High (Threat to Property/Life)</option>
                        <option value="MEDIUM">Medium (Precautionary)</option>
                        <option value="LOW">Low (Informational / All Clear)</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Category
                      </label>
                      <Select
                        value={composerCategory}
                        onChange={(e) => setComposerCategory(e.target.value as MassNotificationAlert['category'])}
                      >
                        <option value="SECURITY">Security / Law Enforcement</option>
                        <option value="SAFETY">General Safety</option>
                        <option value="HEALTH">Hazardous Materials / CBRN</option>
                        <option value="ENV">Environmental / Weather</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Event Description
                    </label>
                    <textarea
                      rows={3}
                      value={composerDescription}
                      onChange={(e) => setComposerDescription(e.target.value)}
                      placeholder="Detailed operational context and nature of hazard..."
                      className="w-full bg-background border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-900 block mb-1">
                      Protective Action Instructions (Actionable Guidance)
                    </label>
                    <textarea
                      rows={2}
                      value={composerInstruction}
                      onChange={(e) => setComposerInstruction(e.target.value)}
                      placeholder="e.g. Lock interior doors. Extinguish lights. Remain low to ground..."
                      className="w-full bg-background border border-red-500/40 rounded-md p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />
                  </div>

                  {/* Channel Gateways Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-900 block mb-2">
                      Active Dissemination Gateways
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'SMS_CELLULAR', label: 'FirstNet SMS Cellular', icon: Smartphone },
                        { id: 'DESKTOP_TAKEOVER', label: 'Desktop HUD Takeover', icon: Monitor },
                        { id: 'DIGITAL_SIGNAGE_PA', label: 'Digital Signage / PA', icon: Volume2 },
                        { id: 'PUSH_MOBILE', label: 'Responder Mobile App', icon: Smartphone },
                        { id: 'IPAWS_WEA', label: 'FEMA IPAWS WEA (Cell)', icon: RadioTower },
                        { id: 'IPAWS_EAS', label: 'FEMA IPAWS EAS (Radio)', icon: Radio },
                      ].map((item) => {
                        const active = composerChannels.includes(item.id)
                        const Icon = item.icon
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleChannel(item.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer text-xs flex items-center gap-2 transition-all ${
                              active
                                ? 'bg-red-500/10 border-red-500/50 text-slate-900 font-medium'
                                : 'bg-background/40 border-slate-200 text-slate-500 hover:bg-background/80'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${active ? 'text-red-400' : 'text-slate-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Two-Man Rule Checkbox */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-amber-300 block">
                        Require Two-Man Dual Approval Prior to Broadcast
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Mandatory dual-custody verification by Incident Commander before triggering external IPAWS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={composerRequireTwoMan}
                      onChange={(e) => setComposerRequireTwoMan(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-200 text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {composerRequireTwoMan ? 'Stage for Dual Approval' : 'Authorize Immediate Broadcast'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: CAP v1.2 XML Live Preview & Spanish WEA (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-3.5 border-b border-slate-200 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <CodePreviewIcon className="w-3.5 h-3.5 text-blue-400" />
                  CAP v1.2 OASIS XML Output
                </CardTitle>
                <div className="flex items-center gap-1 bg-background rounded p-0.5 border border-slate-200">
                  <button
                    onClick={() => setPreviewLanguage('EN')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      previewLanguage === 'EN' ? 'bg-muted text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setPreviewLanguage('ES')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      previewLanguage === 'ES' ? 'bg-muted text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Español
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-3.5">
                <pre className="p-3 rounded-lg bg-black/60 border border-slate-200 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[500px]">
{`<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>CAP-2026-${Math.floor(1000 + Math.random() * 9000)}</identifier>
  <sender>DHS-FPS-MOC@dhs.gov</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>${previewLanguage === 'EN' ? 'en-US' : 'es-US'}</language>
    <category>${composerCategory}</category>
    <event>${composerEventCode}</event>
    <urgency>${composerUrgency}</urgency>
    <severity>${composerSeverity}</severity>
    <certainty>${composerCertainty}</certainty>
    <headline>${
      previewLanguage === 'EN'
        ? composerHeadline || 'SECURITY EMERGENCY'
        : 'ALERTA DE SEGURIDAD: EVACUACION INMEDIATA'
    }</headline>
    <description>${
      previewLanguage === 'EN'
        ? composerDescription || 'Operational incident in progress'
        : 'Incidente de seguridad en progreso en las instalaciones federales.'
    }</description>
    <instruction>${
      previewLanguage === 'EN'
        ? composerInstruction || 'Follow federal warden directives'
        : 'Siga las instrucciones del oficial de seguridad federal.'
    }</instruction>
    <area>
      <areaDesc>${composerGeofence}</areaDesc>
      <circle>38.8929,-77.0299,1.5</circle>
    </area>
  </info>
</alert>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3: MULTI-CHANNEL DISTRIBUTION ENGINE                           */}
      {/* ===================================================================== */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-purple-400" />
                Multi-Channel Dissemination Gateways & IPAWS Bridges ({deliveryChannels.length})
              </h3>
              <p className="text-xs text-slate-500">
                FirstNet Band 14 SMS, FEMA IPAWS-OPEN (EAS / WEA), Desktop HUD Takeover, and Enterprise Signage Override
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'All Gateways Diagnostics Passed',
                  message: 'FEMA IPAWS-OPEN and FirstNet SMPP brokers responded nominal (45ms avg latency)',
                  type: 'success',
                })
              }}
              className="text-xs h-7"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Run Gateway Heartbeat Ping
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryChannels.map((channel) => (
              <Card key={channel.channelId} className="border-slate-200 bg-white hover:bg-white/80 transition-all">
                <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {channel.name}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {channel.channelType}
                    </span>
                  </div>
                  <Badge
                    variant={
                      channel.status === 'ONLINE'
                        ? 'nominal'
                        : channel.status === 'STANDBY'
                        ? 'info'
                        : 'warning'
                    }
                    className="text-xs"
                  >
                    {channel.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-2.5 rounded bg-black/40 border border-slate-200 text-xs font-mono text-blue-300 truncate">
                    Provider: {channel.gatewayProvider}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Peak Throughput</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {channel.throughputPerSec} msg/sec
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Broker Latency</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {channel.latencyMs} ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Queue Buffer:</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {channel.queueSize} queued
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 4: TARGETING & GEOGRAPHIC GEOFENCE POLYGONS                    */}
      {/* ===================================================================== */}
      {activeTab === 'targeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Target Zone List & Scope Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-4 border-b border-slate-200">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  Federal Campus & Sector Targeting
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Select predefined federal geofence boundaries or draw incident-linked exclusion zones
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  {
                    name: 'Federal Triangle - Ronald Reagan Complex',
                    zone: 'Zone NCR-01',
                    headcount: 4280,
                    lat: '38.8929° N',
                    lng: '77.0299° W',
                    radius: '1.2 km',
                    active: true,
                  },
                  {
                    name: 'Dept of Commerce Herbert C. Hoover Bldg',
                    zone: 'Zone NCR-02',
                    headcount: 2850,
                    lat: '38.8941° N',
                    lng: '77.0321° W',
                    radius: '0.8 km',
                    active: false,
                  },
                  {
                    name: 'Southwest Border Tactical Compound Alpha',
                    zone: 'Zone SWB-04',
                    headcount: 460,
                    lat: '32.5512° N',
                    lng: '117.0421° W',
                    radius: '5.0 km',
                    active: false,
                  },
                  {
                    name: 'White House Outer Perimeter Zone',
                    zone: 'Zone NCR-SEC-01',
                    headcount: 1200,
                    lat: '38.8977° N',
                    lng: '77.0365° W',
                    radius: '0.5 km',
                    active: false,
                  },
                ].map((sector, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      sector.active
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-slate-200 bg-background/50 hover:bg-background/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">{sector.name}</h4>
                        <span className="text-[11px] font-mono text-slate-500">{sector.zone}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {sector.headcount.toLocaleString()} Occupants
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-2 pt-2 border-t border-slate-200 font-mono">
                      <span>Coords: {sector.lat}, {sector.lng}</span>
                      <span>Radius: {sector.radius}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Geofence Map Graphic / Target Inspection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Target Geofence Polygon Schematic
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Polygon coordinates synchronized with FEMA IPAWS CAP circle and polygon XML attributes
                  </p>
                </div>
                <Badge variant="nominal" className="text-xs">
                  POLYGON LOCKED
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Visual Map Canvas Graphic */}
                <div className="relative h-72 rounded-lg bg-slate-950/80 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Pulsing Geofence Circle Overlay */}
                  <div className="absolute w-56 h-56 rounded-full border-2 border-red-500/60 bg-red-500/10 animate-pulse flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-red-500/40 bg-red-500/20 flex flex-col items-center justify-center">
                      <Flame className="w-6 h-6 text-red-400" />
                      <span className="text-[9px] font-mono text-red-300 font-bold mt-1">HOT ZONE</span>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 border border-slate-200 text-[10px] font-mono text-emerald-400">
                    TARGET: 38.8929° N, 77.0299° W • R=1.2 KM
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 border border-slate-200 text-[10px] font-mono text-slate-900">
                    ESTIMATED HEADCOUNT: 4,280 OCCUPANTS
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Excluded Enclaves:</span>
                    <span className="font-mono text-slate-900">USSS VIP Inner Ring (Protected Sub-Network)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier Cell Tower Sectors (WEA):</span>
                    <span className="font-mono text-emerald-400">14 Sectors Activated (FirstNet + AT&T / VZ)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 5: TWO-MAN RULE AUTHORIZATION & DUAL-CUSTODY REVIEW            */}
      {/* ===================================================================== */}
      {activeTab === 'two-man' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">
                Federal Dual-Custody Two-Man Authorization Protocol (NIST SP 800-53 AC-3)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Emergency mass alerts classified as CRITICAL or HIGH severity targeting broad public populations or external IPAWS-OPEN gateways require cryptographically signed approval from two independent watch commanders before air transmission.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Staged Alerts Awaiting Second Dual Authorization ({pendingApprovalsCount})
            </h3>

            {pendingApprovalsCount === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                No alerts currently pending dual-custody authorization. All critical alerts have been cleared or expired.
              </div>
            ) : (
              massNotifications
                .filter((a) => a.status === 'PENDING_TWO_MAN_APPROVAL')
                .map((alert) => (
                  <Card key={alert.id} className="border-amber-500/40 bg-white/80 shadow-md">
                    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {alert.alertCode}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">
                            {alert.headline}
                          </h4>
                          <Badge variant="warning" className="text-[10px]">
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {alert.eventCode}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {alert.description}
                        </p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 font-mono pt-1">
                          <span>Primary Author: {alert.authorName}</span>
                          <span>•</span>
                          <span>Target: {alert.geofenceAreaName || alert.targetScope}</span>
                          <span>•</span>
                          <span>Channels: {alert.channels.join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelMassNotification(alert.id, 'Authorizer Disapproved')}
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Reject Alert
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setAlertToAuthorize(alert)
                            setIsTwoManModalOpen(true)
                          }}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Review & Sign Dual Approval
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 6: TELEMETRY, ACKNOWLEDGMENT & EVACUATION MUSTER HEATMAP       */}
      {/* ===================================================================== */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Facility Evacuation Muster Reports & Headcount Accountability ({musterReports.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real-time occupant safety acknowledgments, search & rescue queue, and evacuation muster progress
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateMusterReportHeadcount('must-01', 5, 0)
                addToast({
                  title: 'Inbound Muster Telemetry Recorded',
                  message: '5 occupants safely checked in at Northern Assembly Point',
                  type: 'success',
                })
              }}
              className="text-xs h-7"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Simulate Muster Check-In
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {musterReports.map((report) => {
              const accountedPct = Math.round(
                ((report.safeCount + report.needAssistanceCount) / report.totalHeadcount) * 100
              )
              return (
                <Card key={report.id} className="border-slate-200 bg-white">
                  <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {report.facilityName}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-slate-500">
                        {report.zone}
                      </span>
                    </div>
                    <Badge
                      variant={
                        report.status === 'MUSTER_COMPLETE'
                          ? 'nominal'
                          : report.status === 'SEARCH_DISPATCHED'
                          ? 'critical'
                          : 'warning'
                      }
                      className="text-xs"
                    >
                      {report.status.replace(/_/g, ' ')}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-500 block">SAFE & ACCOUNTED</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">
                          {report.safeCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-slate-500 block">ASSISTANCE NEEDED</span>
                        <span className="text-lg font-bold text-rose-400 font-mono">
                          {report.needAssistanceCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] text-slate-500 block">UNACCOUNTED</span>
                        <span className="text-lg font-bold text-amber-400 font-mono">
                          {report.unaccountedCount}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Evacuation Accountability</span>
                        <span className="font-mono text-slate-900 font-semibold">
                          {accountedPct}% Accounted
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{
                            width: `${(report.safeCount / report.totalHeadcount) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-rose-500 h-full"
                          style={{
                            width: `${(report.needAssistanceCount / report.totalHeadcount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Warden Action Controls */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Floor Warden Controls:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMusterReportHeadcount(report.id, 1, 0)}
                          className="text-xs h-7 px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                          +1 Safe
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMusterReportHeadcount(report.id, 0, 1)}
                          className="text-xs h-7 px-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          +1 Help Needed
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: TWO-MAN DUAL AUTHORIZATION MODAL                             */}
      {/* ===================================================================== */}
      {alertToAuthorize && (
        <Modal
          isOpen={isTwoManModalOpen}
          onClose={() => setIsTwoManModalOpen(false)}
          title={`Two-Man Dual Authorization: ${alertToAuthorize.alertCode}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Two-Man Rule Dual Custody Required
              </span>
              <p className="text-[11px] leading-relaxed">
                You are performing the second authorizing signature for{' '}
                <strong>{alertToAuthorize.headline}</strong>.
                Upon authorization, this alert will immediately disseminate to{' '}
                <strong>{alertToAuthorize.totalRecipients.toLocaleString()} occupants</strong> across{' '}
                <strong>{alertToAuthorize.channels.join(', ')}</strong>.
              </p>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Original Author:</span>
                <span className="font-semibold text-slate-900">{alertToAuthorize.authorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Event Code:</span>
                <span className="font-mono text-red-400">{alertToAuthorize.eventCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Geofence:</span>
                <span className="text-slate-900">{alertToAuthorize.geofenceAreaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CAP v1.2 Urgency / Severity:</span>
                <span className="font-mono text-slate-900">{alertToAuthorize.urgency} / {alertToAuthorize.severity}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-900 block">
                Incident Commander Dual-Verification Checklist
              </label>
              <div className="space-y-1.5 text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Confirmed tactical incident correlation in Federal CAD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WEA 140/360-character length compliance and Spanish translation verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PIV Digital Certificate signature will be stamped on immutable ledger</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTwoManModalOpen(false)}
              >
                Abort
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  authorizeTwoManAlert(alertToAuthorize.id)
                  setIsTwoManModalOpen(false)
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Sign & Transmit Broadcast
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: FULL COMPOSER MODAL                                          */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isComposerModalOpen}
        onClose={() => setIsComposerModalOpen(false)}
        title="Compose New Emergency Mass Notification (CAP v1.2)"
      >
        <form onSubmit={handleCreateAlertSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-500 block mb-1">Headline (Max 140 chars for WEA)</label>
            <Input
              value={composerHeadline}
              onChange={(e) => setComposerHeadline(e.target.value)}
              placeholder="e.g. ARMED INTRUSION AT WEST CARGO GATE"
              className="font-bold text-red-400 uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Event Code</label>
              <Select
                value={composerEventCode}
                onChange={(e) => setComposerEventCode(e.target.value as MassNotificationAlert['eventCode'])}
              >
                <option value="ACTIVE_SHOOTER">Active Shooter</option>
                <option value="FACILITY_LOCKDOWN">Facility Lockdown</option>
                <option value="HAZMAT_EVACUATION">Hazmat Evacuation</option>
                <option value="SHELTER_IN_PLACE">Shelter in Place</option>
                <option value="SEVERE_WEATHER">Severe Weather</option>
                <option value="ALL_CLEAR">All Clear</option>
              </Select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Severity</label>
              <Select
                value={composerSeverity}
                onChange={(e) => setComposerSeverity(e.target.value as SeverityLevel)}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Description</label>
            <textarea
              rows={2}
              value={composerDescription}
              onChange={(e) => setComposerDescription(e.target.value)}
              placeholder="Operational description of hazard..."
              className="w-full bg-background border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Action Instruction</label>
            <textarea
              rows={2}
              value={composerInstruction}
              onChange={(e) => setComposerInstruction(e.target.value)}
              placeholder="Actionable steps for occupants..."
              className="w-full bg-background border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsComposerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stage Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CodePreviewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
