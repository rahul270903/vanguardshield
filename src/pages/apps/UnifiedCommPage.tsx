import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Mic,
  MicOff,
  Radio,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  PhoneIncoming,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Square,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Share2,
  Settings,
  Sliders,
  Layers,
  Sparkles,
  Info,
  RadioTower,
  Cpu,
  ArrowRightLeft,
  KeyRound,
  FileText,
  UserCheck,
  UserX,
  Zap,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import {
  CommSession,
  CommParticipant,
  CommGroup,
  CommUserPresence,
  SIPGatewayTrunk,
  CrossDomainBridgeRequest,
} from '../../types/modules'
import { ClassificationLevel } from '../../types/common'

type CommTabType =
  | 'dashboard'
  | 'session-control'
  | 'talkgroups'
  | 'directory'
  | 'gateways'
  | 'cross-domain'

export default function UnifiedCommPage() {
  const [activeTab, setActiveTab] = useState<CommTabType>('dashboard')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('cs-001')
  const [selectedTalkgroupId, setSelectedTalkgroupId] = useState<string>('cg-001')

  // Search & Filter States
  const [sessionSearch, setSessionSearch] = useState('')
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('ALL')
  const [directorySearch, setDirectorySearch] = useState('')
  const [directoryAgencyFilter, setDirectoryAgencyFilter] = useState<string>('ALL')
  const [directoryStateFilter, setDirectoryStateFilter] = useState<string>('ALL')

  // PTT Simulation State
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [activeTxTalkgroup, setActiveTxTalkgroup] = useState<string>('FPS-NCR-TAC1')
  const [audioInputLevel, setAudioInputLevel] = useState<number>(75)
  const [priorityOverrideActive, setPriorityOverrideActive] = useState(false)

  // Modals
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false)
  const [isAuthorizeCdsModalOpen, setIsAuthorizeCdsModalOpen] = useState(false)
  const [selectedBridgeToAuthorize, setSelectedBridgeToAuthorize] = useState<CrossDomainBridgeRequest | null>(null)
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false)
  const [quickCallTarget, setQuickCallTarget] = useState<CommUserPresence | null>(null)

  // Store Hooks
  const {
    commSessions,
    commParticipants,
    commGroups,
    commPresences,
    sipTrunks,
    crossDomainBridges,
    createCommSession,
    updateSessionStatus,
    toggleParticipantMute,
    createCommGroup,
    toggleGroupPatch,
    updateUserPresence,
    toggleTrunkFailover,
    authorizeCrossDomainBridge,
    terminateCrossDomainBridge,
    activeAgencyId,
    classificationLevel,
    addToast,
  } = useVanguardStore()

  // Form States for New Session
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionType, setNewSessionType] = useState<CommSession['sessionType']>('P25_RADIO_DISPATCH')
  const [newSessionPriority, setNewSessionPriority] = useState<CommSession['priority']>('ROUTINE')
  const [newSessionSource, setNewSessionSource] = useState('FPS-MOC-CON1')
  const [newSessionTarget, setNewSessionTarget] = useState('FPS-NCR-TAC1')
  const [newSessionClassification, setNewSessionClassification] = useState<ClassificationLevel>('CUI')
  const [newSessionSrtp, setNewSessionSrtp] = useState(true)

  // Form States for New Talkgroup
  const [newGroupCode, setNewGroupCode] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupAgency, setNewGroupAgency] = useState('FPS')
  const [newGroupMissionScope, setNewGroupMissionScope] = useState('')
  const [newGroupClassification, setNewGroupClassification] = useState<ClassificationLevel>('CUI')
  const [newGroupAutoExpire, setNewGroupAutoExpire] = useState('48')
  const [newGroupPatchedNetworks, setNewGroupPatchedNetworks] = useState('P25 Trunked, FirstNet LTE')

  // Selected session & participants
  const activeSelectedSession = useMemo(() => {
    return commSessions.find((s) => s.id === selectedSessionId) || commSessions[0]
  }, [commSessions, selectedSessionId])

  const sessionParticipantsList = useMemo(() => {
    if (!activeSelectedSession) return []
    return commParticipants.filter((p) => p.sessionId === activeSelectedSession.id)
  }, [commParticipants, activeSelectedSession])

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return commSessions.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.sessionNumber.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.sourceEndpoint.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.targetEndpoint.toLowerCase().includes(sessionSearch.toLowerCase())
      const matchType = sessionTypeFilter === 'ALL' || s.sessionType === sessionTypeFilter
      return matchSearch && matchType
    })
  }, [commSessions, sessionSearch, sessionTypeFilter])

  // Filtered Directory
  const filteredDirectory = useMemo(() => {
    return commPresences.filter((cp) => {
      const matchSearch =
        cp.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        cp.badgeNumber.toLowerCase().includes(directorySearch.toLowerCase()) ||
        cp.role.toLowerCase().includes(directorySearch.toLowerCase()) ||
        cp.currentTalkgroup.toLowerCase().includes(directorySearch.toLowerCase())
      const matchAgency = directoryAgencyFilter === 'ALL' || cp.agency.toUpperCase().includes(directoryAgencyFilter)
      const matchState = directoryStateFilter === 'ALL' || cp.state === directoryStateFilter
      return matchSearch && matchAgency && matchState
    })
  }, [commPresences, directorySearch, directoryAgencyFilter, directoryStateFilter])

  // Computed summary stats
  const activeSessionsCount = useMemo(() => commSessions.filter((s) => s.status === 'ACTIVE').length, [commSessions])
  const activeTalkgroupsCount = useMemo(() => commGroups.filter((g) => g.status === 'ACTIVE').length, [commGroups])
  const patchedTalkgroupsCount = useMemo(() => commGroups.filter((g) => g.isPatched).length, [commGroups])
  const availableUsersCount = useMemo(() => commPresences.filter((p) => p.state === 'AVAILABLE' || p.state === 'ON_PATROL').length, [commPresences])
  const activeBridgesCount = useMemo(() => crossDomainBridges.filter((b) => b.status === 'ACTIVE_GUARDED').length, [crossDomainBridges])
  const operationalTrunksCount = useMemo(() => sipTrunks.filter((t) => t.status === 'OPERATIONAL' || t.status === 'FAILOVER_ACTIVE').length, [sipTrunks])

  // Handler for creating session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionTitle.trim()) return

    createCommSession({
      sessionNumber: `COMM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newSessionTitle,
      sessionType: newSessionType,
      status: 'ACTIVE',
      priority: newSessionPriority,
      sourceEndpoint: newSessionSource,
      targetEndpoint: newSessionTarget,
      classification: newSessionClassification,
      primaryTalkgroup: newSessionType === 'P25_RADIO_DISPATCH' ? newSessionTarget : undefined,
      recordingActive: true,
      srtpEncrypted: newSessionSrtp,
    })

    setNewSessionTitle('')
    setIsNewSessionModalOpen(false)
  }

  // Handler for creating group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupCode.trim() || !newGroupName.trim()) return

    createCommGroup({
      groupCode: newGroupCode.toUpperCase(),
      name: newGroupName,
      description: newGroupDescription || 'Federated tactical mission channel',
      agency: newGroupAgency,
      missionScope: newGroupMissionScope || 'National Capital Region Tactical Security Operations',
      classification: newGroupClassification,
      autoExpireHours: newGroupAutoExpire === 'Permanent' ? undefined : parseInt(newGroupAutoExpire, 10),
      isPatched: false,
      patchedNetworks: newGroupPatchedNetworks.split(',').map((s) => s.trim()).filter(Boolean),
    })

    setNewGroupCode('')
    setNewGroupName('')
    setNewGroupDescription('')
    setNewGroupMissionScope('')
    setIsNewGroupModalOpen(false)
  }

  // PTT Trigger
  const handlePttMouseDown = () => {
    setIsTransmitting(true)
  }

  const handlePttMouseUp = () => {
    setIsTransmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 07 // UNIFIED-COMM
                </span>
                <span className="text-xs text-slate-400">P25 Phase 2 / SIP-SRTP / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SRTP / ISSI Active
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Unified Communications &amp; Dispatch Console
              </h1>
              <p className="text-xs text-slate-400">
                P25 Phase 2 Radio Dispatch • Secure VoIP/SIP • Inter-Agency Conference Bridges • Hardware Cross-Domain Guard
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewGroupModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Provision Talkgroup</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewSessionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dispatch Session</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Dispatch &amp; PTT Console</span>
          </button>

          <button
            onClick={() => setActiveTab('session-control')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'session-control'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Session Control &amp; Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {activeSessionsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('talkgroups')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'talkgroups'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mission Talkgroups</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {commGroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'directory'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Federated Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gateways'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Gateway Administration</span>
          </button>

          <button
            onClick={() => setActiveTab('cross-domain')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cross-domain'
                ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Cross-Domain Guard (CDS)</span>
            {activeBridgesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 animate-pulse">
                {activeBridgesCount} Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Sessions</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeSessionsCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Voice &amp; Radio
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mission Talkgroups</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeTalkgroupsCount}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            {patchedTalkgroupsCount} Interop Patched
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Field Endpoints</span>
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {availableUsersCount} <span className="text-xs font-normal text-slate-500">/ {commPresences.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Online &amp; Dispatched</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>SIP Trunks</span>
            <Server className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {operationalTrunksCount} <span className="text-xs font-normal text-slate-500">/ {sipTrunks.length}</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">SBC &amp; P25 ISSI</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CDS Voice Guard</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeBridgesCount}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Boundary Active</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Security Enclave</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{classificationLevel}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">SRTP AES-256 Enabled</div>
        </div>
      </div>


{/* ===================================================================== */}
      {/* SCREEN 1: COMMUNICATIONS DASHBOARD & DISPATCH CONSOLE                 */}
      {/* ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: PTT Transmitter & Quick Dispatch Console (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tactical PTT Transmitter Card */}
            <Card className="border-blue-500/30 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-400" />
                    Dispatch PTT Tactical Console
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Hardware P25 Phase 2 / FirstNet MCPTT RF Transmitter
                  </p>
                </div>
                <Badge
                  variant={isTransmitting ? 'critical' : 'outline'}
                  className={isTransmitting ? 'animate-pulse text-xs font-mono font-bold' : 'text-[11px]'}
                >
                  {isTransmitting ? 'TX ON AIR' : 'RX STANDBY'}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Channel / Talkgroup Selector */}
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">
                    Active Transmit Talkgroup
                  </label>
                  <select
                    value={activeTxTalkgroup}
                    onChange={(e) => setActiveTxTalkgroup(e.target.value)}
                    className="w-full bg-background border border-slate-200 rounded-md px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {commGroups.map((g) => (
                      <option key={g.id} value={g.groupCode}>
                        [{g.groupCode}] {g.name} ({g.agency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live RF Waveform & Audio VU Meter */}
                <div className="p-3 rounded-lg bg-black/40 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      Carrier Waveform / VU Level
                    </span>
                    <span className="font-mono text-emerald-400">
                      {isTransmitting ? '-12 dB (Nominal)' : '-74 dB (Floor)'}
                    </span>
                  </div>

                  {/* VU Meter Bars */}
                  <div className="grid grid-cols-20 gap-1 h-8 items-end p-1 bg-background/50 rounded">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const active = isTransmitting
                        ? i < 14 + Math.floor(Math.sin(i) * 4)
                        : i < 2
                      const isHigh = i > 15
                      const isMid = i > 10 && i <= 15
                      return (
                        <div
                          key={i}
                          className={`w-full rounded-t-xs transition-all duration-75 ${
                            active
                              ? isHigh
                                ? 'bg-red-500 h-full'
                                : isMid
                                ? 'bg-amber-400 h-4/5'
                                : 'bg-emerald-400 h-3/5'
                              : 'bg-muted/40 h-1'
                          }`}
                        />
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>-40 dB</span>
                    <span>-20 dB</span>
                    <span>0 dB (PEAK)</span>
                  </div>
                </div>

                {/* Big Push-To-Talk Button */}
                <div className="space-y-2">
                  <button
                    onMouseDown={handlePttMouseDown}
                    onMouseUp={handlePttMouseUp}
                    onTouchStart={handlePttMouseDown}
                    onTouchEnd={handlePttMouseUp}
                    className={`w-full py-6 rounded-lg font-bold tracking-wider text-sm transition-all duration-100 flex flex-col items-center justify-center gap-1.5 select-none ${
                      isTransmitting
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-[0.98]'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]'
                    }`}
                  >
                    <Mic className={`w-6 h-6 ${isTransmitting ? 'animate-bounce' : ''}`} />
                    <span>{isTransmitting ? 'RELEASE TO LISTEN' : 'PUSH TO TALK (PTT)'}</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      Target: {activeTxTalkgroup} • P25 Phase 2 AES-256
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="text-[11px]">Hold click or spacebar to speak</span>
                    <button
                      onClick={() => {
                        setPriorityOverrideActive(!priorityOverrideActive)
                        addToast({
                          title: !priorityOverrideActive ? 'Emergency Priority Override Engaged' : 'Routine Priority Restored',
                          message: !priorityOverrideActive ? 'P25 talkgroup preemption active' : 'Standard trunking arbitration',
                          type: !priorityOverrideActive ? 'warning' : 'info',
                        })
                      }}
                      className={`text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                        priorityOverrideActive
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-muted/40 text-slate-500 border-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {priorityOverrideActive ? 'EMERGENCY OVERRIDE ON' : 'Routine Mode'}
                    </button>
                  </div>
                </div>

                {/* Audio Gain & Mic Settings */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500">Mic Gain:</span>
                    <span className="font-mono text-slate-900">{audioInputLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={audioInputLevel}
                    onChange={(e) => setAudioInputLevel(parseInt(e.target.value, 10))}
                    className="w-32 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Action Matrix */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="p-3.5 border-b border-slate-200">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Quick Dispatch Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    createCommSession({
                      sessionNumber: `COMM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      title: 'All-Hands Emergency Broadcast',
                      sessionType: 'P25_RADIO_DISPATCH',
                      status: 'ACTIVE',
                      priority: 'EMERGENCY',
                      sourceEndpoint: 'FPS-MOC-COMMAND',
                      targetEndpoint: 'ALL-TALKGROUPS',
                      classification: 'CUI',
                      primaryTalkgroup: 'FPS-NCR-TAC1',
                      recordingActive: true,
                      srtpEncrypted: true,
                    })
                  }}
                  className="text-xs justify-start border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  All-Hands Priority Alert
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewSessionModalOpen(true)}
                  className="text-xs justify-start"
                >
                  <PhoneForwarded className="w-3.5 h-3.5 mr-1.5 text-blue-400 shrink-0" />
                  Bridge FirstNet & P25
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('cross-domain')}
                  className="text-xs justify-start border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  Request CDS Cross-Domain
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('directory')}
                  className="text-xs justify-start"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
                  Inter-Agency Directory
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Priority Sessions & Service Health (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Sessions Live Roster */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Priority Communications Sessions
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Active encrypted audio circuits, talkgroups, and conference bridges
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('session-control')}
                    className="text-xs h-7"
                  >
                    View All ({commSessions.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {commSessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 hover:bg-white/80 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          session.priority === 'EMERGENCY'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {session.sessionType === 'P25_RADIO_DISPATCH' ? (
                            <Radio className="w-4 h-4" />
                          ) : session.sessionType === 'MULTI_PARTY_CONFERENCE' ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <PhoneCall className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {session.title}
                            </span>
                            <Badge
                              variant={
                                session.status === 'ACTIVE'
                                  ? 'nominal'
                                  : session.status === 'ON_HOLD'
                                  ? 'warning'
                                  : 'outline'
                              }
                              className="text-[10px]"
                            >
                              {session.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {session.classification}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                            <span className="font-mono text-slate-900/80">{session.sessionNumber}</span>
                            <span>•</span>
                            <span>{session.sourceEndpoint} → {session.targetEndpoint}</span>
                            <span>•</span>
                            <span>{session.participantsCount} Connected</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {session.status === 'ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSessionStatus(session.id, 'ON_HOLD')}
                            className="text-xs h-7 px-2 text-amber-400 hover:text-amber-300"
                            title="Place Call on Hold"
                          >
                            Hold
                          </Button>
                        ) : session.status === 'ON_HOLD' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSessionStatus(session.id, 'ACTIVE')}
                            className="text-xs h-7 px-2 text-emerald-400 hover:text-emerald-300"
                            title="Resume Call"
                          >
                            Resume
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSessionId(session.id)
                            setActiveTab('session-control')
                          }}
                          className="text-xs h-7 px-2.5"
                        >
                          Control
                        </Button>

                        {session.status !== 'TERMINATED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSessionStatus(session.id, 'TERMINATED')}
                            className="text-xs h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Terminate Call"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gateway & Trunk Status Snapshot */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-3.5 border-b border-slate-200 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  SBC & P25 Inter-RF Subsystem (ISSI) Telemetry
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('gateways')}
                  className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
                >
                  Manage Gateways →
                </Button>
              </CardHeader>
              <CardContent className="p-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sipTrunks.map((trunk) => (
                    <div
                      key={trunk.id}
                      className="p-3 rounded-lg bg-background/50 border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {trunk.trunkName}
                        </span>
                        <Badge
                          variant={
                            trunk.status === 'OPERATIONAL'
                              ? 'nominal'
                              : trunk.status === 'FAILOVER_ACTIVE'
                              ? 'warning'
                              : 'critical'
                          }
                          className="text-[10px]"
                        >
                          {trunk.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>MOS: {trunk.mosScore.toFixed(2)}/5.0</span>
                        <span>{trunk.latencyMs}ms Latency</span>
                        <span>{trunk.codec}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Channel Capacity</span>
                          <span>{trunk.activeChannels} / {trunk.maxChannels} channels</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              trunk.activeChannels / trunk.maxChannels > 0.8
                                ? 'bg-amber-400'
                                : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${(trunk.activeChannels / trunk.maxChannels) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: SESSION CONTROL & CONFERENCE BRIDGE                         */}
      {/* ===================================================================== */}
      {activeTab === 'session-control' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Session Roster (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full bg-background border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
                className="bg-background border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="P25_RADIO_DISPATCH">P25 Dispatch</option>
                <option value="SECURE_VOIP_CALL">Secure VoIP</option>
                <option value="MULTI_PARTY_CONFERENCE">Conference</option>
                <option value="CROSS_DOMAIN_BRIDGE">Cross-Domain</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSessionId === session.id
                      ? 'bg-blue-500/10 border-blue-500/60 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {session.title}
                    </span>
                    <Badge
                      variant={
                        session.status === 'ACTIVE'
                          ? 'nominal'
                          : session.status === 'ON_HOLD'
                          ? 'warning'
                          : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span className="font-mono">{session.sessionNumber}</span>
                    <span>{session.priority}</span>
                  </div>
                  <div className="text-[11px] text-slate-500/80 mt-1 flex items-center gap-1 truncate">
                    <span>{session.sourceEndpoint}</span>
                    <span>→</span>
                    <span className="truncate">{session.targetEndpoint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Selected Session & Conference Bridge Inspection (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeSelectedSession ? (
              <Card className="border-slate-200 bg-white">
                <CardHeader className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-bold text-slate-900">
                        {activeSelectedSession.title}
                      </CardTitle>
                      <Badge variant="info" className="text-xs">
                        {activeSelectedSession.sessionType.replace(/_/g, ' ')}
                      </Badge>
                      <Badge
                        variant={activeSelectedSession.status === 'ACTIVE' ? 'nominal' : 'warning'}
                        className="text-xs"
                      >
                        {activeSelectedSession.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Session ID: {activeSelectedSession.sessionNumber} • Started: {new Date(activeSelectedSession.startedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Top session action controls */}
                  <div className="flex items-center gap-2">
                    {activeSelectedSession.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSessionStatus(activeSelectedSession.id, 'ON_HOLD')}
                        className="text-xs text-amber-400 border-amber-500/30"
                      >
                        Put on Hold
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSessionStatus(activeSelectedSession.id, 'ACTIVE')}
                        className="text-xs text-emerald-400 border-emerald-500/30"
                      >
                        Resume Active
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSessionStatus(activeSelectedSession.id, 'TERMINATED')}
                      className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <PhoneOff className="w-3.5 h-3.5 mr-1" />
                      Terminate Call
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-6">
                  {/* Security & Transport Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-background/50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Enclave Level</span>
                      <span className="font-semibold text-amber-400">{activeSelectedSession.classification}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">SRTP Cipher</span>
                      <span className="font-semibold text-emerald-400">
                        {activeSelectedSession.srtpEncrypted ? 'AES-256-GCM (FIPS)' : 'Unencrypted'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Audio Recording</span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {activeSelectedSession.recordingActive ? 'Active Compliance' : 'Off'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Origin Endpoint</span>
                      <span className="font-mono text-slate-900 truncate block">{activeSelectedSession.sourceEndpoint}</span>
                    </div>
                  </div>

                  {/* Multi-Party Conference Participants Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        Connected Participants ({sessionParticipantsList.length})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Real-Time Individual Channel Control & Gain
                      </span>
                    </div>

                    {sessionParticipantsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                        No additional participants registered in this single-point channel.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessionParticipantsList.map((participant) => (
                          <div
                            key={participant.id}
                            className="p-3 rounded-lg bg-background/60 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2 rounded-full ${
                                participant.status === 'SPEAKING'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                                  : participant.status === 'MUTED'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-muted text-slate-500'
                              }`}>
                                {participant.status === 'MUTED' ? (
                                  <MicOff className="w-4 h-4" />
                                ) : (
                                  <Mic className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-slate-900">
                                    {participant.name}
                                  </span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {participant.callsign}
                                  </Badge>
                                  <Badge variant="info" className="text-[10px]">
                                    {participant.agency}
                                  </Badge>
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px]">{participant.endpointType}</span>
                                  <span>•</span>
                                  <span>Status: {participant.status}</span>
                                </div>
                              </div>
                            </div>

                            {/* Audio VU Indicator & Individual Mute Button */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="hidden sm:flex items-center gap-1.5 w-24">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {participant.status === 'MUTED' ? 'MUTE' : `${participant.audioLevelDb} dB`}
                                </span>
                                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      participant.status === 'MUTED'
                                        ? 'bg-transparent'
                                        : 'bg-emerald-400'
                                    }`}
                                    style={{
                                      width: participant.status === 'MUTED' ? '0%' : `${Math.min(100, Math.max(10, 100 + participant.audioLevelDb * 2))}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleParticipantMute(participant.id)}
                                className={`text-xs h-7 px-2.5 ${
                                  participant.status === 'MUTED'
                                    ? 'text-red-400 border-red-500/40 hover:bg-red-500/10'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {participant.status === 'MUTED' ? (
                                  <>
                                    <MicOff className="w-3.5 h-3.5 mr-1" />
                                    Unmute
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-3.5 h-3.5 mr-1" />
                                    Mute
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bridge Interconnect Controls */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-slate-500">
                      Interconnect: P25 ISSI Subsystem • FirstNet Band 14 Bridge Enabled
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addToast({
                            title: 'All Participants Muted',
                            message: 'Conference master mute enforced for tactical transmission',
                            type: 'info',
                          })
                        }}
                        className="text-xs h-7"
                      >
                        Master Mute All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addToast({
                            title: 'Audio Feed Patched to P25 Repeater',
                            message: 'Broadcast expanded to FPS Sector 1 Tactical Repeater',
                            type: 'success',
                          })
                        }}
                        className="text-xs h-7 text-blue-400 border-blue-500/30"
                      >
                        Patch to Repeater
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center text-sm text-slate-500 border border-dashed rounded-lg">
                Select a session from the left panel to inspect and control audio circuits.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3: MISSION TALKGROUPS & GROUP ADMINISTRATION                   */}
      {/* ===================================================================== */}
      {activeTab === 'talkgroups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Inter-Agency Mission Talkgroups ({commGroups.length})
              </h3>
              <p className="text-xs text-slate-500">
                P25 Phase 2 trunked talkgroups, FirstNet push-to-talk bridges, and cross-jurisdictional mission patches
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewGroupModalOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Provision New Talkgroup
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commGroups.map((group) => (
              <Card
                key={group.id}
                className={`border transition-all ${
                  group.isPatched
                    ? 'border-emerald-500/40 bg-white/80 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200 bg-white hover:border-slate-200'
                }`}
              >
                <CardHeader className="p-4 border-b border-slate-200 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-blue-400">
                        {group.groupCode}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 mt-1.5">
                        {group.name}
                      </h4>
                    </div>
                    <Badge
                      variant={group.isPatched ? 'nominal' : 'outline'}
                      className="text-[10px]"
                    >
                      {group.isPatched ? 'PATCHED ACTIVE' : 'ISOLATED'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {group.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 space-y-3.5">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Agency Jurisdiction:</span>
                      <span className="font-medium text-slate-900">{group.agency}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Enclave Classification:</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {group.classification}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Connected Subscribers:</span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {group.membersCount} units ({group.activeSpeakersCount} speaking)
                      </span>
                    </div>
                    {group.autoExpireHours && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Mission Expiration:</span>
                        <span className="text-amber-400 font-mono text-[11px]">
                          {group.autoExpireHours} hours lease
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Patched Networks Tags */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">
                      Patched Network Domains:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {group.patchedNetworks.map((net, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-background border border-slate-200 text-slate-900/80 font-mono"
                        >
                          {net}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Patch Toggle Action */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <Button
                      variant={group.isPatched ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleGroupPatch(group.id)}
                      className={`w-full text-xs font-semibold ${
                        group.isPatched
                          ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                      {group.isPatched ? 'Disengage Interop Patch' : 'Engage P25/LTE Patch'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 4: FEDERATED DIRECTORY & PRESENCE MATRIX                       */}
      {/* ===================================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Federated Tactical Directory & Presence ({filteredDirectory.length})
              </h3>
              <p className="text-xs text-slate-500">
                Multi-agency federal subscriber presence, endpoint capabilities, and direct PTT dispatching
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by name, badge, role..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="bg-background border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                />
              </div>

              <select
                value={directoryAgencyFilter}
                onChange={(e) => setDirectoryAgencyFilter(e.target.value)}
                className="bg-background border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Agencies</option>
                <option value="FPS">FPS</option>
                <option value="CBP">CBP</option>
                <option value="USSS">USSS</option>
                <option value="FEMA">FEMA</option>
              </select>

              <select
                value={directoryStateFilter}
                onChange={(e) => setDirectoryStateFilter(e.target.value)}
                className="bg-background border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All States</option>
                <option value="AVAILABLE">Available</option>
                <option value="ON_PATROL">On Patrol</option>
                <option value="INCIDENT_DISPATCHED">Dispatched</option>
                <option value="BUSY_CALL">Busy</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredDirectory.map((contact) => (
              <Card key={contact.id} className="border-slate-200 bg-white hover:bg-white/80 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                        {contact.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">{contact.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">
                            {contact.agency}
                          </Badge>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {contact.badgeNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        contact.state === 'AVAILABLE' || contact.state === 'ON_PATROL'
                          ? 'nominal'
                          : contact.state === 'INCIDENT_DISPATCHED' || contact.state === 'BUSY_CALL'
                          ? 'warning'
                          : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {contact.state.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-200">
                    <div className="flex justify-between text-slate-500">
                      <span>Role:</span>
                      <span className="text-slate-900 font-medium">{contact.role}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Assigned Talkgroup:</span>
                      <span className="font-mono text-blue-400">{contact.currentTalkgroup}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Radio / Endpoint:</span>
                      <span className="text-slate-900 truncate max-w-[170px]">{contact.endpoint}</span>
                    </div>
                    {contact.locationContext && (
                      <div className="flex justify-between text-slate-500">
                        <span>Sector Location:</span>
                        <span className="text-slate-900 truncate max-w-[170px]">{contact.locationContext}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Status & Call Actions */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <select
                      value={contact.state}
                      onChange={(e) => updateUserPresence(contact.id, e.target.value as CommUserPresence['state'])}
                      className="bg-background border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-900 focus:outline-none"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_PATROL">On Patrol</option>
                      <option value="INCIDENT_DISPATCHED">Dispatched</option>
                      <option value="BUSY_CALL">Busy</option>
                      <option value="DO_NOT_DISTURB">DND</option>
                      <option value="OFFLINE">Offline</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuickCallTarget(contact)
                        setIsQuickCallModalOpen(true)
                      }}
                      className="text-xs h-7 px-2.5 text-blue-400 hover:bg-blue-500/10 border-blue-500/30"
                    >
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Direct Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 5: GATEWAY ADMINISTRATION & SIP TRUNKS                         */}
      {/* ===================================================================== */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                Session Border Controllers & SIP Gateway Trunks ({sipTrunks.length})
              </h3>
              <p className="text-xs text-slate-500">
                NG911 ESInet ingress, P25 ISSI gateways, FirstNet MCPTT bridges, and FIPS 140-3 SRTP routing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sipTrunks.map((trunk) => (
              <Card key={trunk.id} className="border-slate-200 bg-white">
                <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {trunk.trunkName}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-slate-500">
                      {trunk.gatewayType}
                    </span>
                  </div>
                  <Badge
                    variant={
                      trunk.status === 'OPERATIONAL'
                        ? 'nominal'
                        : trunk.status === 'FAILOVER_ACTIVE'
                        ? 'warning'
                        : 'critical'
                    }
                    className="text-xs"
                  >
                    {trunk.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="p-2.5 rounded bg-black/40 border border-slate-200 text-xs font-mono text-blue-300 truncate">
                    URI: {trunk.ipUri}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">MOS Score</span>
                      <span className="font-bold text-emerald-400 text-sm">{trunk.mosScore.toFixed(2)} / 5.0</span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Roundtrip Latency</span>
                      <span className="font-bold text-slate-900 text-sm">{trunk.latencyMs} ms</span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Codec</span>
                      <span className="font-bold text-slate-900 text-sm">{trunk.codec}</span>
                    </div>
                  </div>

                  {/* Channel Utilization Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Concurrent Voice Channels</span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {trunk.activeChannels} / {trunk.maxChannels} ({Math.round((trunk.activeChannels / trunk.maxChannels) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          trunk.activeChannels / trunk.maxChannels > 0.8
                            ? 'bg-amber-400'
                            : 'bg-indigo-500'
                        }`}
                        style={{
                          width: `${(trunk.activeChannels / trunk.maxChannels) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      {trunk.srtpStatus}
                    </span>
                    <Button
                      variant={trunk.status === 'FAILOVER_ACTIVE' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleTrunkFailover(trunk.id)}
                      className={`text-xs h-7 ${
                        trunk.status === 'FAILOVER_ACTIVE'
                          ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                      {trunk.status === 'FAILOVER_ACTIVE' ? 'Restore Primary SBC' : 'Simulate Failover Route'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 6: CROSS-DOMAIN COMMUNICATIONS GUARD & INTEROP (CDS)           */}
      {/* ===================================================================== */}
      {activeTab === 'cross-domain' && (
        <div className="space-y-6">
          {/* Hardware CDS Guard Overview Card */}
          <Card className="border-purple-500/40 bg-purple-950/10">
            <CardHeader className="p-4 border-b border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-400" />
                    Federal Cross-Domain Audio Boundary Guard (CDS Guard)
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Hardware-enforced cryptographic boundary isolating CUI // FEDCON from SECRET // NOFORN voice networks (Doc 2 §4.16)
                  </p>
                </div>
                <Badge variant="outline" className="border-purple-500/40 text-purple-300 text-xs">
                  NSA CSfC / NIST SP 800-53 SC-7 Compliant
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Architecture Pipeline Diagram */}
              <div className="p-4 rounded-lg bg-black/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center w-full md:w-1/4">
                  <span className="text-[10px] text-slate-500 block">LOW ENCLAVE</span>
                  <span className="font-bold text-blue-400 text-sm">CUI // FEDCON</span>
                  <p className="text-[10px] text-slate-500 mt-1">FirstNet / Public Safety P25</p>
                </div>

                <div className="flex flex-col items-center justify-center text-purple-400 shrink-0">
                  <ArrowRightLeft className="w-6 h-6 animate-pulse" />
                  <span className="text-[10px] text-purple-300 mt-1 font-sans font-semibold">
                    Hardware CDS Filter
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/40 text-center w-full md:w-1/3">
                  <span className="text-[10px] text-purple-300 block">MULTI-LEVEL SECURITY GUARD</span>
                  <span className="font-bold text-purple-200 text-sm">Bi-Directional Redaction</span>
                  <p className="text-[10px] text-purple-300/80 mt-1">
                    Strict Vocoder Filter • Anti-Data Leakage • PIV Authorized
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-purple-400 shrink-0">
                  <ArrowRightLeft className="w-6 h-6 animate-pulse" />
                  <span className="text-[10px] text-purple-300 mt-1 font-sans font-semibold">
                    Classified Trunk
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center w-full md:w-1/4">
                  <span className="text-[10px] text-slate-500 block">HIGH ENCLAVE</span>
                  <span className="font-bold text-red-400 text-sm">SECRET // NOFORN</span>
                  <p className="text-[10px] text-slate-500 mt-1">USSS VIP Protection / DoD NCR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Cross-Domain Bridge Requests */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Cross-Domain Voice Bridge Requests & Guard Authorizations ({crossDomainBridges.length})
            </h4>

            <div className="space-y-3">
              {crossDomainBridges.map((bridge) => (
                <Card
                  key={bridge.id}
                  className={`border transition-all ${
                    bridge.status === 'ACTIVE_GUARDED'
                      ? 'border-purple-500/50 bg-white/80 shadow-md shadow-purple-500/5'
                      : bridge.status === 'PENDING_AUTHORIZATION'
                      ? 'border-amber-500/40 bg-white'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-400">
                          {bridge.requestNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">
                          {bridge.title}
                        </h4>
                        <Badge
                          variant={
                            bridge.status === 'ACTIVE_GUARDED'
                              ? 'nominal'
                              : bridge.status === 'PENDING_AUTHORIZATION'
                              ? 'warning'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {bridge.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500">
                        Justification: {bridge.justification}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap pt-1">
                        <span className="text-blue-400">{bridge.sourceEnclave} ({bridge.sourceTalkgroup})</span>
                        <span>↔</span>
                        <span className="text-red-400">{bridge.targetEnclave} ({bridge.targetTalkgroup})</span>
                        <span>•</span>
                        <span>Req: {bridge.requestedBy}</span>
                        {bridge.authorizedBy && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">Auth: {bridge.authorizedBy}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {bridge.status === 'PENDING_AUTHORIZATION' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedBridgeToAuthorize(bridge)
                            setIsAuthorizeCdsModalOpen(true)
                          }}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Authorize Guard Filter
                        </Button>
                      )}

                      {bridge.status === 'ACTIVE_GUARDED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateCrossDomainBridge(bridge.id)}
                          className="text-xs text-red-400 border-red-500/40 hover:bg-red-500/10 flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Sever Boundary Bridge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: NEW DISPATCH SESSION                                         */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        title="Initiate Secure Unified Communications Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">
              Session Title / Operation Name
            </label>
            <Input
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. VIP Motorcade Transit Security Bridge"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Session Type
              </label>
              <Select
                value={newSessionType}
                onChange={(e) => setNewSessionType(e.target.value as CommSession['sessionType'])}
              >
                <option value="P25_RADIO_DISPATCH">P25 Radio Dispatch</option>
                <option value="SECURE_VOIP_CALL">Secure VoIP Call</option>
                <option value="MULTI_PARTY_CONFERENCE">Multi-Party Conference</option>
                <option value="CROSS_DOMAIN_BRIDGE">Cross-Domain Bridge</option>
                <option value="INTERCOM">Facility Intercom</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Priority Class
              </label>
              <Select
                value={newSessionPriority}
                onChange={(e) => setNewSessionPriority(e.target.value as CommSession['priority'])}
              >
                <option value="ROUTINE">Routine</option>
                <option value="PRIORITY">Priority</option>
                <option value="EMERGENCY">Emergency (Preemptive)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Source Dispatch Endpoint
              </label>
              <Input
                value={newSessionSource}
                onChange={(e) => setNewSessionSource(e.target.value)}
                placeholder="FPS-MOC-CON1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Target Endpoint or Talkgroup
              </label>
              <Input
                value={newSessionTarget}
                onChange={(e) => setNewSessionTarget(e.target.value)}
                placeholder="FPS-NCR-TAC1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Classification Level
              </label>
              <Select
                value={newSessionClassification}
                onChange={(e) => setNewSessionClassification(e.target.value as ClassificationLevel)}
              >
                <option value="CUI">CUI // FEDCON</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET // NOFORN</option>
                <option value="TOP_SECRET">TOP SECRET // SCI</option>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="srtp-check"
                checked={newSessionSrtp}
                onChange={(e) => setNewSessionSrtp(e.target.checked)}
                className="rounded border-slate-200"
              />
              <label htmlFor="srtp-check" className="text-xs text-slate-900 cursor-pointer">
                FIPS 140-3 SRTP (AES-256)
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Establish Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: PROVISION TALKGROUP                                          */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        title="Provision New Inter-Agency Mission Talkgroup"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Talkgroup Code
              </label>
              <Input
                value={newGroupCode}
                onChange={(e) => setNewGroupCode(e.target.value)}
                placeholder="e.g. FPS-REG3-TAC2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Lead Agency
              </label>
              <Select
                value={newGroupAgency}
                onChange={(e) => setNewGroupAgency(e.target.value)}
              >
                <option value="FPS">DHS FPS</option>
                <option value="CBP">CBP</option>
                <option value="USSS">USSS</option>
                <option value="FEMA">FEMA</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">
              Talkgroup Name
            </label>
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. NCR Transit Security & Rapid Response"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">
              Mission Scope & Operational Purpose
            </label>
            <Input
              value={newGroupMissionScope}
              onChange={(e) => setNewGroupMissionScope(e.target.value)}
              placeholder="e.g. Multi-agency joint security coordination in NCR Sector 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Auto-Expiration Lease
              </label>
              <Select
                value={newGroupAutoExpire}
                onChange={(e) => setNewGroupAutoExpire(e.target.value)}
              >
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
                <option value="Permanent">Permanent Facility</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Classification
              </label>
              <Select
                value={newGroupClassification}
                onChange={(e) => setNewGroupClassification(e.target.value as ClassificationLevel)}
              >
                <option value="CUI">CUI // FEDCON</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET // NOFORN</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">
              Patched Network Types
            </label>
            <Input
              value={newGroupPatchedNetworks}
              onChange={(e) => setNewGroupPatchedNetworks(e.target.value)}
              placeholder="P25 Trunked, FirstNet LTE, SATCOM"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewGroupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Provision Talkgroup
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: AUTHORIZE CDS BRIDGE                                         */}
      {/* ===================================================================== */}
      {selectedBridgeToAuthorize && (
        <Modal
          isOpen={isAuthorizeCdsModalOpen}
          onClose={() => setIsAuthorizeCdsModalOpen(false)}
          title={`Authorize Hardware Cross-Domain Guard Bridge (${selectedBridgeToAuthorize.requestNumber})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Cross-Domain Security Enclave Pre-Authorization
              </span>
              <p className="text-[11px] leading-relaxed">
                You are about to establish an active hardware cross-domain audio bridge between{' '}
                <strong>{selectedBridgeToAuthorize.sourceEnclave}</strong> and{' '}
                <strong>{selectedBridgeToAuthorize.targetEnclave}</strong>.
                All audio channels will be sanitized and logged according to DoD/IC Cross-Domain Policy.
              </p>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-semibold text-slate-900">{selectedBridgeToAuthorize.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source Talkgroup:</span>
                <span className="font-mono text-blue-400">{selectedBridgeToAuthorize.sourceTalkgroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Talkgroup:</span>
                <span className="font-mono text-red-400">{selectedBridgeToAuthorize.targetTalkgroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mission Justification:</span>
                <span className="text-slate-900">{selectedBridgeToAuthorize.justification}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-900 block">
                Security Officer Verification Checklist
              </label>
              <div className="space-y-1.5 text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vocoder filter verified for anti-covert-channel integrity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PIV-9902-8812-441 digital signature validated for Designated Approval Authority</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Immutable audit record will be logged to Cryptographic Ledger</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAuthorizeCdsModalOpen(false)}
              >
                Abort
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  authorizeCrossDomainBridge(selectedBridgeToAuthorize.id)
                  setIsAuthorizeCdsModalOpen(false)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign & Authorize CDS Guard
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: QUICK CALL TARGET MODAL                                      */}
      {/* ===================================================================== */}
      {quickCallTarget && (
        <Modal
          isOpen={isQuickCallModalOpen}
          onClose={() => setIsQuickCallModalOpen(false)}
          title={`Establish Direct Call with ${quickCallTarget.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Officer / Unit:</span>
                <span className="font-semibold text-slate-900">{quickCallTarget.name} ({quickCallTarget.badgeNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agency:</span>
                <span className="text-blue-400 font-medium">{quickCallTarget.agency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination Radio:</span>
                <span className="font-mono text-slate-900">{quickCallTarget.endpoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Talkgroup:</span>
                <span className="font-mono text-slate-900">{quickCallTarget.currentTalkgroup}</span>
              </div>
            </div>

            <p className="text-slate-500">
              Establish a dedicated, point-to-point encrypted SRTP audio channel to this federal subscriber unit.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickCallModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  createCommSession({
                    sessionNumber: `COMM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    title: `Direct Point-to-Point: ${quickCallTarget.name}`,
                    sessionType: 'SECURE_VOIP_CALL',
                    status: 'ACTIVE',
                    priority: 'ROUTINE',
                    sourceEndpoint: 'FPS-MOC-DISPATCH',
                    targetEndpoint: quickCallTarget.endpoint,
                    classification: 'CUI',
                    recordingActive: true,
                    srtpEncrypted: true,
                  })
                  setIsQuickCallModalOpen(false)
                  setActiveTab('session-control')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Place Call Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
