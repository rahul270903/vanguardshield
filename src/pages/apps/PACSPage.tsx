import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  KeyRound,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  UserCheck,
  CreditCard,
  Layers,
  Server,
  Activity,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Camera,
  Download,
  AlertOctagon,
  FileText,
  Clock,
  Compass,
  Building,
  Key,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import {
  PortalDoor,
  CardholderRecord,
  AccessZone,
  AccessController,
  AccessEvent,
} from '../../types/modules'
import {
  SEED_PORTAL_DOORS,
  SEED_CARDHOLDERS,
  SEED_ACCESS_ZONES,
  SEED_ACCESS_CONTROLLERS,
  SEED_ACCESS_EVENTS,
} from '../../store/seedData'

export const PACSPage: React.FC = () => {
  const store = useVanguardStore()
  const {
    activeAgencyId,
    agencies,
    currentFpconLevel,
    momentaryUnlockDoor,
    lockdownPortal,
    clearDoorAlarm,
    setFpconLevel,
    updateCardholderStatus,
    toggleAntiPassback,
    simulateBadgeTap,
    addToast,
  } = store

  const portalDoors: PortalDoor[] = store.portalDoors?.length ? store.portalDoors : SEED_PORTAL_DOORS
  const cardholders: CardholderRecord[] = store.cardholders?.length ? store.cardholders : SEED_CARDHOLDERS
  const accessZones: AccessZone[] = store.accessZones?.length ? store.accessZones : SEED_ACCESS_ZONES
  const accessControllers: AccessController[] = store.accessControllers?.length ? store.accessControllers : SEED_ACCESS_CONTROLLERS
  const accessEvents: AccessEvent[] = store.accessEvents?.length ? store.accessEvents : SEED_ACCESS_EVENTS

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]

  // Active Screen Tab (6 Screens)
  const [activeTab, setActiveTab] = useState<'doors' | 'cardholders' | 'zones' | 'controllers' | 'threat' | 'audit'>('doors')

  // Screen 1: Door Filter & Selected Door
  const [doorFilter, setDoorFilter] = useState<'ALL' | 'SECURE' | 'ALARMS' | 'LOCKDOWN'>('ALL')
  const [selectedDoorId, setSelectedDoorId] = useState<string>(portalDoors[0]?.id || 'door-4b')
  const selectedDoor = portalDoors.find((d) => d.id === selectedDoorId) || portalDoors[0]

  // Screen 1: Badge Tap Simulator State
  const [simDoorId, setSimDoorId] = useState<string>(portalDoors[0]?.id || 'door-4b')
  const [simCardholderId, setSimCardholderId] = useState<string>(cardholders[0]?.id || 'crd-01')

  // Screen 6: Audit Filter
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'GRANTED' | 'DENIED' | 'ALARMS'>('ALL')

  // Modals state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [newCardholderName, setNewCardholderName] = useState('Deputy Marshal Elena Cruz')
  const [newCardholderAgency, setNewCardholderAgency] = useState('U.S. Marshals Service (USMS)')
  const [newCardholderClearance, setNewCardholderClearance] = useState('TOP SECRET')
  const [newCardholderPiv, setNewCardholderPiv] = useState('PIV-5512-8841-209')

  const [lockdownConfirmModalOpen, setLockdownConfirmModalOpen] = useState(false)

  const handleExecuteBadgeSim = () => {
    simulateBadgeTap(simDoorId, simCardholderId)
  }

  const handleEnrollCardholder = () => {
    addToast({
      title: 'PIV Credential Enrolled',
      message: `Enrolled ${newCardholderName} with FIPS 201 compliance certificate`,
      type: 'success',
    })
    setEnrollModalOpen(false)
  }

  const handleGlobalLockdown = () => {
    portalDoors.forEach((d) => {
      if (d.status !== 'LOCKDOWN') {
        lockdownPortal(d.id)
      }
    })
    setFpconLevel('DELTA')
    setLockdownConfirmModalOpen(false)
    addToast({
      title: 'GLOBAL FACILITY LOCKDOWN ENFORCED',
      message: 'All portals locked. FPCON DELTA activated.',
      type: 'error',
    })
  }

  const filteredDoors = portalDoors.filter((d) => {
    if (doorFilter === 'ALL') return true
    if (doorFilter === 'SECURE') return d.status === 'SECURE'
    if (doorFilter === 'ALARMS') return d.status === 'FORCED_ALARM' || d.status === 'PROPPED_ALARM'
    if (doorFilter === 'LOCKDOWN') return d.status === 'LOCKDOWN'
    return true
  })

  const filteredAuditEvents = accessEvents.filter((evt) => {
    if (auditFilter === 'ALL') return true
    if (auditFilter === 'GRANTED') return evt.result === 'GRANTED'
    if (auditFilter === 'DENIED') return evt.result === 'DENIED_INVALID_PIN' || evt.result === 'DENIED_REVOKED'
    if (auditFilter === 'ALARMS') return evt.result === 'DOOR_FORCED_ALARM'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 03 // PACS Core
                </span>
                <span className="text-xs text-slate-400">FIPS 201-3 / FICAM Compliant</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  OSDP v2 Encrypted Bus
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Physical Access Control / PIV
              </h1>
              <p className="text-xs text-slate-400">
                Authenticate PIV/CAC credentials, enforce zone security clearance, control portals, and detect forced entry intrusion.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">FPCON Level:</span>
              <span
                className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                  currentFpconLevel === 'DELTA'
                    ? 'bg-red-600 text-white animate-pulse'
                    : currentFpconLevel === 'CHARLIE'
                    ? 'bg-amber-600 text-white'
                    : currentFpconLevel === 'BRAVO'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentFpconLevel}
              </span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLockdownConfirmModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Facility Lockdown</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEnrollModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll PIV Card</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('doors')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'doors'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Door & Portal Monitor ({portalDoors.length})</span>
            {portalDoors.some((d) => d.status === 'FORCED_ALARM') && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cardholders')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cardholders'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cardholder Registry ({cardholders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'zones'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Access Zones & Anti-Passback</span>
          </button>

          <button
            onClick={() => setActiveTab('controllers')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'controllers'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Controller Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('threat')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'threat'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Threat Level & Lockdown Console</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Access Audit & Investigation</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SCREEN 1: DOOR & PORTAL MONITOR */}
      {/* ========================================================= */}
      {activeTab === 'doors' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Portal Cards List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
                {(['ALL', 'SECURE', 'ALARMS', 'LOCKDOWN'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDoorFilter(filter)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      doorFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {filteredDoors.length} Portals Monitored
              </span>
            </div>

            {/* Portal Cards Grid */}
            <div className="grid grid-cols-1 gap-3">
              {filteredDoors.map((door) => {
                const isSelected = door.id === selectedDoor?.id
                return (
                  <div
                    key={door.id}
                    onClick={() => setSelectedDoorId(door.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{door.doorCode}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            door.status === 'FORCED_ALARM'
                              ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                              : door.status === 'PROPPED_ALARM'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : door.status === 'UNLOCKED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : door.status === 'LOCKDOWN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {door.status}
                        </span>
                        <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {door.readerType}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">FPCON: {door.fpconLockLevel}</span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 mb-1">{door.name}</div>
                    <div className="text-xs text-slate-500 mb-3">{door.zoneName} • {door.facility}</div>

                    {door.lastAccessEvent && (
                      <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-700 border border-slate-100 mb-3 truncate">
                        Last Transaction: {door.lastAccessEvent}
                      </div>
                    )}

                    {/* Operational Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            momentaryUnlockDoor(door.id)
                          }}
                          className="text-[11px] py-1 px-2.5 h-auto flex items-center space-x-1"
                        >
                          <Unlock className="w-3 h-3 text-blue-600" />
                          <span>Momentary Unlock</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            lockdownPortal(door.id)
                          }}
                          className="text-[11px] py-1 px-2.5 h-auto text-purple-700"
                        >
                          {door.status === 'LOCKDOWN' ? 'Release Lockdown' : 'Lockdown'}
                        </Button>
                      </div>

                      {door.status === 'FORCED_ALARM' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearDoorAlarm(door.id)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[11px] py-1 px-2.5 h-auto"
                        >
                          Clear Forced Alarm
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Portal Detail, Live CCTV Link & Badge Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedDoor ? (
              <>
                <Card className="border-t-4 border-t-blue-600">
                  <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Portal Diagnostics: {selectedDoor.doorCode}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedDoor.name}</p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Security Zone</span>
                      <span className="font-semibold text-slate-900">{selectedDoor.zoneName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Intelligent Controller</span>
                      <span className="font-mono text-blue-700">{selectedDoor.controllerId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Reader Authentication</span>
                      <span className="font-semibold text-slate-800">{selectedDoor.readerType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">OSDP Secure Channel</span>
                      <span className="font-mono text-emerald-600 font-bold">AES-128 Supervised</span>
                    </div>

                    {/* Correlated Camera Cross-Link */}
                    <div className="p-3 bg-slate-900 text-white rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="flex items-center text-emerald-400">
                          <Camera className="w-3.5 h-3.5 mr-1" />
                          Correlated CCTV Feed
                        </span>
                        <span>{selectedDoor.correlatedCameraId}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Camera slews automatically to Door 4B upon intrusion or forced entry alert.
                      </div>
                      <Link to="/apps/vms">
                        <Button variant="secondary" size="sm" className="w-full text-xs text-blue-300 border-slate-700 bg-slate-800 hover:bg-slate-700">
                          View Camera on VMS Wall
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Interactive PIV Badge Tap Simulator Card */}
                <Card className="border-t-4 border-t-emerald-600">
                  <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Interactive PIV Card Tap Simulator
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Present simulated federal credentials to test real-time OSDP authentication & audit ledger.
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Portal Reader</label>
                      <Select
                        value={simDoorId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSimDoorId(e.target.value)}
                        options={portalDoors.map((d) => ({
                          value: d.id,
                          label: `[${d.doorCode}] ${d.name}`,
                        }))}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Presenting Cardholder</label>
                      <Select
                        value={simCardholderId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSimCardholderId(e.target.value)}
                        options={cardholders.map((c) => ({
                          value: c.id,
                          label: `${c.name} (${c.agencyCode} • ${c.certificateStatus})`,
                        }))}
                        className="text-xs"
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleExecuteBadgeSim}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Present PIV Card (Simulate Swipe)</span>
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: CARDHOLDER REGISTRY */}
      {/* ========================================================= */}
      {activeTab === 'cardholders' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Federal PIV / CAC Cardholder Credential Registry
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  FIPS 201-3 Personal Identity Verification, FASC-N registration, cryptographic certificate validation, and clearance level access matrix.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEnrollModalOpen(true)}
                className="text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll New PIV Credential</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Cardholder Name</th>
                    <th className="py-3 px-4">Agency</th>
                    <th className="py-3 px-4">Clearance</th>
                    <th className="py-3 px-4">PIV Number / FASC-N</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Certificate Status</th>
                    <th className="py-3 px-4">PIN State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cardholders.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                            {card.photoInitials}
                          </span>
                          <span>{card.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{card.agencyCode}</span>
                        <div className="text-[10px] text-slate-400">{card.agency}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            card.clearance === 'TS_SCI' || card.clearance === 'TOP SECRET'
                              ? 'bg-purple-100 text-purple-800'
                              : card.clearance === 'SECRET'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {card.clearance}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{card.pivCardNumber}</div>
                        <div className="text-[10px] text-slate-500">{card.fascn}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{card.expirationDate}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            card.certificateStatus === 'VALID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : card.certificateStatus === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {card.certificateStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{card.pivPinStatus}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Select
                          value={card.certificateStatus}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            updateCardholderStatus(
                              card.id,
                              e.target.value as CardholderRecord['certificateStatus'],
                              card.pivPinStatus
                            )
                          }
                          options={[
                            { value: 'VALID', label: 'Set VALID' },
                            { value: 'SUSPENDED', label: 'Set SUSPENDED' },
                            { value: 'REVOKED', label: 'Set REVOKED' },
                          ]}
                          className="text-[10px] py-0.5 px-1.5 w-28 ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 3: ACCESS ZONES & ANTI-PASSBACK */}
      {/* ========================================================= */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Security Classification Zones & Anti-Passback Topology
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hierarchical security boundaries, strict anti-passback rule enforcement, and escort mandates.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">Anti-Passback Engine: Active</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Zone Code</th>
                    <th className="py-3 px-4">Zone Designation</th>
                    <th className="py-3 px-4">Classification Level</th>
                    <th className="py-3 px-4">Portals</th>
                    <th className="py-3 px-4">On-Site Occupants</th>
                    <th className="py-3 px-4">Anti-Passback</th>
                    <th className="py-3 px-4">Escort Required</th>
                    <th className="py-3 px-4 text-right">Policy Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{zone.zoneCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{zone.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {zone.securityLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{zone.doorsCount} Doors</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{zone.activeOccupants} Personnel</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            zone.antiPassbackMode === 'STRICT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {zone.antiPassbackMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {zone.escortRequired ? (
                          <span className="text-amber-700 font-bold text-[10px] flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Yes (Escort Mandated)
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleAntiPassback(zone.id)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          Toggle APB ({zone.antiPassbackMode === 'STRICT' ? 'Set Soft' : 'Set Strict'})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4: HARDWARE CONTROLLER TOPOLOGY */}
      {/* ========================================================= */}
      {activeTab === 'controllers' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Mercury & HID Intelligent Access Controllers
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  OSDP v2 encrypted RS-485 reader buses, supervised cabinet tamper loops, and edge controller diagnostics.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">OSDP v2 AES-128 Validated</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Controller Code</th>
                    <th className="py-3 px-4">Hardware Model</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Firmware</th>
                    <th className="py-3 px-4">OSDP Bus Channel</th>
                    <th className="py-3 px-4">Cabinet Tamper</th>
                    <th className="py-3 px-4">Connected Readers</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessControllers.map((ctrl) => (
                    <tr key={ctrl.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ctrl.controllerCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{ctrl.model}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{ctrl.ipAddress}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{ctrl.firmwareVersion}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700">{ctrl.osdpChannel}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {ctrl.tamperStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">{ctrl.connectedReadersCount} Readers</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {ctrl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 5: THREAT LEVEL & LOCKDOWN CONSOLE */}
      {/* ========================================================= */}
      {activeTab === 'threat' && (
        <div className="space-y-6">
          {/* FPCON Condition Selector Card */}
          <Card className="border-t-4 border-t-amber-600">
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
              <CardTitle className="text-sm font-semibold text-slate-900">
                DoD / Federal Force Protection Conditions (FPCON)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic posture adjustment modifies reader PIN requirements, escort rules, and automatic portal lock states across all federal facilities.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {(['NORMAL', 'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA'] as const).map((level) => {
                  const isCurrent = currentFpconLevel === level
                  return (
                    <div
                      key={level}
                      onClick={() => setFpconLevel(level)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{level}</span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {level === 'NORMAL' && 'General threat of possible terrorist activity. Routine PIV card access.'}
                        {level === 'ALPHA' && 'Increased general threat. Random vehicle checks and perimeter monitoring.'}
                        {level === 'BRAVO' && 'Predictable threat with elevated risk. Strict PIV verification at portals.'}
                        {level === 'CHARLIE' && 'Incident occurred or intelligence indicates imminent terrorist targeting. Escort mandatory.'}
                        {level === 'DELTA' && 'Attack has occurred or terrorist action against specific location. Full portal lockdown.'}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Emergency Muster Evacuation Accountability */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Emergency Evacuation Muster Accountability
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Real-time head count based on badge-in/badge-out anti-passback tracking.
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-emerald-600">63 / 63 Personnel</div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">100% Accounted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 6: ACCESS AUDIT & INVESTIGATION */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  PACS Access Transaction History & Intrusion Events
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Append-only tamper-evident reader transactions correlated with CCTV event markers.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {(['ALL', 'GRANTED', 'DENIED', 'ALARMS'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAuditFilter(filter)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      auditFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Portal Reader</th>
                    <th className="py-3 px-4">Presented Cardholder</th>
                    <th className="py-3 px-4">PIV Credential</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Correlated Camera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{evt.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{evt.doorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{evt.readerId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{evt.cardholderName}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{evt.pivCardNumber}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.result === 'GRANTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.result === 'DOOR_FORCED_ALARM'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {evt.result}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {evt.correlatedCameraId ? (
                          <Link to="/apps/vms" className="text-blue-600 font-mono text-[11px] hover:underline flex items-center">
                            <Camera className="w-3 h-3 mr-1" />
                            {evt.correlatedCameraId}
                          </Link>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ENROLL NEW PIV CREDENTIAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title="Enroll New FIPS 201 PIV Credential"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provision a federal Personal Identity Verification (PIV) or CAC credential into the PACS authorization database.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Full Name</label>
            <Input
              value={newCardholderName}
              onChange={(e) => setNewCardholderName(e.target.value)}
              placeholder="e.g. Deputy Marshal Elena Cruz"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agency</label>
              <Input
                value={newCardholderAgency}
                onChange={(e) => setNewCardholderAgency(e.target.value)}
                placeholder="U.S. Marshals Service"
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clearance Level</label>
              <Select
                value={newCardholderClearance}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCardholderClearance(e.target.value)}
                options={[
                  { value: 'UNCLASSIFIED', label: 'UNCLASSIFIED' },
                  { value: 'SECRET', label: 'SECRET' },
                  { value: 'TOP SECRET', label: 'TOP SECRET' },
                  { value: 'TS_SCI', label: 'TS / SCI' },
                ]}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PIV Card Serial Number</label>
            <Input
              value={newCardholderPiv}
              onChange={(e) => setNewCardholderPiv(e.target.value)}
              placeholder="PIV-5512-8841-209"
              className="text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
            Cardholder identity certificate will be checked against the Federal Bridge Certification Authority (FBCA) via OCSP.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEnrollCardholder}>
              Enroll PIV Credential
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CONFIRM GLOBAL FACILITY LOCKDOWN */}
      {/* ========================================================= */}
      <Modal
        isOpen={lockdownConfirmModalOpen}
        onClose={() => setLockdownConfirmModalOpen(false)}
        title="CRITICAL: Confirm Global Facility Lockdown"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-start space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Emergency Action Warning</div>
              <p className="mt-0.5">
                Triggering global facility lockdown will immediately force lock all portals, suspend standard cardholder access, elevate FPCON to DELTA, and alert the Watch Commander.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            This action requires Watch Commander authority pursuant to FPS Directive 14.1.
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setLockdownConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleGlobalLockdown}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Enforce Global Lockdown
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
