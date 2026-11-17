import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  MapPin,
  Layers,
  Radio,
  Crosshair,
  ShieldAlert,
  Wind,
  Navigation,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Camera,
  Eye,
  Send,
  Zap,
  Sliders,
  Maximize2,
  CheckCircle2,
  Lock,
  Flame,
  Battery,
  Gauge,
  Share2,
  Shield,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { TacticalAsset, SpatialCorrelationEvent, SlewToCueTarget, AirspaceRestriction } from '../../types/modules'

type TabType =
  | 'gis-tactical'
  | 'asset-tracking'
  | 'geofencing'
  | 'correlation-console'
  | 'slew-to-cue'
  | 'environmental-airspace'

export default function SituationalIntelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('gis-tactical')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedPin, setSelectedPin] = useState<{
    id: string
    type: 'INCIDENT' | 'ASSET' | 'CAMERA' | 'GEOFENCE' | 'AIRSPACE'
    name: string
    coordinates: [number, number]
    details: string
    status: string
  } | null>(null)

  // Modals
  const [isVectorModalOpen, setIsVectorModalOpen] = useState(false)
  const [vectorAsset, setVectorAsset] = useState<TacticalAsset | null>(null)
  const [vectorTargetCoords, setVectorTargetCoords] = useState('38.8977, -77.0365')
  const [vectorIncidentId, setVectorIncidentId] = useState('inc-8812')

  const [isNewGeofenceModalOpen, setIsNewGeofenceModalOpen] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneCode, setNewZoneCode] = useState('GEO-NCR-')
  const [newZoneRadius, setNewZoneRadius] = useState(250)
  const [newZoneAlertLevel, setNewZoneAlertLevel] = useState<'WARNING' | 'CRITICAL' | 'RESTRICTED'>('CRITICAL')

  const [isNewSlewModalOpen, setIsNewSlewModalOpen] = useState(false)
  const [newSlewName, setNewSlewName] = useState('')
  const [newSlewCoords, setNewSlewCoords] = useState('38.8977, -77.0365')
  const [newSlewCamera, setNewSlewCamera] = useState('cam-402')
  const [newSlewPan, setNewSlewPan] = useState(140)
  const [newSlewTilt, setNewSlewTilt] = useState(-15)
  const [newSlewZoom, setNewSlewZoom] = useState(4.0)

  // GIS Layer Toggles
  const [layerIncidents, setLayerIncidents] = useState(true)
  const [layerAssets, setLayerAssets] = useState(true)
  const [layerCameras, setLayerCameras] = useState(true)
  const [layerGeofences, setLayerGeofences] = useState(true)
  const [layerAirspace, setLayerAirspace] = useState(true)
  const [mapStyle, setMapStyle] = useState<'TACTICAL_DARK' | 'SATELLITE_HYBRID' | 'THERMAL_FLIR'>('TACTICAL_DARK')

  // Search & Filter States
  const [assetSearchQuery, setAssetSearchQuery] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('ALL')
  const [correlationSearchQuery, setCorrelationSearchQuery] = useState('')

  // Store bindings
  const {
    tacticalAssets,
    spatialCorrelations,
    slewTargets,
    airspaceRestrictions,
    geofences,
    incidents,
    cameras,
    executeSlewToCue,
    toggleAirspaceRestriction,
    dispatchAssetToTarget,
    dismissCorrelation,
    updateAssetStatus,
    toggleGeofence,
    addGeofence,
    addToast,
    logAuditEvent,
    activeAgencyId,
  } = useVanguardStore()

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return tacticalAssets.filter(asset => {
      const matchesSearch =
        asset.callsign.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        asset.p25Talkgroup.toLowerCase().includes(assetSearchQuery.toLowerCase())
      const matchesType = assetTypeFilter === 'ALL' || asset.assetType === assetTypeFilter
      return matchesSearch && matchesType
    })
  }, [tacticalAssets, assetSearchQuery, assetTypeFilter])

  // Filtered Correlations
  const filteredCorrelations = useMemo(() => {
    return spatialCorrelations.filter(corr =>
      corr.title.toLowerCase().includes(correlationSearchQuery.toLowerCase()) ||
      corr.summary.toLowerCase().includes(correlationSearchQuery.toLowerCase())
    )
  }, [spatialCorrelations, correlationSearchQuery])

  // Handlers
  const handleOpenVectorModal = (asset: TacticalAsset) => {
    setVectorAsset(asset)
    setIsVectorModalOpen(true)
  }

  const handleExecuteVector = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vectorAsset) return
    const parts = vectorTargetCoords.split(',').map(s => parseFloat(s.trim()))
    const lat = isNaN(parts[0]) ? 38.8977 : parts[0]
    const lng = isNaN(parts[1]) ? -77.0365 : parts[1]

    dispatchAssetToTarget(vectorAsset.id, [lat, lng], vectorIncidentId)
    setIsVectorModalOpen(false)
  }

  const handleCreateGeofence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newZoneName.trim()) return

    const newZone = {
      id: `geo-${Date.now()}`,
      name: newZoneName,
      type: 'PERIMETER_SECURITY' as const,
      center: [38.8977, -77.0365] as [number, number],
      radiusMeters: newZoneRadius,
      active: true,
      breachPolicy: 'Auto PTZ Slew & Alert Dispatch',
      authorizedAgency: 'DHS-FPS',
    }

    addGeofence(newZone)
    addToast({
      title: 'Geofence Established',
      message: `Zone ${newZone.name} [Radius: ${newZone.radiusMeters}m] active in tactical COP`,
      type: 'success',
    })
    setIsNewGeofenceModalOpen(false)
    setNewZoneName('')
  }

  const handleSimulateGeofenceBreach = (zoneName: string) => {
    logAuditEvent({
      agencyId: activeAgencyId,
      actor: 'Tactical Sentry AI',
      actorRole: 'COP_ANALYTICS_ENGINE',
      action: 'COP_GEOFENCE_BREACH_DETECTED',
      targetEntity: 'GeofenceZone',
      targetId: zoneName,
      outcome: 'FAILED',
      purpose: `Perimeter violation detected within ${zoneName}. Automated alert dispatched to Watch Desk.`,
    })
    addToast({
      title: 'CRITICAL: Geofence Breach',
      message: `Unidentified target entered ${zoneName}. Visual slew queued.`,
      type: 'error',
    })
  }

  const handleSimulateNotamBroadcast = () => {
    logAuditEvent({
      agencyId: activeAgencyId,
      actor: 'Watch Commander',
      actorRole: 'AIRSPACE_COORDINATOR',
      action: 'COP_NOTAM_EMERGENCY_BROADCAST',
      targetEntity: 'FAA_R4001',
      targetId: 'NOTAM-NCR-991',
      outcome: 'SUCCESS',
      purpose: 'Emergency tactical airspace freeze broadcast to FAA Washington Center and NCR Radar.',
    })
    addToast({
      title: 'Emergency NOTAM Broadcast',
      message: 'Airspace restriction active. C-UAS interdiction teams notified on talkgroup USSS-SOD-AIR.',
      type: 'warning',
    })
  }

  const handleAddSlewTarget = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlewName) return
    const parts = newSlewCoords.split(',').map(s => parseFloat(s.trim()))
    const lat = isNaN(parts[0]) ? 38.8977 : parts[0]
    const lng = isNaN(parts[1]) ? -77.0365 : parts[1]

    const newTarget: SlewToCueTarget = {
      id: `slew-${Date.now()}`,
      targetName: newSlewName,
      coordinates: [lat, lng],
      linkedCameraId: newSlewCamera,
      pan: newSlewPan,
      tilt: newSlewTilt,
      zoom: newSlewZoom,
      assignedUnit: 'FPS-Patrol-402',
      status: 'STANDBY',
    }

    // Add target directly to store via slew action
    useVanguardStore.setState(state => ({
      slewTargets: [newTarget, ...state.slewTargets],
    }))

    addToast({
      title: 'Slew Target Registered',
      message: `${newTarget.targetName} linked to ${newTarget.linkedCameraId}`,
      type: 'success',
    })
    setIsNewSlewModalOpen(false)
    setNewSlewName('')
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 04 // COP-INTEL
                </span>
                <span className="text-xs text-slate-400">MIL-STD-2525D / GIS</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  COP 4.2 Operational
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Situational Intelligence &amp; Common Operating Picture
              </h1>
              <p className="text-xs text-slate-400">
                Multi-layer GIS, tactical asset telemetry, automated sensor slew-to-cue, cross-domain compound correlation, and restricted airspace enforcement.
              </p>
            </div>
          </div>

          {/* Global Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSimulateNotamBroadcast()}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast NOTAM</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSimulateGeofenceBreach('White House Outer Ring')}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700 flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Breach</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewSlewModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>New Slew Cue</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gis-tactical')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gis-tactical'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Tactical GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab('asset-tracking')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'asset-tracking'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Asset Telemetry</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {tacticalAssets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('geofencing')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'geofencing'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Spatial Geofencing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700">
              {geofences.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('correlation-console')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'correlation-console'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Domain Correlations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {spatialCorrelations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('slew-to-cue')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'slew-to-cue'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Mission Slew-to-Cue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {slewTargets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('environmental-airspace')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'environmental-airspace'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Environmental &amp; Airspace</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-cyan-300 border border-blue-700/50">
              {airspaceRestrictions.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Tracked Assets</span>
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {tacticalAssets.length} <span className="text-xs font-semibold text-emerald-600 font-sans">Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% P25 Sync</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Geofences</span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {geofences.filter(g => g.active).length} <span className="text-xs font-normal text-slate-500 font-sans">/ {geofences.length}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Auto-Slew Armed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Correlations</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            {spatialCorrelations.length} <span className="text-xs font-normal text-slate-500 font-sans">Compound</span>
          </div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">2 Critical Severity</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Slew Targets</span>
            <Crosshair className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {slewTargets.filter(t => t.status === 'SLEWED').length} <span className="text-xs font-semibold text-emerald-600 font-sans">Locked</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">PTZ Auto Tracking</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Airspace TFR</span>
            <Wind className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            R-4001 <span className="text-xs font-semibold text-emerald-600 font-sans">ENFORCED</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ceiling: 18,000 ft</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CBRNE Sentry</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            NOMINAL
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rad: 12 CPM Clean</div>
        </div>
      </div>

      {/* TAB 1: TACTICAL GIS MAP VIEW */}
      {activeTab === 'gis-tactical' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-slate-950 border-slate-800 overflow-hidden relative">
              {/* GIS Map Controls Overlay Top Bar */}
              <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-300 pointer-events-auto">
                  <span className="text-[11px] text-slate-500 px-2 font-medium">Layers:</span>
                  <button
                    onClick={() => setLayerIncidents(!layerIncidents)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      layerIncidents ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Incidents ({incidents.length})
                  </button>
                  <button
                    onClick={() => setLayerAssets(!layerAssets)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      layerAssets ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Units ({tacticalAssets.length})
                  </button>
                  <button
                    onClick={() => setLayerCameras(!layerCameras)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      layerCameras ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Cameras ({cameras.length})
                  </button>
                  <button
                    onClick={() => setLayerGeofences(!layerGeofences)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      layerGeofences ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Geofences ({geofences.length})
                  </button>
                  <button
                    onClick={() => setLayerAirspace(!layerAirspace)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      layerAirspace ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Airspace
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-300 pointer-events-auto">
                  <button
                    onClick={() => setMapStyle('TACTICAL_DARK')}
                    className={`px-2 py-1 rounded text-[11px] font-medium ${
                      mapStyle === 'TACTICAL_DARK' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Vector
                  </button>
                  <button
                    onClick={() => setMapStyle('SATELLITE_HYBRID')}
                    className={`px-2 py-1 rounded text-[11px] font-medium ${
                      mapStyle === 'SATELLITE_HYBRID' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapStyle('THERMAL_FLIR')}
                    className={`px-2 py-1 rounded text-[11px] font-medium ${
                      mapStyle === 'THERMAL_FLIR' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    FLIR Thermal
                  </button>
                </div>
              </div>

              {/* Simulated Map Canvas */}
              <div
                className={`w-full h-[580px] relative transition-colors ${
                  mapStyle === 'TACTICAL_DARK'
                    ? 'bg-[#0a0f1d]'
                    : mapStyle === 'SATELLITE_HYBRID'
                    ? 'bg-[#061412]'
                    : 'bg-[#1a0505]'
                } p-6 flex items-center justify-center`}
              >
                {/* Tactical Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Radar Sweep Animation for FLIR */}
                {mapStyle === 'THERMAL_FLIR' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 to-transparent pointer-events-none" />
                )}

                {/* Center Geospatial Coordinates Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 rounded-full border border-teal-500/20 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border border-blue-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-400/60" />
                    </div>
                  </div>
                </div>

                {/* Geofence Overlay Simulation */}
                {layerGeofences && (
                  <div className="absolute top-[28%] left-[34%] w-64 h-64 rounded-full border-2 border-teal-500/40 bg-teal-500/5 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-teal-400 font-mono tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-teal-500/30">
                      GEOFENCE: WHITE HOUSE PERIMETER (250m)
                    </span>
                  </div>
                )}

                {/* Airspace Boundary Simulation */}
                {layerAirspace && (
                  <div className="absolute top-[10%] left-[20%] w-[520px] h-[460px] border border-cyan-500/30 bg-cyan-950/5 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <span className="text-[10px] text-cyan-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30 self-start">
                      PROHIBITED AIRSPACE R-4001 [SFC - 18,000 FT]
                    </span>
                    <span className="text-[9px] text-cyan-400/60 font-mono self-end">
                      C-UAS RADAR ACTIVE // 360° SENTRY
                    </span>
                  </div>
                )}

                {/* Interactive Map Pins: Incidents */}
                {layerIncidents &&
                  incidents.map((inc, idx) => (
                    <button
                      key={inc.id}
                      onClick={() =>
                        setSelectedPin({
                          id: inc.id,
                          type: 'INCIDENT',
                          name: inc.title,
                          coordinates: inc.location.coordinates,
                          details: `${inc.trackingNumber} - ${inc.location.address} (${inc.priority} / ${inc.status})`,
                          status: inc.status,
                        })
                      }
                      style={{
                        top: `${32 + (idx % 3) * 14}%`,
                        left: `${38 + (idx % 4) * 12}%`,
                      }}
                      className="absolute group z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50" />
                        <div className="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-mono rounded shadow border border-red-500/50 whitespace-nowrap">
                        {inc.trackingNumber}: {inc.title}
                      </div>
                    </button>
                  ))}

                {/* Interactive Map Pins: Tactical Units */}
                {layerAssets &&
                  tacticalAssets.map((asset, idx) => (
                    <button
                      key={asset.id}
                      onClick={() =>
                        setSelectedPin({
                          id: asset.id,
                          type: 'ASSET',
                          name: `${asset.callsign} (${asset.assetCode})`,
                          coordinates: asset.coordinates,
                          details: `Type: ${asset.assetType} | Alt: ${asset.altitudeFt}ft | Speed: ${asset.velocityMph}mph | Battery: ${asset.batteryPct}% | Talkgroup: ${asset.p25Talkgroup}`,
                          status: asset.status,
                        })
                      }
                      style={{
                        top: `${26 + (idx * 11)}%`,
                        left: `${46 + (idx % 2 === 0 ? idx * 7 : -idx * 6)}%`,
                      }}
                      className="absolute group z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="relative w-7 h-7 rounded-lg bg-blue-600 border border-blue-300 text-white flex items-center justify-center shadow">
                          <Navigation
                            className="w-4 h-4"
                            style={{ transform: `rotate(${asset.headingDeg}deg)` }}
                          />
                        </div>
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-mono rounded shadow border border-blue-500/50 whitespace-nowrap">
                        {asset.callsign} [{asset.status}]
                      </div>
                    </button>
                  ))}

                {/* Interactive Map Pins: Cameras */}
                {layerCameras &&
                  cameras.map((cam, idx) => (
                    <button
                      key={cam.id}
                      onClick={() =>
                        setSelectedPin({
                          id: cam.id,
                          type: 'CAMERA',
                          name: cam.name,
                          coordinates: [38.8975 + (idx * 0.0006), -77.0360 - (idx * 0.0007)],
                          details: `${cam.cameraCode} - PTZ Status: Pan ${cam.ptzPan || 0}° Tilt ${cam.ptzTilt || 0}° (${cam.resolution}) [${cam.location}]`,
                          status: cam.status,
                        })
                      }
                      style={{
                        top: `${42 + (idx * 9)}%`,
                        left: `${28 + (idx * 13)}%`,
                      }}
                      className="absolute group z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-600 border border-emerald-300 text-white flex items-center justify-center shadow">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-mono rounded shadow border border-emerald-500/50 whitespace-nowrap">
                        {cam.name}
                      </div>
                    </button>
                  ))}

                {/* Bottom HUD Coordinates Bar */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono text-teal-300 flex items-center gap-4 pointer-events-auto">
                    <span>MGRS: 18SUJ23458892</span>
                    <span>WGS-84: 38.8977° N, 77.0365° W</span>
                    <span>ELEV: 54 FT MSL</span>
                  </div>

                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono text-slate-600 flex items-center gap-3 pointer-events-auto">
                    <span>ZOOM: 16.4x</span>
                    <span>SCALE: 1:2,500</span>
                    <span className="text-teal-400 font-bold">HD SAT FEED SYNC</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel: Selected Pin Inspector & Active Alarms */}
          <div className="space-y-4">
            {selectedPin ? (
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-teal-400" />
                      Target Pin Inspector
                    </CardTitle>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-xs text-slate-500 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          selectedPin.type === 'INCIDENT'
                            ? 'critical'
                            : selectedPin.type === 'ASSET'
                            ? 'info'
                            : 'nominal'
                        }
                      >
                        {selectedPin.type}
                      </Badge>
                      <span className="text-xs font-mono text-slate-500">{selectedPin.id}</span>
                    </div>
                    <div className="text-base font-bold text-white">{selectedPin.name}</div>
                    <div className="text-xs text-teal-400 font-mono mt-0.5">
                      {selectedPin.coordinates[0].toFixed(5)}° N, {selectedPin.coordinates[1].toFixed(5)}° W
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
                    {selectedPin.details}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => {
                        const target = slewTargets[0]
                        if (target) executeSlewToCue(target.id)
                      }}
                    >
                      <Crosshair className="w-3.5 h-3.5 mr-1.5" />
                      Slew Nearest PTZ Camera
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        const asset = tacticalAssets[0]
                        if (asset) {
                          setVectorAsset(asset)
                          setVectorTargetCoords(`${selectedPin.coordinates[0]}, ${selectedPin.coordinates[1]}`)
                          setIsVectorModalOpen(true)
                        }
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Vector Intercept Unit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Interactive GIS Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs text-slate-600">
                  <p>
                    Click any marker on the map to inspect its real-time telemetry, associated CAD incidents, and initiate tactical sensor slewing.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span>Red: Active Priority 1 CAD Incidents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-lg bg-blue-600" />
                      <span>Blue: P25 Connected Tactical Responders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-600" />
                      <span>Green: PTZ High-Resolution Surveillance Cameras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-teal-400" />
                      <span>Teal: Perimeter Defense Geofence Ring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Tactical Event Stream */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Live COP Telemetry Stream</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2.5 max-h-[260px] overflow-y-auto">
                {spatialCorrelations.map(corr => (
                  <div
                    key={corr.id}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant={corr.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                        {corr.severity}
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(corr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white line-clamp-1">{corr.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{corr.summary}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ASSET TELEMETRY & TRACKING */}
      {activeTab === 'asset-tracking' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={e => setAssetSearchQuery(e.target.value)}
                    placeholder="Search by callsign, asset code, or talkgroup..."
                    className="w-full bg-slate-900 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Type:</span>
                  <select
                    value={assetTypeFilter}
                    onChange={e => setAssetTypeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Types</option>
                    <option value="FOOT_PATROL">Foot Patrol</option>
                    <option value="VEHICLE">Vehicles</option>
                    <option value="K9_UNIT">K9 Units</option>
                    <option value="UAS_DRONE">UAS Drones</option>
                    <option value="MOBILE_COMMAND">Mobile Command</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAssetSearchQuery('')
                    setAssetTypeFilter('ALL')
                  }}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Asset Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => (
              <Card
                key={asset.id}
                className="bg-white border-slate-200 hover:border-slate-300 transition-colors"
              >
                <CardHeader className="pb-3 border-b border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Navigation
                          className="w-4 h-4"
                          style={{ transform: `rotate(${asset.headingDeg}deg)` }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{asset.callsign}</div>
                        <div className="text-[11px] font-mono text-slate-500">{asset.assetCode}</div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        asset.status === 'ON_SCENE'
                          ? 'critical'
                          : asset.status === 'DISPATCHED'
                          ? 'warning'
                          : asset.status === 'ON_PATROL'
                          ? 'nominal'
                          : 'neutral'
                      }
                    >
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Telemetry</span>
                      <span className="font-mono text-white">
                        {asset.velocityMph} mph / {asset.altitudeFt} ft
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Battery &amp; Heading</span>
                      <div className="flex items-center gap-2 font-mono text-white">
                        <span className={asset.batteryPct < 25 ? 'text-red-400' : 'text-emerald-400'}>
                          {asset.batteryPct}%
                        </span>
                        <span className="text-slate-500">|</span>
                        <span>{asset.headingDeg}°</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Talkgroup</span>
                      <span className="font-mono text-teal-300">{asset.p25Talkgroup}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Assigned CAD</span>
                      <span className="font-mono text-blue-400">
                        {asset.assignedIncidentId ? asset.assignedIncidentId : 'UNASSIGNED'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center justify-between">
                    <span>GPS: {asset.coordinates[0].toFixed(4)}, {asset.coordinates[1].toFixed(4)}</span>
                    <span className="text-teal-400">P25 ENCRYPTED</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1 text-xs"
                      onClick={() => handleOpenVectorModal(asset)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Vector Asset
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        const nextStatus: Record<TacticalAsset['status'], TacticalAsset['status']> = {
                          ON_PATROL: 'DISPATCHED',
                          DISPATCHED: 'ON_SCENE',
                          ON_SCENE: 'ON_PATROL',
                          OFFLINE: 'ON_PATROL',
                        }
                        updateAssetStatus(asset.id, nextStatus[asset.status])
                      }}
                    >
                      Cycle Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SPATIAL GEOFENCING & PROXIMITY ALARMS */}
      {activeTab === 'geofencing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Tactical Geofence Perimeter Registry</h2>
              <p className="text-xs text-slate-500">
                Automated perimeter defense rings, intrusion tripping policies, and auto-slew triggers.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewGeofenceModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Establish Geofence
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geofences.map(zone => (
              <Card key={zone.id} className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{zone.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{zone.id}</div>
                      </div>
                    </div>
                    <Badge variant={zone.type === 'RESTRICTED_AIRSPACE' ? 'critical' : 'nominal'}>
                      {zone.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Coverage Radius:</span>
                      <span className="font-mono text-white">{zone.radiusMeters} meters</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Origin Coordinates:</span>
                      <span className="font-mono text-teal-300">
                        {zone.center[0].toFixed(4)}, {zone.center[1].toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Enforcement State:</span>
                      <span className={`font-mono ${zone.active ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {zone.active ? 'ARMED & ACTIVE' : 'DISARMED'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Auto-Action Policy:</span>
                      <span className="text-blue-300 font-mono">{zone.breachPolicy}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={zone.active ? 'outline' : 'primary'}
                      className="flex-1 text-xs"
                      onClick={() => toggleGeofence(zone.id)}
                    >
                      {zone.active ? 'Disarm Zone' : 'Arm Geofence'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-300 border-red-500/40 hover:bg-red-950/30"
                      onClick={() => handleSimulateGeofenceBreach(zone.name)}
                    >
                      Simulate Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-DOMAIN CORRELATION CONSOLE */}
      {activeTab === 'correlation-console' && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={correlationSearchQuery}
                  onChange={e => setCorrelationSearchQuery(e.target.value)}
                  placeholder="Filter correlated multi-domain alerts..."
                  className="w-full bg-slate-900 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Domain Fusion:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono text-[10px]">
                  NG911 + VMS + PACS + RADAR + CYBER
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredCorrelations.map(corr => (
              <Card key={corr.id} className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={corr.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                          {corr.severity}
                        </Badge>
                        <span className="text-xs font-mono text-slate-500">{corr.id}</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(corr.timestamp).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                          {corr.correlatedDomains.map(d => (
                            <span
                              key={d}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-teal-700 font-mono border border-slate-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white">{corr.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{corr.summary}</p>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-blue-300">
                          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            <strong>AI Suggested Action:</strong> {corr.suggestedAction}
                          </span>
                        </div>
                        <span className="font-mono text-emerald-400 text-xs font-bold whitespace-nowrap pl-4">
                          {corr.confidenceScore}% Confidence
                        </span>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center gap-2 self-end lg:self-center">
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs whitespace-nowrap"
                        onClick={() => {
                          const target = slewTargets[0]
                          if (target) executeSlewToCue(target.id)
                        }}
                      >
                        <Crosshair className="w-3.5 h-3.5 mr-1" />
                        Execute Slew &amp; Vector
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                        onClick={() => dismissCorrelation(corr.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Acknowledge &amp; Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MISSION SLEW-TO-CUE ENGINE */}
      {activeTab === 'slew-to-cue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Automated Sensor Slew-to-Cue Directory</h2>
              <p className="text-xs text-slate-500">
                Coordinated sensor orientation commanding pan-tilt-zoom cameras and tactical assets onto threat targets.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewSlewModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Register Slew Target
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slewTargets.map(target => (
              <Card key={target.id} className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Crosshair className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{target.targetName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{target.id}</div>
                      </div>
                    </div>
                    <Badge variant={target.status === 'SLEWED' ? 'nominal' : 'warning'}>
                      {target.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Linked Camera:</span>
                      <span className="font-mono text-teal-300">{target.linkedCameraId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">PTZ Orientation:</span>
                      <span className="font-mono text-white">
                        Pan: {target.pan}° | Tilt: {target.tilt}° | Zoom: {target.zoom}x
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Assigned Unit:</span>
                      <span className="font-mono text-blue-300">{target.assignedUnit}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Target Coordinates:</span>
                      <span className="font-mono text-slate-600">
                        {target.coordinates[0].toFixed(4)}, {target.coordinates[1].toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => executeSlewToCue(target.id)}
                    >
                      <Crosshair className="w-3.5 h-3.5 mr-1.5" />
                      Command Slew-to-Cue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ENVIRONMENTAL & AIRSPACE OVERLAYS */}
      {activeTab === 'environmental-airspace' && (
        <div className="space-y-6">
          {/* Airspace Restrictions Cards */}
          <div>
            <h2 className="text-base font-bold text-white mb-1">Restricted Airspace &amp; Temporary Flight Restrictions (TFR)</h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time FAA/DoD airspace enforcement with Counter-UAS (C-UAS) directional mitigation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {airspaceRestrictions.map(air => (
                <Card key={air.id} className="bg-white border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{air.designation}</div>
                          <div className="text-[11px] font-mono text-slate-500">{air.type}</div>
                        </div>
                      </div>
                      <Badge variant={air.active ? 'critical' : 'neutral'}>
                        {air.active ? 'ACTIVE ENFORCEMENT' : 'INACTIVE'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Floor Altitude</span>
                        <span className="font-mono text-white">{air.floorAltFt} ft AGL</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Ceiling Altitude</span>
                        <span className="font-mono text-white">{air.ceilingAltFt.toLocaleString()} ft MSL</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block mb-0.5">CBRNE Sentinel</span>
                        <span className="font-mono text-emerald-400">{air.cbrneSensorStatus}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Radar Sweep</span>
                        <span className="font-mono text-teal-300">360° AESA Active</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={air.active ? 'outline' : 'primary'}
                        className="flex-1 text-xs"
                        onClick={() => toggleAirspaceRestriction(air.id)}
                      >
                        {air.active ? 'Suspend Airspace Restriction' : 'Enforce Airspace Freeze'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/30"
                        onClick={() => handleSimulateNotamBroadcast()}
                      >
                        Push NOTAM
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CBRNE & Environmental Telemetry Array */}
          <div>
            <h2 className="text-base font-bold text-white mb-1">CBRNE Environmental &amp; Atmospheric Sensor Array</h2>
            <p className="text-xs text-slate-500 mb-4">
              Continuous monitoring of hazardous radiological, chemical, and biological signatures across federal jurisdiction.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Gamma Radiation</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">12 CPM</div>
                  <div className="text-[11px] text-slate-500">Baseline Background: Normal</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Chlorine / Toxic Gas</span>
                    <Flame className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-blue-300">0.00 ppm</div>
                  <div className="text-[11px] text-slate-500">Electrochemical: Zero Trace</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Volatile Organics (VOC)</span>
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-teal-300">0.04 ppm</div>
                  <div className="text-[11px] text-slate-500">PID Photoionization: Safe</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Wind &amp; Plume Dispersion</span>
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">8 kts @ 210°</div>
                  <div className="text-[11px] text-slate-500">Plume Vector: NNE Dispersion</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Vector Asset to Coordinates */}
      <Modal
        isOpen={isVectorModalOpen}
        onClose={() => setIsVectorModalOpen(false)}
        title={`Vector Tactical Asset: ${vectorAsset?.callsign || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteVector} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            Dispatching <strong className="text-white">{vectorAsset?.callsign}</strong> ({vectorAsset?.assetCode}) to target coordinates. The responder's P25 Smart Radio navigation will automatically re-route.
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Target Coordinates (Lat, Long)
            </label>
            <Input
              type="text"
              value={vectorTargetCoords}
              onChange={e => setVectorTargetCoords(e.target.value)}
              placeholder="38.8977, -77.0365"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Assign to Incident (CAD ID)
            </label>
            <Select
              value={vectorIncidentId}
              onChange={e => setVectorIncidentId(e.target.value)}
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.trackingNumber} - {inc.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVectorModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Transmit Vector Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Establish Geofence */}
      <Modal
        isOpen={isNewGeofenceModalOpen}
        onClose={() => setIsNewGeofenceModalOpen(false)}
        title="Establish Tactical Geofence Zone"
        maxWidth="md"
      >
        <form onSubmit={handleCreateGeofence} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Zone Code</label>
            <Input
              type="text"
              value={newZoneCode}
              onChange={e => setNewZoneCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Zone Name</label>
            <Input
              type="text"
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              placeholder="e.g. North Gate Standby Perimeter"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Perimeter Radius (Meters)
            </label>
            <Input
              type="number"
              value={newZoneRadius}
              onChange={e => setNewZoneRadius(parseInt(e.target.value) || 100)}
              min={50}
              max={2500}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Alarm Level</label>
            <Select
              value={newZoneAlertLevel}
              onChange={e => setNewZoneAlertLevel(e.target.value as any)}
            >
              <option value="WARNING">WARNING (Monitor &amp; Log)</option>
              <option value="CRITICAL">CRITICAL (PTZ Auto-Slew + Klaxon)</option>
              <option value="RESTRICTED">RESTRICTED (Immediate Intercept Vector)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewGeofenceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Establish Perimeter
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Register Slew Target */}
      <Modal
        isOpen={isNewSlewModalOpen}
        onClose={() => setIsNewSlewModalOpen(false)}
        title="Register Slew-to-Cue Target"
        maxWidth="md"
      >
        <form onSubmit={handleAddSlewTarget} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Target Name</label>
            <Input
              type="text"
              value={newSlewName}
              onChange={e => setNewSlewName(e.target.value)}
              placeholder="e.g. North Gate Vehicle Egress"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Target Coordinates (Lat, Long)
            </label>
            <Input
              type="text"
              value={newSlewCoords}
              onChange={e => setNewSlewCoords(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Bind PTZ Surveillance Camera
            </label>
            <Select
              value={newSlewCamera}
              onChange={e => setNewSlewCamera(e.target.value)}
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {c.cameraCode} - {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Pan (°)</label>
              <Input
                type="number"
                value={newSlewPan}
                onChange={e => setNewSlewPan(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Tilt (°)</label>
              <Input
                type="number"
                value={newSlewTilt}
                onChange={e => setNewSlewTilt(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Zoom (x)</label>
              <Input
                type="number"
                step="0.5"
                value={newSlewZoom}
                onChange={e => setNewSlewZoom(parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewSlewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Crosshair className="w-3.5 h-3.5 mr-1.5" />
              Arm Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
