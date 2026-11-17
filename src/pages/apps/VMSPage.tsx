import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Video,
  Camera,
  Play,
  Pause,
  RotateCw,
  Maximize2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Server,
  Eye,
  EyeOff,
  Sliders,
  Download,
  Filter,
  Search,
  Lock,
  Layers,
  Activity,
  HardDrive,
  Cpu,
  Bookmark,
  Calendar,
  Clock,
  Compass,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Plus,
  RefreshCw,
  FileText,
  UserCheck,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { CameraDevice, VideoAnalyticsDetection, PrivacyMaskRule, VideoExportJob, VMSHealthMetric } from '../../types/modules'
import {
  SEED_CAMERAS,
  SEED_VIDEO_ANALYTICS,
  SEED_PRIVACY_MASKS,
  SEED_VIDEO_EXPORTS,
  SEED_VMS_HEALTH,
} from '../../store/seedData'

export const VMSPage: React.FC = () => {
  const store = useVanguardStore()
  const {
    activeAgencyId,
    agencies,
    ptzSlewCamera,
    toggleCameraAnalytics,
    updateAnalyticsDisposition,
    togglePrivacyMask,
    requestVideoExport,
    simulateVMSFailover,
    addToast,
  } = store

  const cameras: CameraDevice[] = store.cameras?.length ? store.cameras : SEED_CAMERAS
  const videoAnalytics: VideoAnalyticsDetection[] = store.videoAnalytics?.length ? store.videoAnalytics : SEED_VIDEO_ANALYTICS
  const privacyMasks: PrivacyMaskRule[] = store.privacyMasks?.length ? store.privacyMasks : SEED_PRIVACY_MASKS
  const videoExports: VideoExportJob[] = store.videoExports?.length ? store.videoExports : SEED_VIDEO_EXPORTS
  const vmsHealth: VMSHealthMetric[] = store.vmsHealth?.length ? store.vmsHealth : SEED_VMS_HEALTH

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]

  // Active Screen Tab (6 Screens)
  const [activeTab, setActiveTab] = useState<'wall' | 'registry' | 'timeline' | 'analytics' | 'privacy' | 'health'>('wall')

  // Screen 1: Wall Layout state
  const [wallLayout, setWallLayout] = useState<'2x2' | '1x1' | '3x3'>('2x2')
  const [focusedCameraId, setFocusedCameraId] = useState<string>(cameras[0]?.id || 'cam-402')
  const focusedCamera = cameras.find((c) => c.id === focusedCameraId) || cameras[0]

  // PTZ Control Pad State
  const [panValue, setPanValue] = useState<number>(focusedCamera?.ptzPan || 142)
  const [tiltValue, setTiltValue] = useState<number>(focusedCamera?.ptzTilt || -18)
  const [zoomValue, setZoomValue] = useState<number>(focusedCamera?.ptzZoom || 3.5)

  // Screen 3: Playback Timeline state
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(65) // percentage along timeline
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)

  // Screen 4: Analytics Queue Filter
  const [analyticsFilter, setAnalyticsFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'ESCALATED'>('ALL')

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportCameraId, setExportCameraId] = useState<string>(cameras[0]?.id || '')
  const [exportTimeRange, setExportTimeRange] = useState('2026-11-16 19:15:00 - 19:35:00 UTC')
  const [exportPurpose, setExportPurpose] = useState('Evidence package for Door 4B breach prosecution')

  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [newCamName, setNewCamName] = useState('Sector 2 Exterior Perimeter Optical PTZ')
  const [newCamCode, setNewCamCode] = useState('CAM-409-OPT')
  const [newCamLocation, setNewCamLocation] = useState('Building B, South Perimeter Gate')
  const [newCamResolution, setNewCamResolution] = useState('3840x2160 4K 60fps')

  const handleApplyPTZ = (newPan: number, newTilt: number, newZoom: number) => {
    setPanValue(newPan)
    setTiltValue(newTilt)
    setZoomValue(newZoom)
    if (focusedCamera) {
      ptzSlewCamera(focusedCamera.id, newPan, newTilt, newZoom)
    }
  }

  const handleSelectPreset = (presetName: string, pan: number, tilt: number, zoom: number) => {
    handleApplyPTZ(pan, tilt, zoom)
    addToast({
      title: 'PTZ Preset Recalled',
      message: `Recalled Preset: ${presetName}`,
      type: 'info',
    })
  }

  const handleExecuteExport = () => {
    requestVideoExport([exportCameraId], exportTimeRange, exportPurpose)
    setExportModalOpen(false)
  }

  const handleRegisterDevice = () => {
    addToast({
      title: 'Camera Device Registered',
      message: `Successfully provisioned ${newCamCode} under FIPS 140-3 TLS profile`,
      type: 'success',
    })
    setRegisterModalOpen(false)
  }

  const filteredAnalytics = videoAnalytics.filter((det) => {
    if (analyticsFilter === 'ALL') return true
    return det.disposition === analyticsFilter
  })

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 02 // VMS Core
                </span>
                <span className="text-xs text-slate-400">ONVIF Profile S/G/T</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SRTP Video Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Video Intelligence / VMS
              </h1>
              <p className="text-xs text-slate-400">
                Register, view, slew, and analyze authorized fixed, mobile, body-worn and thermal video feeds with AI vision triage.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Evidence Clip</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRegisterModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Camera</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wall')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wall'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Video Operations Wall</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'registry'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Device Registry ({cameras.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Playback Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analytics Queue</span>
            {videoAnalytics.filter((d) => d.disposition === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {videoAnalytics.filter((d) => d.disposition === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Privacy Console</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'health'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Service Health</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SCREEN 1: VIDEO OPERATIONS WALL */}
      {/* ========================================================= */}
      {activeTab === 'wall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera Tree Directory & PTZ Slew Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Camera Directory Tree */}
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Sensor Feeds Directory
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setWallLayout('1x1')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      wallLayout === '1x1' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    1x1
                  </button>
                  <button
                    onClick={() => setWallLayout('2x2')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      wallLayout === '2x2' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    2x2
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                {cameras.map((cam) => {
                  const isFocused = cam.id === focusedCamera?.id
                  return (
                    <div
                      key={cam.id}
                      onClick={() => setFocusedCameraId(cam.id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isFocused
                          ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{cam.cameraCode}</span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cam.fps} FPS
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{cam.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{cam.location}</div>
                      {cam.lastDetection && (
                        <div className="text-[10px] text-blue-700 mt-1 font-mono truncate bg-blue-50 px-1 py-0.5 rounded">
                          AI: {cam.lastDetection}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Tactical PTZ Slew Controller */}
            {focusedCamera && (
              <Card>
                <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      PTZ Telemetry: {focusedCamera.cameraCode}
                    </CardTitle>
                  </div>
                  {focusedCamera.ptzCapable ? (
                    <Badge variant="nominal" className="text-[10px]">PTZ Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Fixed Mount</Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Compass D-Pad */}
                  <div className="flex flex-col items-center">
                    <div className="grid grid-cols-3 gap-1.5 w-36">
                      <div />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!focusedCamera.ptzCapable}
                        onClick={() => handleApplyPTZ(panValue, tiltValue + 5, zoomValue)}
                        className="p-2 h-auto text-xs"
                      >
                        ▲
                      </Button>
                      <div />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!focusedCamera.ptzCapable}
                        onClick={() => handleApplyPTZ(panValue - 10, tiltValue, zoomValue)}
                        className="p-2 h-auto text-xs"
                      >
                        ◀
                      </Button>
                      <div className="flex items-center justify-center font-mono text-[10px] font-bold text-slate-700 bg-slate-100 rounded">
                        HUD
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!focusedCamera.ptzCapable}
                        onClick={() => handleApplyPTZ(panValue + 10, tiltValue, zoomValue)}
                        className="p-2 h-auto text-xs"
                      >
                        ▶
                      </Button>
                      <div />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!focusedCamera.ptzCapable}
                        onClick={() => handleApplyPTZ(panValue, tiltValue - 5, zoomValue)}
                        className="p-2 h-auto text-xs"
                      >
                        ▼
                      </Button>
                      <div />
                    </div>
                  </div>

                  {/* Telemetry Sliders */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span>Pan Azimuth</span>
                        <span className="font-bold">{panValue}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        disabled={!focusedCamera.ptzCapable}
                        value={panValue}
                        onChange={(e) => handleApplyPTZ(Number(e.target.value), tiltValue, zoomValue)}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span>Tilt Elevation</span>
                        <span className="font-bold">{tiltValue}°</span>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        disabled={!focusedCamera.ptzCapable}
                        value={tiltValue}
                        onChange={(e) => handleApplyPTZ(panValue, Number(e.target.value), zoomValue)}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span>Optical Zoom</span>
                        <span className="font-bold">{zoomValue.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="20.0"
                        step="0.5"
                        disabled={!focusedCamera.ptzCapable}
                        value={zoomValue}
                        onChange={(e) => handleApplyPTZ(panValue, tiltValue, Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Target Presets */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Slew Target Presets
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectPreset('Door 4B Vault Corridor', 142, -18, 3.5)}
                        className="text-[10px] py-1 px-1.5 truncate h-auto"
                      >
                        Door 4B Vault
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectPreset('Loading Dock Egress', 92, -5, 1.0)}
                        className="text-[10px] py-1 px-1.5 truncate h-auto"
                      >
                        Loading Dock
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectPreset('Rooftop Mast Alpha', 284, 12, 8.0)}
                        className="text-[10px] py-1 px-1.5 truncate h-auto"
                      >
                        Rooftop Mast
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectPreset('Perimeter Gate 2', 45, -10, 4.0)}
                        className="text-[10px] py-1 px-1.5 truncate h-auto"
                      >
                        Perimeter Gate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Live Operations Video Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div
              className={`grid gap-3.5 ${
                wallLayout === '1x1' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {(wallLayout === '1x1' ? [focusedCamera] : cameras.slice(0, 4)).map((cam) => {
                const isSelected = cam.id === focusedCamera?.id
                return (
                  <div
                    key={cam.id}
                    onClick={() => setFocusedCameraId(cam.id)}
                    className={`relative rounded-lg overflow-hidden bg-slate-950 border transition-all cursor-pointer ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-800'
                    }`}
                  >
                    {/* Simulated Camera Video Stream Feed */}
                    <div className="aspect-video w-full relative flex items-center justify-center bg-radial from-slate-900 to-slate-950">
                      {/* Crosshairs & Grid OSD HUD */}
                      <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                        {/* Top OSD Bar */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded backdrop-blur-xs">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="font-bold text-white">{cam.cameraCode}</span>
                            <span className="text-slate-400">• {cam.streamCodec || 'H.265'}</span>
                          </div>
                          <span>{cam.fps} FPS // {cam.resolution}</span>
                        </div>

                        {/* Center Reticle */}
                        <div className="self-center flex items-center justify-center">
                          <div className="w-12 h-12 border border-emerald-500/30 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-400/60 rounded-full" />
                          </div>
                        </div>

                        {/* Bottom OSD Bar */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-1 rounded backdrop-blur-xs">
                          <span className="truncate">{cam.location}</span>
                          <span className="text-emerald-400 font-semibold">{cam.fipsCertificate || 'FIPS 140-3 Valid'}</span>
                        </div>
                      </div>

                      {/* AI Bounding Box Simulation if detection exists */}
                      {cam.aiAnalyticsActive && cam.lastDetection && (
                        <div className="absolute bottom-12 left-6 border-2 border-amber-400 bg-amber-400/10 px-2 py-1 rounded text-[10px] font-mono text-amber-300 pointer-events-none">
                          <div className="font-bold">{cam.lastDetection}</div>
                        </div>
                      )}
                    </div>

                    {/* Footer Tile Controls */}
                    <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate">
                        <span className="font-semibold text-slate-200">{cam.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCameraAnalytics(cam.id)
                          }}
                          className={`text-[10px] py-0.5 px-2 h-auto ${
                            cam.aiAnalyticsActive ? 'text-emerald-400 border-emerald-800' : 'text-slate-400'
                          }`}
                        >
                          {cam.aiAnalyticsActive ? 'AI On' : 'AI Off'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExportCameraId(cam.id)
                            setExportModalOpen(true)
                          }}
                          className="text-[10px] py-0.5 px-2 h-auto"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: DEVICE REGISTRY */}
      {/* ========================================================= */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Fixed, Mobile & Aerial Camera Sensor Registry
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  FIPS 140-3 validated device provisioning, RTSP/SRTP stream profiles, and local storage retention schedules.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRegisterModalOpen(true)}
                className="text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Device</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Device Code / Name</th>
                    <th className="py-3 px-4">Physical Location</th>
                    <th className="py-3 px-4">IP / Firmware</th>
                    <th className="py-3 px-4">Stream Profile</th>
                    <th className="py-3 px-4">FIPS Certificate</th>
                    <th className="py-3 px-4">Retention</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cameras.map((cam) => (
                    <tr key={cam.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{cam.cameraCode}</div>
                        <div className="text-xs text-slate-600 font-semibold">{cam.name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{cam.location}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-slate-900">{cam.ipAddress || '10.142.12.42'}</div>
                        <div className="text-slate-500">{cam.firmwareVersion || 'v4.18.2-FIPS'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <span className="font-mono font-semibold text-slate-800">{cam.streamCodec || 'H.265'}</span>
                        <div className="text-slate-500">{cam.resolution} @ {cam.fps}fps</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cam.fipsCertificate || 'Valid FIPS 140-3'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {cam.retentionDays || 90} Days ({cam.storageUsedGb || 320} GB)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cam.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toggleCameraAnalytics(cam.id)}
                            className="text-[10px] py-1 px-2 h-auto"
                          >
                            {cam.aiAnalyticsActive ? 'Disable AI' : 'Enable AI'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setExportCameraId(cam.id)
                              setExportModalOpen(true)
                            }}
                            className="text-[10px] py-1 px-2 h-auto"
                          >
                            Export
                          </Button>
                        </div>
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
      {/* SCREEN 3: PLAYBACK TIMELINE */}
      {/* ========================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Synchronized Multi-Sensor Timeline Player
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frame-accurate synchronized playback across fixed optical, thermal, and body-worn recordings.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setExportModalOpen(true)}
                  className="text-xs flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Marked Range</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Dual Synchronized Playback Viewports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded">
                    CAM-402 // Sector 4 Vault Corridor
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    [Playback Stream Sync: 2026-11-16 19:18:24 UTC]
                  </div>
                </div>

                <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded">
                    CAM-THM-01 // Rooftop Perimeter Thermal
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    [Playback Stream Sync: 2026-11-16 19:18:24 UTC]
                  </div>
                </div>
              </div>

              {/* Timeline Scrubber Bar with Event Markers */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span>18:30:00 UTC</span>
                  <span className="font-bold text-white text-sm">19:18:24 UTC (Marker 2 // Intrusion Alarm)</span>
                  <span>19:45:00 UTC</span>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={timelinePosition}
                    onChange={(e) => setTimelinePosition(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  {/* Event Markers on Timeline */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="text-blue-400">18:45 Checkpoint Shift</span>
                    <span className="text-amber-400 font-bold">19:14 Drone Sighting</span>
                    <span className="text-red-400 font-bold">19:18 Door 4B Forced</span>
                    <span className="text-emerald-400">19:32 Tactical Response</span>
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPlayingTimeline ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      <span>{isPlayingTimeline ? 'Pause' : 'Play Synced'}</span>
                    </Button>
                    <Select
                      value={playbackSpeed.toString()}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlaybackSpeed(Number(e.target.value))}
                      options={[
                        { value: '0.5', label: '0.5x Speed' },
                        { value: '1', label: '1.0x Normal' },
                        { value: '2', label: '2.0x Fast' },
                        { value: '4', label: '4.0x Rapid' },
                      ]}
                      className="text-xs w-28"
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Buffered: 100% // FIPS 140-3 SRTP Session Replay
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4: ANALYTICS QUEUE */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Triage Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Triage State:</span>
              {(['ALL', 'PENDING', 'CONFIRMED', 'ESCALATED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAnalyticsFilter(filter)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    analyticsFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Model: EdgeVision-YOLOv9-Federal (99.2% Accuracy)
            </span>
          </div>

          {/* Analytics Detection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnalytics.map((det) => (
              <Card key={det.id} className="border-t-4 border-t-blue-600">
                <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{det.detectionCode}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          det.disposition === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : det.disposition === 'ESCALATED'
                            ? 'bg-red-100 text-red-800'
                            : det.disposition === 'DISMISSED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {det.disposition}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{det.cameraName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-blue-700">{det.confidence}%</span>
                    <div className="text-[10px] text-slate-400">Confidence</div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="p-3 bg-slate-900 text-slate-200 rounded font-mono text-xs border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">Target Classification:</div>
                    <div>{det.boundingBoxLabel}</div>
                    <div className="text-slate-400 text-[10px] mt-1">Model Version: {det.modelVersion}</div>
                  </div>

                  {det.dispositionNotes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      <strong>Triage Notes:</strong> {det.dispositionNotes}
                    </div>
                  )}

                  {det.correlatedIncidentId && (
                    <div className="text-xs font-medium text-blue-600 flex items-center">
                      <Link to="/command/incidents" className="hover:underline">
                        Correlated to Incident: {det.correlatedIncidentId}
                      </Link>
                    </div>
                  )}

                  {/* Disposition Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateAnalyticsDisposition(det.id, 'DISMISSED', 'False positive or authorized movement')}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateAnalyticsDisposition(det.id, 'CONFIRMED', 'Operator verified subject intrusion')}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateAnalyticsDisposition(det.id, 'ESCALATED', 'Escalated to Watch Commander & Dispatched')}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white"
                    >
                      Escalate to Incident
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 5: PRIVACY CONSOLE */}
      {/* ========================================================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Federal Privacy Masking & Redaction Rules
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated geometric and dynamic AI blurring of public sidewalks, keypads, and civilian faces pursuant to Federal Privacy Act.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">Privacy Act of 1974 Enforced</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Masking Rule Name</th>
                    <th className="py-3 px-4">Target Sensor</th>
                    <th className="py-3 px-4">Masking Method</th>
                    <th className="py-3 px-4">Zone Coordinates</th>
                    <th className="py-3 px-4">Approving Authority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Policy Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {privacyMasks.map((mask) => (
                    <tr key={mask.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{mask.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{mask.cameraName}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700">{mask.maskType}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{mask.zoneCoordinates}</td>
                      <td className="py-3.5 px-4 text-slate-700">{mask.approvedBy}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            mask.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {mask.active ? 'MASK ENFORCED' : 'BYPASS PERMITTED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => togglePrivacyMask(mask.id)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          {mask.active ? 'Temporarily Bypass' : 'Enforce Mask'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cryptographic Export History */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Cryptographic Evidence Video Exports (WORM Archive)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Export Code</th>
                    <th className="py-3 px-4">Target Sensors</th>
                    <th className="py-3 px-4">Time Window</th>
                    <th className="py-3 px-4">Requested By</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                    <th className="py-3 px-4">Legal Hold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {videoExports.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{exp.exportCode}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">{exp.cameraIds.join(', ')}</td>
                      <td className="py-3.5 px-4 text-slate-600">{exp.timeRange}</td>
                      <td className="py-3.5 px-4 text-slate-800">{exp.requestedBy}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 break-all max-w-[200px]">
                        {exp.sha256Hash}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center w-fit">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Legal Hold Active
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
      {/* SCREEN 6: VMS SERVICE HEALTH */}
      {/* ========================================================= */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  VMS Cluster Nodes & Edge Appliance Telemetry
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stream latency, frame drop diagnostics, volume capacity, and edge recording failover diverters.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">Zero Frame Loss SLA</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Cluster Node</th>
                    <th className="py-3 px-4">Jurisdiction / Region</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Frame Drops</th>
                    <th className="py-3 px-4">Storage Volume</th>
                    <th className="py-3 px-4">Active RTP Streams</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Failover Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vmsHealth.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{node.nodeName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{node.region}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{node.latencyMs}ms</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{node.frameDropPct}%</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        {node.storageUsedTb} TB / {node.storageTotalTb} TB
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">{node.activeRtpStreams} Streams</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            node.status === 'NOMINAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {node.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => simulateVMSFailover(node.id)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          Trigger Failover Test
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
      {/* MODAL: REQUEST VIDEO EVIDENCE EXPORT */}
      {/* ========================================================= */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Generate Tamper-Evident Video Evidence Export"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Generate an authenticated, SHA-256 hashed video export package with legal hold tagging for prosecution and judicial discovery.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Camera Sensor</label>
            <Select
              value={exportCameraId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExportCameraId(e.target.value)}
              options={cameras.map((c) => ({
                value: c.id,
                label: `[${c.cameraCode}] ${c.name}`,
              }))}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time Range (UTC)</label>
            <Input
              value={exportTimeRange}
              onChange={(e) => setExportTimeRange(e.target.value)}
              placeholder="2026-11-16 19:15:00 - 19:35:00 UTC"
              className="text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Statutory Purpose & Case Number</label>
            <textarea
              rows={3}
              value={exportPurpose}
              onChange={(e) => setExportPurpose(e.target.value)}
              placeholder="Detail investigation purpose, case number, and requesting officer..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
            The exported container will be cryptographically signed with the agency's PKI certificate and entered into the WORM Audit Ledger.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteExport}>
              Generate Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: REGISTER NEW CAMERA DEVICE */}
      {/* ========================================================= */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New Video Sensor Device"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provision an ONVIF Profile S/G/T compliant camera into the Federal VMS cluster with automated 802.1AR certificate validation.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Device Name</label>
            <Input
              value={newCamName}
              onChange={(e) => setNewCamName(e.target.value)}
              placeholder="e.g. Sector 2 Exterior Perimeter Optical PTZ"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Device Code</label>
              <Input
                value={newCamCode}
                onChange={(e) => setNewCamCode(e.target.value)}
                placeholder="CAM-409-OPT"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution & FPS</label>
              <Input
                value={newCamResolution}
                onChange={(e) => setNewCamResolution(e.target.value)}
                placeholder="3840x2160 4K 60fps"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Installation Location</label>
            <Input
              value={newCamLocation}
              onChange={(e) => setNewCamLocation(e.target.value)}
              placeholder="Facility building, floor, zone"
              className="text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
            FIPS 140-3 SRTP encrypted stream configuration will be pushed automatically to the camera's management endpoint.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRegisterDevice}>
              Register Sensor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
