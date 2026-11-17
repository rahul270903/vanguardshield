import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  RadioTower,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  Activity,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Signal,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  Sliders,
  Settings,
  XCircle,
  CheckCircle2,
  Zap,
  Cpu,
  Power,
  RotateCw,
  Server,
  Layers,
  ArrowRightLeft,
  Volume2,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import {
  RadioSubscriber,
  P25TalkgroupConfig,
  OTARKeyRecord,
  P25RepeaterSite,
  RadioInhibitLog,
} from '../../types/modules'

type P25TabType =
  | 'fleet'
  | 'talkgroups'
  | 'otar'
  | 'inhibit'
  | 'repeaters'
  | 'telemetry'

export default function P25FleetPage() {
  const [activeTab, setActiveTab] = useState<P25TabType>('fleet')
  const [selectedRadioId, setSelectedRadioId] = useState<string>('rad-01')

  // Search & Filter
  const [subscriberSearch, setSubscriberSearch] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('ALL')
  const [inhibitFilter, setInhibitFilter] = useState('ALL')

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [isProvisionTgModalOpen, setIsProvisionTgModalOpen] = useState(false)
  const [isInhibitConfirmModalOpen, setIsInhibitConfirmModalOpen] = useState(false)
  const [selectedInhibitTarget, setSelectedInhibitTarget] = useState<RadioSubscriber | null>(null)
  const [inhibitActionType, setInhibitActionType] = useState<'STUN' | 'REVIVE' | 'ZEROIZE'>('STUN')
  const [inhibitReason, setInhibitReason] = useState('')

  // Form States for Enroll Subscriber
  const [newRadioId, setNewRadioId] = useState('')
  const [newSubscriberName, setNewSubscriberName] = useState('')
  const [newModel, setNewModel] = useState('Motorola APX 8000')
  const [newSerialNumber, setNewSerialNumber] = useState('')
  const [newUnitId, setNewUnitId] = useState('')
  const [newAgency, setNewAgency] = useState('FPS')
  const [newTalkgroup, setNewTalkgroup] = useState('TG-101-FPS-TAC-1')

  // Form States for Provision Talkgroup
  const [newTgId, setNewTgId] = useState('106')
  const [newTgName, setNewTgName] = useState('')
  const [newTgAgency, setNewTgAgency] = useState('FPS')
  const [newTgPriority, setNewTgPriority] = useState('2')
  const [newTgEncryption, setNewTgEncryption] = useState(true)
  const [newTgChannel, setNewTgChannel] = useState('Slot 1 (852.5375 MHz)')

  // Store Hooks
  const {
    radios,
    p25Talkgroups,
    otarKeys,
    p25RepeaterSites,
    radioInhibitLogs,
    provisionRadioSubscriber,
    inhibitRadioUnit,
    initiateOTARekey,
    updateRadioTalkgroup,
    toggleSiteTrunkingMode,
    createP25Talkgroup,
    addToast,
  } = useVanguardStore()

  // Selected Radio
  const selectedRadio = useMemo(() => {
    return radios.find((r) => r.id === selectedRadioId || r.radioId === selectedRadioId) || radios[0]
  }, [radios, selectedRadioId])

  // Filtered Subscriber List
  const filteredRadios = useMemo(() => {
    return radios.filter((r) => {
      const matchSearch =
        r.radioId.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
        r.subscriberName.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
        (r.unitId && r.unitId.toLowerCase().includes(subscriberSearch.toLowerCase())) ||
        (r.model && r.model.toLowerCase().includes(subscriberSearch.toLowerCase()))
      const matchAgency = agencyFilter === 'ALL' || (r.agency && r.agency === agencyFilter)
      const matchInhibit =
        inhibitFilter === 'ALL' ||
        (inhibitFilter === 'ACTIVE' && (r.inhibitState === 'ACTIVE_NORMAL' || !r.inhibitState)) ||
        (inhibitFilter === 'STUNNED' && r.inhibitState === 'STUNNED') ||
        (inhibitFilter === 'ZEROIZED' && r.inhibitState === 'ZEROIZED')
      return matchSearch && matchAgency && matchInhibit
    })
  }, [radios, subscriberSearch, agencyFilter, inhibitFilter])

  // Computed summary metrics
  const onlineCount = useMemo(() => radios.filter((r) => r.status === 'ONLINE').length, [radios])
  const stunnedCount = useMemo(() => radios.filter((r) => r.inhibitState === 'STUNNED' || r.inhibitState === 'ZEROIZED').length, [radios])
  const activeTalkgroupsCount = useMemo(() => p25Talkgroups.filter((tg) => tg.status === 'ACTIVE').length, [p25Talkgroups])
  const operationalSitesCount = useMemo(() => p25RepeaterSites.filter((s) => s.status === 'OPERATIONAL').length, [p25RepeaterSites])
  const currentKeyEpoch = useMemo(() => otarKeys.find((k) => k.status === 'CURRENT_EPOCH'), [otarKeys])

  // Handle subscriber enrollment
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRadioId.trim() || !newSubscriberName.trim()) return

    provisionRadioSubscriber({
      radioId: newRadioId.toUpperCase(),
      subscriberName: newSubscriberName,
      model: newModel,
      serialNumber: newSerialNumber || `SER-${Math.floor(100000 + Math.random() * 900000)}`,
      unitId: newUnitId || `UID-${Math.floor(1000 + Math.random() * 9000)}`,
      agency: newAgency,
      assignedOfficer: newSubscriberName,
      talkgroup: newTalkgroup,
      batteryPct: 100,
      signalDbm: -74,
      encryptionKeyStatus: 'SYNCED_AES256',
      status: 'ONLINE',
      lastKnownSite: 'Washington Monument Tower 1',
      inhibitState: 'ACTIVE_NORMAL',
      firmwareVersion: 'R29.00.02',
      gpsCoordinates: [38.8929, -77.0299],
    })

    setNewRadioId('')
    setNewSubscriberName('')
    setIsEnrollModalOpen(false)
  }

  // Handle talkgroup creation
  const handleProvisionTgSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTgName.trim()) return

    createP25Talkgroup({
      tgid: parseInt(newTgId, 10) || 106,
      name: newTgName.toUpperCase(),
      agency: newTgAgency,
      priorityLevel: parseInt(newTgPriority, 10) || 2,
      encryptionRequired: newTgEncryption,
      assignedChannel: newTgChannel,
      status: 'ACTIVE',
    })

    setNewTgName('')
    setIsProvisionTgModalOpen(false)
  }

  // Handle Inhibit trigger
  const triggerInhibitModal = (radio: RadioSubscriber, action: 'STUN' | 'REVIVE' | 'ZEROIZE') => {
    setSelectedInhibitTarget(radio)
    setInhibitActionType(action)
    setInhibitReason(
      action === 'STUN'
        ? 'Reported missing or compromised field subscriber unit'
        : action === 'REVIVE'
        ? 'Unit recovered and verified by Physical Security Custodian'
        : 'Emergency cryptographic destruction authorized - Hostile compromise'
    )
    setIsInhibitConfirmModalOpen(true)
  }

  const handleExecuteInhibit = () => {
    if (!selectedInhibitTarget) return
    inhibitRadioUnit(selectedInhibitTarget.radioId, inhibitActionType, inhibitReason)
    setIsInhibitConfirmModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <RadioTower className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 09 // P25-FLEET
                </span>
                <span className="text-xs text-slate-400">TIA-102 Phase 2 / OTAR AES-256</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  P25 Core Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                P25 Smart Radio Fleet Management
              </h1>
              <p className="text-xs text-slate-400">
                APCO Project 25 Phase 2 TDMA Fleetmap • Over-The-Air Rekeying (OTAR) • Emergency Inhibit/Stun/Zeroize • Simulcast Tower Telemetry
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProvisionTgModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Provision Talkgroup</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Subscriber Radio</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Subscriber Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {radios.length}
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
            <Layers className="w-3.5 h-3.5" />
            <span>P25 Talkgroups &amp; Trunking</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {p25Talkgroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('otar')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'otar'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>OTAR Key Management (KMF)</span>
          </button>

          <button
            onClick={() => setActiveTab('inhibit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inhibit'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Emergency Stun &amp; Inhibit</span>
            {stunnedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {stunnedCount} Stunned
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('repeaters')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'repeaters'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <RadioTower className="w-3.5 h-3.5" />
            <span>Simulcast Towers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {p25RepeaterSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radio Telemetry &amp; GPS</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Subscribers</span>
            <Radio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{radios.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">P25 Phase 2 Radios</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Online &amp; Affiliated</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {onlineCount} <span className="text-xs font-normal text-slate-500">/ {radios.length}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Simulcast Locked</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Trunked Talkgroups</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{p25Talkgroups.length}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">NCR Federal Talkgroups</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>OTAR Rekey Status</span>
            <KeyRound className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700 font-mono">CURRENT</div>
          <div className="text-[10px] text-slate-500 mt-0.5">AES-256 Key Epoch Synced</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inhibited / Stunned</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{stunnedCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Emergency Posture</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Tower Sites Nominal</span>
            <RadioTower className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {operationalSitesCount} <span className="text-xs font-normal text-slate-500">/ {p25RepeaterSites.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulcast Sub-system</div>
        </div>
      </div>


{/* ===================================================================== */}
      {/* SCREEN 1: FLEET SUBSCRIBER ROSTER                                     */}
      {/* ===================================================================== */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Radio ID, UID, Officer..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="w-full bg-background border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                className="bg-background border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Agencies</option>
                <option value="FPS">FPS</option>
                <option value="CBP">CBP</option>
                <option value="USSS">USSS</option>
                <option value="FEMA">FEMA</option>
              </select>

              <select
                value={inhibitFilter}
                onChange={(e) => setInhibitFilter(e.target.value)}
                className="bg-background border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Inhibit States</option>
                <option value="ACTIVE">Active Normal</option>
                <option value="STUNNED">Stunned / Inhibited</option>
                <option value="ZEROIZED">Zeroized</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Subscriber Fleet Polled',
                  message: 'Simulcast core reported 6 subscriber units acknowledged on control channel',
                  type: 'info',
                })
              }}
              className="text-xs h-8"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Poll Fleet Telemetry
            </Button>
          </div>

          {/* Subscribers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRadios.map((radio) => (
              <Card
                key={radio.id}
                className={`border transition-all ${
                  radio.inhibitState === 'STUNNED'
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : radio.inhibitState === 'ZEROIZED'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : 'border-slate-200 bg-white hover:border-slate-200'
                }`}
              >
                <CardHeader className="p-4 border-b border-slate-200 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {radio.radioId}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {radio.unitId || 'UID-AUTO'}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {radio.subscriberName}
                      </h4>
                    </div>

                    <Badge
                      variant={
                        radio.inhibitState === 'STUNNED'
                          ? 'warning'
                          : radio.inhibitState === 'ZEROIZED'
                          ? 'critical'
                          : radio.status === 'ONLINE'
                          ? 'nominal'
                          : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {radio.inhibitState && radio.inhibitState !== 'ACTIVE_NORMAL'
                        ? radio.inhibitState
                        : radio.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {radio.model || 'P25 Subscriber'} • SN: {radio.serialNumber || 'N/A'}
                  </p>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Agency Jurisdiction:</span>
                      <span className="font-semibold text-slate-900">{radio.agency || 'FPS'}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500">
                      <span>Assigned Talkgroup:</span>
                      <select
                        value={radio.talkgroup}
                        onChange={(e) => updateRadioTalkgroup(radio.radioId, e.target.value)}
                        className="bg-background border border-slate-200 rounded px-2 py-0.5 text-[11px] font-mono text-blue-400 focus:outline-none"
                      >
                        {p25Talkgroups.map((tg) => (
                          <option key={tg.id} value={tg.name}>
                            {tg.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Encryption Status:</span>
                      <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                        {radio.encryptionKeyStatus}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Affiliated RF Site:</span>
                      <span className="font-mono text-slate-900 text-[11px] truncate max-w-[170px]">
                        {radio.lastKnownSite}
                      </span>
                    </div>
                  </div>

                  {/* Battery & Signal Level Meters */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Battery className={`w-3.5 h-3.5 ${radio.batteryPct > 40 ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span className="text-slate-500">Battery:</span>
                      <span className="font-mono text-slate-900 font-semibold">{radio.batteryPct}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Signal className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-500">RSSI:</span>
                      <span className="font-mono text-slate-900 font-semibold">{radio.signalDbm} dBm</span>
                    </div>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    {radio.inhibitState === 'STUNNED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => triggerInhibitModal(radio, 'REVIVE')}
                        className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <Power className="w-3.5 h-3.5 mr-1.5" />
                        Send OTA Revive
                      </Button>
                    ) : radio.inhibitState === 'ZEROIZED' ? (
                      <div className="w-full text-center text-xs text-rose-400 font-mono py-1">
                        CRYPTOGRAPHICALLY ZEROIZED
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerInhibitModal(radio, 'STUN')}
                          className="w-1/2 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                          OTA Stun
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerInhibitModal(radio, 'ZEROIZE')}
                          className="w-1/2 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Zeroize
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: DYNAMIC TALKGROUPS & FLEETMAP PROVISIONING                   */}
      {/* ===================================================================== */}
      {activeTab === 'talkgroups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                P25 Phase 2 TDMA Fleetmap & Talkgroup ID Matrix ({p25Talkgroups.length})
              </h3>
              <p className="text-xs text-slate-500">
                2-slot TDMA channel slots, talkgroup priorities, encryption policies, and dynamic subscriber partitioning
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsProvisionTgModalOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Provision Talkgroup
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p25Talkgroups.map((tg) => (
              <Card key={tg.id} className="border-slate-200 bg-white hover:bg-white/90 transition-all">
                <CardHeader className="p-4 border-b border-slate-200 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-blue-400">
                        TGID: {tg.tgid}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">
                        {tg.name}
                      </h4>
                    </div>
                    <Badge
                      variant={tg.status === 'ACTIVE' ? 'nominal' : 'outline'}
                      className="text-[10px]"
                    >
                      {tg.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Lead Agency:</span>
                    <span className="font-semibold text-slate-900">{tg.agency}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Trunking Priority:</span>
                    <span className="font-mono text-slate-900 font-semibold">Priority {tg.priorityLevel} (Preemptive)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Assigned RF Slot:</span>
                    <span className="font-mono text-emerald-400 text-[11px]">{tg.assignedChannel}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Security Requirement:</span>
                    <span className="font-mono text-slate-900 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      {tg.encryptionRequired ? 'AES-256 MANDATORY' : 'CLEAR / UNENCRYPTED'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Affiliated Field Radios:</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {radios.filter((r) => r.talkgroup === tg.name).length} active subscribers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3: OVER-THE-AIR REKEYING (OTAR) & KMF MANAGEMENT               */}
      {/* ===================================================================== */}
      {activeTab === 'otar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <KeyRound className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  TIA-102.AACA Key Management Facility (KMF) & OTAR Distribution Core
                </h4>
                <p className="text-xs text-slate-500">
                  Centralized cryptographic keyset rotation across federal subscriber radios via Project 25 control channel data packets
                </p>
              </div>
            </div>
            <div className="text-xs text-purple-300 font-mono shrink-0">
              KMF PROTOCOL: TIA-102.AACA • FIPS 140-3 LEVEL 3
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otarKeys.map((key) => (
              <Card key={key.id} className="border-slate-200 bg-white">
                <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {key.keyAlias}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-slate-500">
                      {key.keyId} • {key.keysetType} ({key.algorithm})
                    </span>
                  </div>
                  <Badge
                    variant={
                      key.status === 'CURRENT_EPOCH'
                        ? 'nominal'
                        : key.status === 'ROTATING'
                        ? 'warning'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {key.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Epoch Expiration:</span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {new Date(key.epochExpiration).toLocaleDateString()} ({new Date(key.epochExpiration).toLocaleTimeString()})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Subscribers Synchronized:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {key.syncedRadiosCount} / {key.totalTargetRadios} Radios ({Math.round((key.syncedRadiosCount / key.totalTargetRadios) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all"
                      style={{
                        width: `${(key.syncedRadiosCount / key.totalTargetRadios) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">
                      Alg: AES-256-GCM TIA-102
                    </span>
                    <Button
                      variant={key.status === 'ROTATING' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => initiateOTARekey(key.id)}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Initiate OTAR Key Rekey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 4: EMERGENCY INHIBIT, STUN & ZEROIZE (KILL)                    */}
      {/* ===================================================================== */}
      {activeTab === 'inhibit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">
                Federal Over-the-Air Transceiver Inhibit & Cryptographic Destruction (Kill)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Execute instantaneous TIA-102 Over-the-Air Radio Inhibit (Stun) to electronically lock stolen or unaccounted transceivers. Zeroize commands immediately purge non-volatile cryptographic keystores and flash firmware to prevent unauthorized interception of encrypted federal traffic.
              </p>
            </div>
          </div>

          {/* Inhibited Radios Roster */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Inhibited & Stunned Subscriber Units ({stunnedCount})
            </h3>

            {stunnedCount === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                All federal fleet subscriber radios are currently active and uninhibited.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {radios
                  .filter((r) => r.inhibitState === 'STUNNED' || r.inhibitState === 'ZEROIZED')
                  .map((radio) => (
                    <Card key={radio.id} className="border-rose-500/40 bg-white/80">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-rose-400">
                                {radio.radioId}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {radio.unitId}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">
                              {radio.subscriberName}
                            </h4>
                          </div>
                          <Badge variant="critical" className="text-[10px]">
                            {radio.inhibitState}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex justify-between">
                            <span>Hardware Model:</span>
                            <span className="font-mono text-slate-900">{radio.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Affiliated Site:</span>
                            <span className="font-mono text-slate-900">{radio.lastKnownSite}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cryptographic Status:</span>
                            <span className="font-mono text-rose-400 font-semibold">{radio.encryptionKeyStatus}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                          {radio.inhibitState === 'STUNNED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => triggerInhibitModal(radio, 'REVIVE')}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                              <Power className="w-3.5 h-3.5 mr-1" />
                              Send OTA Revive Command
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Inhibit Audit Ledger */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Cryptographic Inhibit & Zeroize Audit Ledger
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-slate-500 text-[11px] font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">TIMESTAMP</th>
                    <th className="p-2.5">RADIO ID</th>
                    <th className="p-2.5">ACTION</th>
                    <th className="p-2.5">AUTHORIZER</th>
                    <th className="p-2.5">SECURITY RATIONALE</th>
                    <th className="p-2.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {radioInhibitLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="p-2.5 font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {log.radioId}
                      </td>
                      <td className="p-2.5">
                        <Badge
                          variant={log.action === 'REVIVE' ? 'nominal' : 'critical'}
                          className="text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-900">{log.authorizer1}</td>
                      <td className="p-2.5 text-slate-500">{log.reason}</td>
                      <td className="p-2.5 font-mono text-emerald-400 font-semibold">
                        {log.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 5: REPEATER SITES & RF SIMULCAST INFRASTRUCTURE                */}
      {/* ===================================================================== */}
      {activeTab === 'repeaters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-emerald-400" />
                P25 Phase 2 Trunked Repeater Tower Sites ({p25RepeaterSites.length})
              </h3>
              <p className="text-xs text-slate-500">
                National Capital Region 700/800 MHz simulcast core sites, BDA subterranean repeaters, and microwave backhaul links
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p25RepeaterSites.map((site) => (
              <Card key={site.id} className="border-slate-200 bg-white">
                <CardHeader className="p-4 border-b border-slate-200 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {site.name}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-slate-500">
                      {site.siteCode} • {site.location}
                    </span>
                  </div>
                  <Badge
                    variant={site.status === 'OPERATIONAL' ? 'nominal' : 'warning'}
                    className="text-xs"
                  >
                    {site.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Control Channel</span>
                      <span className="font-bold text-emerald-400 text-sm font-mono">
                        {site.controlChannelMhz.toFixed(4)} MHz
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Trunking Mode</span>
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {site.mode}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Noise Floor</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {site.rssiNoiseFloorDbm} dBm
                      </span>
                    </div>
                  </div>

                  {/* Voice Channels Capacity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Simultaneous Voice Slots</span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {site.voiceChannelsActive} / {site.voiceChannelsTotal} Slots ({Math.round((site.voiceChannelsActive / site.voiceChannelsTotal) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(site.voiceChannelsActive / site.voiceChannelsTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] font-mono">
                      GPS: {site.coordinates[0]}° N, {site.coordinates[1]}° W
                    </span>
                    <Button
                      variant={site.mode === 'SITE_TRUNKING' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleSiteTrunkingMode(site.id)}
                      className={`text-xs h-7 ${
                        site.mode === 'SITE_TRUNKING'
                          ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                      {site.mode === 'SITE_TRUNKING' ? 'Restore Wide Simulcast' : 'Switch Site Trunking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 6: RSSI COVERAGE & REAL-TIME TELEMETRY                         */}
      {/* ===================================================================== */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Subscriber Signal Coverage & Health Telemetry ({radios.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real-time RSSI signal strength (dBm), Bit Error Rate (BER), battery discharge telemetry, and GPS positioning
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Real-Time Telemetry Polled',
                  message: 'Average subscriber RSSI: -77.5 dBm • Bit Error Rate: 0.012% (Nominal)',
                  type: 'success',
                })
              }}
              className="text-xs h-7"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Poll Control Channel RSSI
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-slate-500 text-[11px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3">SUBSCRIBER RADIO</th>
                  <th className="p-3">OFFICER / UNIT</th>
                  <th className="p-3">TALKGROUP</th>
                  <th className="p-3">RSSI SIGNAL</th>
                  <th className="p-3">BATTERY</th>
                  <th className="p-3">AFFILIATED RF SITE</th>
                  <th className="p-3">GPS COORDS</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {radios.map((radio) => {
                  const isSignalGood = radio.signalDbm > -80
                  const isSignalFair = radio.signalDbm <= -80 && radio.signalDbm > -95
                  return (
                    <tr key={radio.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <span className="font-mono font-bold text-emerald-400">{radio.radioId}</span>
                        <span className="block text-[10px] text-slate-500">{radio.model}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{radio.subscriberName}</td>
                      <td className="p-3 font-mono text-blue-400">{radio.talkgroup}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSignalGood
                                ? 'bg-emerald-400'
                                : isSignalFair
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-bold text-slate-900">{radio.signalDbm} dBm</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Battery className={`w-3.5 h-3.5 ${radio.batteryPct > 40 ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <span>{radio.batteryPct}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{radio.lastKnownSite}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {radio.gpsCoordinates ? `${radio.gpsCoordinates[0]}° N, ${radio.gpsCoordinates[1]}° W` : '38.8929° N, 77.0299° W'}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            radio.inhibitState === 'STUNNED'
                              ? 'warning'
                              : radio.inhibitState === 'ZEROIZED'
                              ? 'critical'
                              : radio.status === 'ONLINE'
                              ? 'nominal'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {radio.inhibitState && radio.inhibitState !== 'ACTIVE_NORMAL'
                            ? radio.inhibitState
                            : radio.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ENROLL SUBSCRIBER RADIO                                      */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll P25 Phase 2 Subscriber Radio"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Radio ID (P25 ID)</label>
              <Input
                value={newRadioId}
                onChange={(e) => setNewRadioId(e.target.value)}
                placeholder="e.g. P25-88120"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Unit ID (UID)</label>
              <Input
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                placeholder="e.g. UID-7050"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Subscriber Officer / Assigned Name</label>
            <Input
              value={newSubscriberName}
              onChange={(e) => setNewSubscriberName(e.target.value)}
              placeholder="e.g. Inspector David Vance"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Hardware Model</label>
              <Select
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              >
                <option value="Motorola APX 8000">Motorola APX 8000 (All-Band)</option>
                <option value="Motorola APX 8000XE">Motorola APX 8000XE (Tactical Hazmat)</option>
                <option value="L3Harris XL-200P">L3Harris XL-200P (LTE Convergence)</option>
                <option value="Kenwood Viking VP6000">Kenwood Viking VP6000</option>
              </Select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Lead Agency</label>
              <Select
                value={newAgency}
                onChange={(e) => setNewAgency(e.target.value)}
              >
                <option value="FPS">DHS FPS</option>
                <option value="CBP">CBP</option>
                <option value="USSS">USSS</option>
                <option value="FEMA">FEMA</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Assigned Talkgroup</label>
              <Select
                value={newTalkgroup}
                onChange={(e) => setNewTalkgroup(e.target.value)}
              >
                {p25Talkgroups.map((tg) => (
                  <option key={tg.id} value={tg.name}>
                    {tg.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Serial Number</label>
              <Input
                value={newSerialNumber}
                onChange={(e) => setNewSerialNumber(e.target.value)}
                placeholder="e.g. 584CLP9929"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Enroll Subscriber
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: PROVISION TALKGROUP MODAL                                    */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isProvisionTgModalOpen}
        onClose={() => setIsProvisionTgModalOpen(false)}
        title="Provision P25 Phase 2 Talkgroup"
      >
        <form onSubmit={handleProvisionTgSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Talkgroup ID (TGID)</label>
              <Input
                value={newTgId}
                onChange={(e) => setNewTgId(e.target.value)}
                placeholder="106"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Agency</label>
              <Select
                value={newTgAgency}
                onChange={(e) => setNewTgAgency(e.target.value)}
              >
                <option value="FPS">FPS</option>
                <option value="CBP">CBP</option>
                <option value="USSS">USSS</option>
                <option value="FEMA">FEMA</option>
                <option value="MULTI-AGENCY">Multi-Agency</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Talkgroup Name</label>
            <Input
              value={newTgName}
              onChange={(e) => setNewTgName(e.target.value)}
              placeholder="e.g. TG-106-FPS-TACTICAL-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1">Priority Class</label>
              <Select
                value={newTgPriority}
                onChange={(e) => setNewTgPriority(e.target.value)}
              >
                <option value="1">Priority 1 (Command & Tactical)</option>
                <option value="2">Priority 2 (Operational Patrol)</option>
                <option value="3">Priority 3 (Routine Admin)</option>
              </Select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Assigned TDMA Slot</label>
              <Input
                value={newTgChannel}
                onChange={(e) => setNewTgChannel(e.target.value)}
                placeholder="Slot 1 (852.5375 MHz)"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enc-check"
              checked={newTgEncryption}
              onChange={(e) => setNewTgEncryption(e.target.checked)}
              className="rounded border-slate-200"
            />
            <label htmlFor="enc-check" className="cursor-pointer text-slate-900">
              Enforce AES-256-GCM Mandatory Voice Encryption
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProvisionTgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Register Talkgroup
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: CONFIRM INHIBIT / ZEROIZE MODAL                              */}
      {/* ===================================================================== */}
      {selectedInhibitTarget && (
        <Modal
          isOpen={isInhibitConfirmModalOpen}
          onClose={() => setIsInhibitConfirmModalOpen(false)}
          title={`Confirm Over-the-Air ${inhibitActionType}: ${selectedInhibitTarget.radioId}`}
        >
          <div className="space-y-4 text-xs">
            <div className={`p-3 rounded-lg border ${
              inhibitActionType === 'ZEROIZE'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            } space-y-1`}>
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Over-the-Air Command Execution
              </span>
              <p className="text-[11px] leading-relaxed">
                {inhibitActionType === 'ZEROIZE'
                  ? `WARNING: You are authorizing an irreversible cryptographic zeroization of radio ${selectedInhibitTarget.radioId}. All TEK/KEK encryption keys and flash parameters will be wiped.`
                  : inhibitActionType === 'STUN'
                  ? `You are transmitting an over-the-air inhibit signal to disable transceiver operations on ${selectedInhibitTarget.radioId} (${selectedInhibitTarget.subscriberName}).`
                  : `You are transmitting an over-the-air revive signal to restore active transceiver operations on ${selectedInhibitTarget.radioId}.`}
              </p>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Subscriber Officer:</span>
                <span className="font-semibold text-slate-900">{selectedInhibitTarget.subscriberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit ID / Hardware:</span>
                <span className="font-mono text-slate-900">{selectedInhibitTarget.unitId} • {selectedInhibitTarget.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Talkgroup:</span>
                <span className="font-mono text-blue-400">{selectedInhibitTarget.talkgroup}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Audit Rationale / Security Justification</label>
              <textarea
                rows={2}
                value={inhibitReason}
                onChange={(e) => setInhibitReason(e.target.value)}
                className="w-full bg-background border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInhibitConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExecuteInhibit}
                className={
                  inhibitActionType === 'ZEROIZE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white font-semibold'
                    : inhibitActionType === 'STUN'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                }
              >
                Confirm & Transmit OTA {inhibitActionType}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
