import React, { useState, useMemo } from 'react'
import {
  Camera,
  Video,
  Radio,
  HardDrive,
  Battery,
  BatteryCharging,
  Wifi,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  RadioTower,
  RefreshCw,
  Search,
  Layers,
  Lock,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
  FileText,
  Tag,
  Database,
  UploadCloud,
  Fingerprint,
  Mic,
  Volume2,
  Maximize2,
  Eye,
  Zap,
  Crosshair,
  Car,
  AlertOctagon,
  FileCheck2,
  Server,
  Share2,
  MapPin,
  Info,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { BWCDevice, BWCRecordingTrigger, BWCClipMetadata } from '../../types/modules'

export type BWCTabType = 'fleet' | 'streaming' | 'triggers' | 'docking' | 'metadata' | 'compliance'

export const VRSMBWCPage: React.FC = () => {
  const {
    bwcDevices,
    bwcTriggers,
    bwcDockingStations,
    bwcClips,
    auditLogs,
    activeAgencyId,
    toggleBWCRecording,
    requestBWCStream,
    stopBWCStream,
    triggerBWCEvent,
    offloadClipToDEMS,
    updateClipMetadata,
    addToast,
    logAuditEvent,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<BWCTabType>('fleet')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('bwc-01')

  // Search & Filters for Fleet
  const [searchQuery, setSearchQuery] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  // Streaming matrix focus
  const [matrixGrid, setMatrixGrid] = useState<'1x1' | '2x2' | 'quad'>('2x2')
  const [selectedStreamId, setSelectedStreamId] = useState<string>('bwc-01')
  const [audioMuted, setAudioMuted] = useState(false)

  // Sensor Trigger Simulator State
  const [simTargetDevice, setSimTargetDevice] = useState<string>('bwc-01')
  const [simTriggerType, setSimTriggerType] = useState<BWCRecordingTrigger['triggerType']>('HOLSTER_DRAW')
  const [simTriggerNotes, setSimTriggerNotes] = useState('Automated telemetry trip: Smart Holster BLE Hall sensor weapon draw')

  // Metadata Editing State
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-01')
  const [editCategory, setEditCategory] = useState<BWCClipMetadata['category']>('USE_OF_FORCE')
  const [editCadIncident, setEditCadIncident] = useState('CAD-2026-8812')
  const [editNotes, setEditNotes] = useState('Special Agent Carter engaged suspect after holster draw. Pre-buffer intact.')

  // Current selected device
  const selectedDevice = useMemo(
    () => bwcDevices.find((d) => d.id === selectedDeviceId) || bwcDevices[0],
    [bwcDevices, selectedDeviceId]
  )

  // Current selected clip
  const selectedClip = useMemo(
    () => bwcClips.find((c) => c.id === selectedClipId) || bwcClips[0],
    [bwcClips, selectedClipId]
  )

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return bwcDevices.filter((dev) => {
      const matchesSearch =
        dev.deviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.assignedOfficer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.officerBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.model.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAgency = agencyFilter === 'ALL' || dev.agency === agencyFilter
      const matchesStatus = statusFilter === 'ALL' || dev.status === statusFilter
      const matchesType = typeFilter === 'ALL' || dev.deviceType === typeFilter

      return matchesSearch && matchesAgency && matchesStatus && matchesType
    })
  }, [bwcDevices, searchQuery, agencyFilter, statusFilter, typeFilter])

  // Aggregate fleet stats
  const totalFleet = bwcDevices.length
  const activeRecordingCount = bwcDevices.filter((d) => d.status === 'RECORDING').length
  const standbyCount = bwcDevices.filter((d) => d.status === 'BUFFERING_STANDBY').length
  const streamingCount = bwcDevices.filter((d) => d.liveStreamingActive).length
  const avgBattery = Math.round(
    bwcDevices.reduce((acc, d) => acc + d.batteryPct, 0) / (totalFleet || 1)
  )

  // BWC-specific audit events
  const bwcAuditLogs = useMemo(() => {
    return auditLogs.filter(
      (a) =>
        a.action.startsWith('BWC_') ||
        a.targetEntity === 'BWCDevice' ||
        a.targetEntity === 'BWCClipMetadata'
    )
  }, [auditLogs])

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 10 // VRSM-BWC
                </span>
                <span className="text-xs text-slate-400">CJIS v5.9 / Axon &amp; WatchGuard / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  VRSM Fleet Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Vehicle &amp; Body-Worn Sensor Video (VRSM-BWC)
              </h1>
              <p className="text-xs text-slate-400">
                Axon Body 4 &amp; WatchGuard V300 Telemetry • Automated Holster &amp; Crash Sensors • Gigabit Docking Offload • DEMS Ingestion
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Fleet Health Ping Dispatched',
                  message: 'All transceivers and body-worn sensors responded nominal via LTE/FirstNet',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Ping Fleet</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab('triggers')
                addToast({
                  title: 'Sensor Integration Mode',
                  message: 'Select device to simulate holster-draw or crash accelerometer sensor trip',
                  type: 'info',
                })
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Trigger</span>
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
            <Camera className="w-3.5 h-3.5" />
            <span>Sensor &amp; BWC Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {bwcDevices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('streaming')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'streaming'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Video Streams</span>
            {activeRecordingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {activeRecordingCount} Rec
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('triggers')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'triggers'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automated Triggers</span>
          </button>

          <button
            onClick={() => setActiveTab('docking')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'docking'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Gigabit Docking Stations</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Evidence &amp; Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CJIS &amp; Policy Compliance</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Sensors</span>
            <Camera className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{bwcDevices.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Axon Body 4 &amp; V300</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Recording Active</span>
            <Video className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono">{activeRecordingCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Encrypted Livestream
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Triggers (24h)</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{bwcTriggers.length}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Holster / Crash Automated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Docked Offloading</span>
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{bwcDockingStations.filter((d) => d.offloadStatus === "OFFLOADING_ACTIVE").length}</div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Gigabit DEMS Pipeline</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CJIS Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">100% PASS</div>
          <div className="text-[10px] text-slate-500 mt-0.5">FIPS 140-3 Cryptographic</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Offload Ingested</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">248.5 GB</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DEMS SHA-256 Validated</div>
        </div>
      </div>


{/* Screen 1: BWC & In-Car Fleet Operations Hub */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search camera code, officer name, badge, or hardware model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Agencies</option>
                <option value="FPS">FPS</option>
                <option value="USSS">USSS</option>
                <option value="CBP">CBP</option>
                <option value="FEMA">FEMA</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECORDING">RECORDING</option>
                <option value="BUFFERING_STANDBY">BUFFERING STANDBY</option>
                <option value="DOCKED_UPLOADING">DOCKED UPLOADING</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Device Types</option>
                <option value="BODY_WORN_CAMERA">Body-Worn Camera</option>
                <option value="IN_CAR_DASHCAM">In-Car Dashcam</option>
                <option value="HELMET_CAM">Helmet Tactical Cam</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setAgencyFilter('ALL')
                  setStatusFilter('ALL')
                  setTypeFilter('ALL')
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Camera Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((dev) => {
              const isRecording = dev.status === 'RECORDING'
              const isDocked = dev.status === 'DOCKED_UPLOADING'
              const isSelected = dev.id === selectedDeviceId

              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white border-red-500/60 ring-1 ring-red-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  {/* Top Row: Device Code & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{dev.deviceCode}</span>
                        <Badge variant="outline">{dev.agency}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        {dev.deviceType === 'BODY_WORN_CAMERA' && <Camera className="w-3 h-3 text-red-400" />}
                        {dev.deviceType === 'IN_CAR_DASHCAM' && <Car className="w-3 h-3 text-blue-400" />}
                        {dev.deviceType === 'HELMET_CAM' && <Shield className="w-3 h-3 text-amber-400" />}
                        <span>{dev.model}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isRecording && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          RECORDING
                        </span>
                      )}
                      {dev.status === 'BUFFERING_STANDBY' && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-2.5 h-2.5" />
                          STANDBY BUFFER
                        </span>
                      )}
                      {isDocked && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <UploadCloud className="w-2.5 h-2.5" />
                          DOCKED UPLOADING
                        </span>
                      )}
                      {dev.status === 'OFFLINE' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-slate-500">
                          OFFLINE
                        </span>
                      )}

                      {dev.liveStreamingActive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          LIVE STREAM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Officer Assignment */}
                  <div className="p-2.5 rounded-lg bg-background/60 border border-slate-200 mb-3 space-y-1">
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Assigned Officer</span>
                      <span className="font-mono text-slate-900 font-semibold">{dev.officerBadge}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">{dev.assignedOfficer}</div>
                  </div>

                  {/* Telemetry Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2 rounded bg-background/40 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3 h-3 text-emerald-400" /> Battery
                        </span>
                        <span className="font-mono text-slate-900">{dev.batteryPct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dev.batteryPct > 40 ? 'bg-emerald-500' : dev.batteryPct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${dev.batteryPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded bg-background/40 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-blue-400" /> Storage
                        </span>
                        <span className="font-mono text-slate-900">
                          {dev.storageUsedGb}/{dev.storageCapacityGb} GB
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${(dev.storageUsedGb / dev.storageCapacityGb) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mb-3 pt-1 border-t border-slate-200">
                    <span>FW: {dev.firmwareVersion}</span>
                    <span>GPS: {dev.gpsCoordinates[0].toFixed(3)}, {dev.gpsCoordinates[1].toFixed(3)}</span>
                    {dev.lastTriggerSource && (
                      <span className="text-rose-400 font-semibold">{dev.lastTriggerSource}</span>
                    )}
                  </div>

                  {/* Operational Controls: No Dead Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant={isRecording ? 'destructive' : 'primary'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBWCRecording(dev.id)
                      }}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-3 h-3 mr-1" /> Standby
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" /> Force Record
                        </>
                      )}
                    </Button>

                    {dev.liveStreamingActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          stopBWCStream(dev.id)
                        }}
                      >
                        Stop Stream
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          requestBWCStream(dev.id)
                          setActiveTab('streaming')
                          setSelectedStreamId(dev.id)
                        }}
                      >
                        <Video className="w-3 h-3 mr-1" /> Live Feed
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      title="View sensor trigger options"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSimTargetDevice(dev.id)
                        setActiveTab('triggers')
                      }}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Live Situational Streaming & Tactical Video Matrix */}
      {activeTab === 'streaming' && (
        <div className="space-y-4">
          {/* Tactical Matrix Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                WebRTC Tactical Live Video Matrix
                <Badge variant="nominal">Ultra-Low Latency (&lt;200ms)</Badge>
              </h3>
              <p className="text-xs text-slate-500">
                FirstNet / LTE Encrypted Field Stream • Dual H.265 / AV1 Hardware Pipeline • FIPS 140-3 SRTP Transport
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-background rounded-lg border border-slate-200 p-0.5">
                <button
                  onClick={() => setMatrixGrid('1x1')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    matrixGrid === '1x1' ? 'bg-muted text-slate-900' : 'text-slate-500'
                  }`}
                >
                  1x1
                </button>
                <button
                  onClick={() => setMatrixGrid('2x2')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    matrixGrid === '2x2' ? 'bg-muted text-slate-900' : 'text-slate-500'
                  }`}
                >
                  2x2
                </button>
                <button
                  onClick={() => setMatrixGrid('quad')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    matrixGrid === 'quad' ? 'bg-muted text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Grid
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioMuted(!audioMuted)}
                className={audioMuted ? 'text-rose-400' : 'text-emerald-400'}
              >
                {audioMuted ? <Mic className="w-3.5 h-3.5 mr-1 text-rose-400 line-through" /> : <Mic className="w-3.5 h-3.5 mr-1" />}
                {audioMuted ? 'Audio Muted' : 'Audio On'}
              </Button>
            </div>
          </div>

          {/* Supervisor Live View Advisory Notice (CJIS Compliance) */}
          <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">
                CJIS Standard 5.9 Supervisor Live-Stream Advisory & Audit Protocol
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Initiating live video feed transmits a discrete visual/haptic chime to the officer's camera unit to maintain compliance with federal privacy guidelines. Every frame, session start, duration, and supervisor identity is permanently registered in the non-repudiable audit ledger.
              </p>
            </div>
          </div>

          {/* Matrix Tiles Grid */}
          <div
            className={`grid gap-4 ${
              matrixGrid === '1x1'
                ? 'grid-cols-1'
                : matrixGrid === '2x2'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {bwcDevices
              .filter((d) => (matrixGrid === '1x1' ? d.id === selectedStreamId : true))
              .map((cam) => {
                const isSelected = cam.id === selectedStreamId
                const isStreaming = cam.liveStreamingActive

                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedStreamId(cam.id)}
                    className={`rounded-lg border overflow-hidden flex flex-col transition-all ${
                      isSelected
                        ? 'border-purple-500/80 ring-1 ring-purple-500/30 shadow-lg'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Simulated Camera Video Viewport */}
                    <div className="relative aspect-video bg-neutral-950 flex flex-col justify-between p-3 select-none">
                      {/* Top HUD Overlay */}
                      <div className="flex items-center justify-between text-xs text-white/90 drop-shadow-md z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-black/60 px-2 py-0.5 rounded border border-white/20">
                            {cam.deviceCode}
                          </span>
                          <span className="text-[10px] bg-red-600/80 px-1.5 py-0.5 rounded font-mono font-semibold">
                            {cam.agency}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {cam.status === 'RECORDING' ? (
                            <span className="flex items-center gap-1 text-rose-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-rose-500/40">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              REC 00:14:28
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold bg-black/60 px-2 py-0.5 rounded">
                              STBY BUFFER 30s
                            </span>
                          )}
                          <span className="bg-black/60 px-1.5 py-0.5 rounded text-white/80">{cam.streamResolution}</span>
                        </div>
                      </div>

                      {/* Center Crosshair or Feed Placeholder */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center opacity-40">
                          <Crosshair className="w-6 h-6 text-white/40" />
                        </div>
                        <span className="text-[10px] text-white/40 font-mono mt-2">
                          {isStreaming ? 'WebRTC LIVE • 185ms • 60 FPS' : 'STANDBY FEED READY'}
                        </span>
                      </div>

                      {/* Bottom HUD Overlay */}
                      <div className="flex items-end justify-between text-[11px] text-white/80 font-mono drop-shadow-md z-10">
                        <div>
                          <div className="text-white font-semibold text-xs drop-shadow">{cam.assignedOfficer}</div>
                          <div className="text-white/60 text-[10px]">
                            LAT {cam.gpsCoordinates[0].toFixed(4)}° N • LON {cam.gpsCoordinates[1].toFixed(4)}° W
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-emerald-400">
                            BAT {cam.batteryPct}%
                          </span>
                          <span className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-blue-400">
                            LTE FIRSTNET
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stream Tile Controls Bar */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {cam.model} <span className="text-slate-500 font-normal">({cam.officerBadge})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant={isStreaming ? 'destructive' : 'primary'}
                          size="sm"
                          className="text-xs h-7 px-2.5"
                          onClick={() => {
                            if (isStreaming) {
                              stopBWCStream(cam.id)
                            } else {
                              requestBWCStream(cam.id)
                            }
                          }}
                        >
                          {isStreaming ? 'Close Feed' : 'Start Feed'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => {
                            addToast({
                              title: `Snapshot Captured: ${cam.deviceCode}`,
                              message: `High-res forensic frame saved to DEMS staging with SHA-256 stamp`,
                              type: 'success',
                            })
                          }}
                        >
                          Snapshot
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            toggleBWCRecording(cam.id)
                          }}
                          title="Toggle Recording"
                        >
                          {cam.status === 'RECORDING' ? (
                            <Square className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Screen 3: Automated Event Triggers & Sensor Integration */}
      {activeTab === 'triggers' && (
        <div className="space-y-5">
          {/* Architecture Banner */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Axon Signal & Smart Vehicle Sensor Ecosystem
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated contextual triggers automatically force camera recording with 30-second pre-event audio/video buffer when officers draw their weapon, discharge CEWs, activate Code 3 emergency lights, or sustain vehicular collisions.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 shrink-0">
              BLUETOOTH 5.2 LE • CAN-BUS OBD-II • HIGH-G ACCEL
            </div>
          </div>

          {/* Interactive Trigger Simulation Console */}
          <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Sensor Event Simulator & Field Test Deck</h4>
                <p className="text-xs text-slate-500">Select an active field unit and simulate an automated hardware sensor trip</p>
              </div>
              <Badge variant="warning">Hardware Test Mode</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Target Camera Unit</label>
                <select
                  value={simTargetDevice}
                  onChange={(e) => setSimTargetDevice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                >
                  {bwcDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.deviceCode} — {d.assignedOfficer} ({d.agency}) [{d.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Sensor Event Type</label>
                <select
                  value={simTriggerType}
                  onChange={(e) => {
                    const val = e.target.value as BWCRecordingTrigger['triggerType']
                    setSimTriggerType(val)
                    if (val === 'HOLSTER_DRAW') setSimTriggerNotes('Smart Holster BLE magnet sensor: Sidearm unholstered')
                    else if (val === 'VEHICLE_CRASH_ACCELEROMETER') setSimTriggerNotes('Vehicle CAN-Bus accelerometer: >4.5G deceleration impact')
                    else if (val === 'LIGHTBAR_SIREN_ENGAGED') setSimTriggerNotes('Vehicle lightbar code-3 siren engaged via emergency relay')
                    else if (val === 'TASER_CEW_DISCHARGE') setSimTriggerNotes('Taser 10 Axon Signal broadcast: CEW cartridge deployed')
                    else if (val === 'GEOFENCE_BREACH') setSimTriggerNotes('Geofence boundary breach: Federal exclusion zone perimeter')
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="HOLSTER_DRAW">Holster-Draw Sensor (Smart Holster BLE)</option>
                  <option value="VEHICLE_CRASH_ACCELEROMETER">Vehicle Crash Accelerometer (&gt;4G Impact)</option>
                  <option value="LIGHTBAR_SIREN_ENGAGED">Code 3 Lightbar & Siren Relay</option>
                  <option value="TASER_CEW_DISCHARGE">Taser / CEW Discharge (Axon Signal)</option>
                  <option value="GEOFENCE_BREACH">Geofence Perimeter Breach</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Telemetry Sensor Notes</label>
                <input
                  type="text"
                  value={simTriggerNotes}
                  onChange={(e) => setSimTriggerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Quick Trigger Fire Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  triggerBWCEvent(simTargetDevice, simTriggerType, simTriggerNotes)
                }}
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Fire Selected Sensor Trigger
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  triggerBWCEvent(simTargetDevice, 'HOLSTER_DRAW', 'EMERGENCY DRAW: Holster sensor trip detected weapon deployment')
                }}
              >
                <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                Quick Holster Draw
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  triggerBWCEvent(simTargetDevice, 'VEHICLE_CRASH_ACCELEROMETER', 'CRASH SENSOR: High-G vehicular collision impact alert')
                }}
              >
                <Car className="w-3.5 h-3.5 mr-1" />
                Quick Vehicle Crash
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  triggerBWCEvent(simTargetDevice, 'LIGHTBAR_SIREN_ENGAGED', 'LIGHTBAR RELAY: Code 3 pursuit siren initiated')
                }}
              >
                <Activity className="w-3.5 h-3.5 mr-1" />
                Quick Siren Code-3
              </Button>
            </div>
          </div>

          {/* Trigger Events History Table */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Telemetry Trigger Log ({bwcTriggers.length} Events)
                </h4>
                <p className="text-xs text-slate-500">Historical ledger of sensor trips, pre-buffer commits, and automated recording activations</p>
              </div>

              <Badge variant="outline">FIPS 140-3 Logged</Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Device</th>
                    <th className="px-3 py-2">Officer</th>
                    <th className="px-3 py-2">Trigger Type</th>
                    <th className="px-3 py-2">Pre-Buffer</th>
                    <th className="px-3 py-2">CAD Incident</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {bwcTriggers.map((trig) => (
                    <tr key={trig.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                        {new Date(trig.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">{trig.deviceCode}</td>
                      <td className="px-3 py-2 text-slate-900 font-sans">{trig.officerName}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trig.triggerType === 'HOLSTER_DRAW'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : trig.triggerType === 'VEHICLE_CRASH_ACCELEROMETER'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : trig.triggerType === 'TASER_CEW_DISCHARGE'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {trig.triggerType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-emerald-400 font-bold">{trig.preEventBufferSec}s Pre-Event</td>
                      <td className="px-3 py-2 text-purple-400">{trig.cadIncidentNumber || 'N/A'}</td>
                      <td className="px-3 py-2">
                        <Badge variant="nominal">{trig.status}</Badge>
                      </td>
                      <td className="px-3 py-2 font-sans text-slate-500 max-w-xs truncate">{trig.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Docking Station, Offload & Ingestion Engine */}
      {activeTab === 'docking' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Federal Armory Smart Docking & Ingestion Hub
              </h3>
              <p className="text-xs text-slate-500">
                Multi-bay hardware docking bays with automated Gigabit offload, SHA-256 cryptographic verification, and direct ingestion into Module 06 (DEMS)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addToast({
                    title: 'Dock Health & Firmware Check',
                    message: 'All 3 armory docking hubs verified nominal at 1000 Mbps throughput',
                    type: 'success',
                  })
                }}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync Docks
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Ingest all pending clips into DEMS
                  bwcClips.forEach((c) => {
                    if (!c.ingestedToDems) {
                      offloadClipToDEMS(c.id)
                    }
                  })
                  addToast({
                    title: 'Batch Offload Triggered',
                    message: 'All staged BWC footage ingested into Digital Evidence Management System (Module 06)',
                    type: 'success',
                  })
                }}
              >
                <Database className="w-3.5 h-3.5 mr-1.5" />
                Offload All Clips to DEMS
              </Button>
            </div>
          </div>

          {/* Docking Station Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bwcDockingStations.map((dock) => {
              const occupancyPct = Math.round((dock.occupiedBays / dock.totalBays) * 100)

              return (
                <div key={dock.id} className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{dock.stationName}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Server className="w-3 h-3 text-emerald-400" />
                        {dock.facilityLocation}
                      </p>
                    </div>

                    <Badge variant={dock.offloadStatus === 'OFFLOADING_ACTIVE' ? 'nominal' : 'outline'}>
                      {dock.offloadStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Bay Occupancy */}
                  <div className="p-3 rounded-lg bg-background/60 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Dock Bays Occupied</span>
                      <span className="font-mono font-bold text-slate-900">
                        {dock.occupiedBays} / {dock.totalBays} Bays ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${occupancyPct}%` }} />
                    </div>
                  </div>

                  {/* Network & Transfer Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/40 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Uplink Speed</span>
                      <span className="text-emerald-400 font-bold">{dock.networkSpeedMbps} Mbps</span>
                    </div>

                    <div className="p-2 rounded bg-background/40 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Pending Ingestion</span>
                      <span className="text-purple-400 font-bold">{dock.pendingUploadCount} Clips</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-200">
                    <span>Sync: {new Date(dock.lastSyncTimestamp).toLocaleTimeString()}</span>
                    <span className="text-emerald-400">CJIS AES-256</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      addToast({
                        title: `Dock Diagnostic: ${dock.stationName}`,
                        message: `Tested ${dock.totalBays} bays, optical connectors clean, Gigabit link verified`,
                        type: 'info',
                      })
                    }}
                  >
                    Run Station Diagnostic
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Staged Offload & SHA-256 Integrity Verification Queue */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  Staged Evidence Queue & SHA-256 Checksum Engine
                </h4>
                <p className="text-xs text-slate-500">
                  Cryptographic hashing computed upon bay connection prior to DEMS repository ingest
                </p>
              </div>
              <Badge variant="nominal">CJIS Hash Verified</Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Clip Code</th>
                    <th className="px-3 py-2">Camera / Officer</th>
                    <th className="px-3 py-2">Size / Duration</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">SHA-256 Checksum</th>
                    <th className="px-3 py-2">DEMS Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {bwcClips.map((clip) => (
                    <tr key={clip.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-900">{clip.clipNumber}</td>
                      <td className="px-3 py-2 font-sans">
                        <div className="text-slate-900 font-medium">{clip.officerName}</div>
                        <div className="text-slate-500 text-[10px] font-mono">{clip.deviceCode}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {clip.fileSizeMb} MB • {Math.floor(clip.durationSec / 60)}m {clip.durationSec % 60}s
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {clip.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[10px] text-slate-500 max-w-[180px] truncate" title={clip.sha256Checksum}>
                        {clip.sha256Checksum}
                      </td>
                      <td className="px-3 py-2">
                        {clip.ingestedToDems ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> INGESTED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                            <Clock className="w-3.5 h-3.5" /> STAGED / PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {!clip.ingestedToDems ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => offloadClipToDEMS(clip.id)}
                          >
                            Ingest to DEMS
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-500">{clip.demsEvidenceId}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: Metadata Tagging, Classification & Field Annotations */}
      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Clips List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                Video Clips Repository ({bwcClips.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {bwcClips.map((c) => {
                const isSelected = c.id === selectedClipId

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClipId(c.id)
                      setEditCategory(c.category)
                      setEditCadIncident(c.cadIncidentNumber || '')
                      setEditNotes(c.notes || '')
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-purple-500/80 ring-1 ring-purple-500/30 shadow-md'
                        : 'bg-white border-slate-200 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-900">{c.clipNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {c.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-900 font-medium truncate">{c.officerName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1 font-mono">
                      <span>{c.deviceCode}</span>
                      <span>
                        {Math.floor(c.durationSec / 60)}m {c.durationSec % 60}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-500">{new Date(c.startTime).toLocaleDateString()}</span>
                      {c.ingestedToDems ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> DEMS Ingested
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Staged
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Clip Inspection & Tagging Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Forensic Clip Review: {selectedClip.clipNumber}</span>
                    <Badge variant={selectedClip.ingestedToDems ? 'nominal' : 'warning'}>
                      {selectedClip.ingestedToDems ? 'Ingested to DEMS' : 'Pending Ingestion'}
                    </Badge>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Device {selectedClip.deviceCode} • Recorded by {selectedClip.officerName}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToast({
                      title: 'Evidence Audit Exported',
                      message: `Cryptographic verification sheet exported for ${selectedClip.clipNumber}`,
                      type: 'info',
                    })
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Audit Sheet
                </Button>
              </div>

              {/* Simulated Video Player with Scrubber */}
              <div className="aspect-video bg-neutral-950 rounded-lg flex flex-col justify-between p-3 relative select-none">
                <div className="flex items-center justify-between text-xs text-white/90 z-10 font-mono">
                  <span>{selectedClip.clipNumber}</span>
                  <span className="text-rose-400 font-bold">EVIDENTIARY RECORDING</span>
                  <span>1080p60 FHD</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/80 ml-1" />
                  </div>
                </div>

                <div className="z-10 space-y-2">
                  <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden cursor-pointer">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/70 font-mono">
                    <span>05:52 / {Math.floor(selectedClip.durationSec / 60)}:{selectedClip.durationSec % 60}</span>
                    <span>SHA-256 VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Classification & Metadata Editor: No Dead Buttons */}
              <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Classification & Case Association
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-900 block mb-1">Incident Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as BWCClipMetadata['category'])}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="USE_OF_FORCE">Use of Force</option>
                      <option value="TRAFFIC_STOP">Traffic Stop</option>
                      <option value="FIELD_INTERVIEW">Field Interview / Terry Stop</option>
                      <option value="PURSUIT">Vehicular Pursuit</option>
                      <option value="SEARCH_WARRANT">Search Warrant Execution</option>
                      <option value="ROUTINE_PATROL">Routine Patrol / Non-Evidentiary</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-900 block mb-1">CAD Incident Tracking #</label>
                    <input
                      type="text"
                      value={editCadIncident}
                      onChange={(e) => setEditCadIncident(e.target.value)}
                      placeholder="e.g. CAD-2026-8812"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-900 block mb-1">Field Notes & Supervisor Annotations</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-slate-500">SHA-256 Checksum (FIPS 180-4)</div>
                  <div className="text-purple-400 break-all">{selectedClip.sha256Checksum}</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      updateClipMetadata(selectedClip.id, editCategory, editCadIncident, editNotes)
                    }}
                  >
                    <FileCheck2 className="w-4 h-4 mr-1.5" />
                    Save Classification & Notes
                  </Button>

                  {!selectedClip.ingestedToDems && (
                    <Button
                      variant="outline"
                      className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => {
                        offloadClipToDEMS(selectedClip.id)
                      }}
                    >
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      Offload Into DEMS Repository
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: Chain of Custody & Privacy Compliance Ledger */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                CJIS Security Policy v5.9 & Chain of Custody Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Immutable federal audit log tracking BWC access, supervisor live-streams, sensor trigger trip events, and DEMS transfers
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'CJIS Compliance Export Generated',
                  message: 'Cryptographically signed audit package ready for federal inspector general review',
                  type: 'success',
                })
              }}
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Export Audit Trail
            </Button>
          </div>

          {/* Retention Standards Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Evidentiary Video Retention</span>
                <Badge variant="critical">3 Years Hold</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Footage linked to CAD arrests, use of force, or vehicular pursuits is retained under statutory hold until case resolution.
              </p>
              <div className="text-[10px] text-rose-400 font-mono">STATUTORY MANDATE • NO DESTRUCTION</div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Non-Evidentiary Retention</span>
                <Badge variant="nominal">90-Day Auto Purge</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Routine patrol and consensual encounters are purged automatically after 90 days to protect public and officer privacy.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono">AUTOMATED ZERO-TRUST PURGE</div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Supervisor Live-View Audit</span>
                <Badge variant="info">100% Monitored</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Remote live stream activation emits an audible alert to the officer and logs the supervisor's PIV credentials in the chain of custody.
              </p>
              <div className="text-[10px] text-blue-400 font-mono">ANTI-SURVEILLANCE COMPLIANCE</div>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                VRSM & BWC Operational Audit Trail ({bwcAuditLogs.length} Events)
              </h4>
              <Badge variant="outline">FIPS 140-3 Compliant</Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Actor</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Target</th>
                    <th className="px-3 py-2">Outcome</th>
                    <th className="px-3 py-2">Purpose / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {bwcAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-sans font-medium">{log.actor}</td>
                      <td className="px-3 py-2 text-slate-500">{log.actorRole}</td>
                      <td className="px-3 py-2">
                        <span className="text-purple-400 font-bold">{log.action}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-900">{log.targetId}</td>
                      <td className="px-3 py-2">
                        <Badge variant={log.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-500 font-sans max-w-sm truncate" title={log.purpose}>
                        {log.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default VRSMBWCPage
