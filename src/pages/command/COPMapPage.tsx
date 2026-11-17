import React, { useState } from 'react'
import {
  Layers,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Shield,
  Radio,
  Video,
  AlertTriangle,
  Compass,
  PlusCircle,
  Eye,
  Maximize2,
  Minimize2,
  Navigation,
  Crosshair,
  Volume2,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Drawer } from '../../components/ui/Drawer'
import { Input, Select } from '../../components/ui/Input'
import { GeofenceZone } from '../../types/command'

export const COPMapPage: React.FC = () => {
  const {
    incidents,
    cameras,
    radios,
    geofences,
    activeAgencyId,
    agencies,
    personas,
    activePersonaId,
    addGeofence,
    toggleGeofence,
    assignUnitToIncident,
    addToast,
    logAuditEvent,
  } = useVanguardStore()

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  const [layers, setLayers] = useState({
    incidents: true,
    units: true,
    cameras: true,
    geofences: true,
    thermal: true,
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(100) // percentage 0-100
  const [selectedPin, setSelectedPin] = useState<string | null>('inc-8812')
  const [cameraStreamDrawerOpen, setCameraStreamDrawerOpen] = useState(false)
  const [activeStreamCamera, setActiveStreamCamera] = useState<any>(null)
  const [newGeofenceModalOpen, setNewGeofenceModalOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Geofence form state
  const [geofenceForm, setGeofenceForm] = useState({
    name: '',
    type: 'RESTRICTED_AIRSPACE' as GeofenceZone['type'],
    radiusMeters: 500,
    breachPolicy: 'Alert FAA & Slew Optical Mast',
  })

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleCreateGeofence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!geofenceForm.name.trim()) return

    const newZone: GeofenceZone = {
      id: 'geo-' + Math.floor(100 + Math.random() * 900),
      name: geofenceForm.name,
      type: geofenceForm.type,
      center: [38.8951, -77.0364],
      radiusMeters: Number(geofenceForm.radiusMeters),
      active: true,
      breachPolicy: geofenceForm.breachPolicy,
      authorizedAgency: activeAgency.code,
    }

    addGeofence(newZone)
    setNewGeofenceModalOpen(false)
    setGeofenceForm({
      name: '',
      type: 'RESTRICTED_AIRSPACE',
      radiusMeters: 500,
      breachPolicy: 'Alert FAA & Slew Optical Mast',
    })
  }

  const handleSlewCamera = (camera: any) => {
    setActiveStreamCamera(camera)
    setCameraStreamDrawerOpen(true)
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.role,
      action: 'VMS_CAMERA_PTZ_SLEW',
      targetEntity: 'CameraDevice',
      targetId: camera.id,
      outcome: 'SUCCESS',
      purpose: `Tactical PTZ slew to target coordinates from COP view`,
    })
  }

  return (
    <div
      className={`flex flex-col space-y-3 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : 'h-[calc(100vh-140px)]'
      }`}
    >
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Common Operating Picture (COP)
              </h2>
              <p className="text-[11px] text-slate-500">
                Geospatial sensor fusion, unit telemetry & dynamic incident overlays
              </p>
            </div>
          </div>
        </div>

        {/* Layer Toggles & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Layers:
            </span>
            <button
              onClick={() => toggleLayer('incidents')}
              className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                layers.incidents
                  ? 'bg-red-50 text-red-700 border-red-300 font-semibold'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Incidents ({incidents.length})
            </button>
            <button
              onClick={() => toggleLayer('units')}
              className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                layers.units
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Tactical Units ({radios.length})
            </button>
            <button
              onClick={() => toggleLayer('cameras')}
              className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                layers.cameras
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              CCTV/Thermal ({cameras.length})
            </button>
            <button
              onClick={() => toggleLayer('geofences')}
              className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                layers.geofences
                  ? 'bg-purple-50 text-purple-700 border-purple-300 font-semibold'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              Geofences ({geofences.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => setNewGeofenceModalOpen(true)}
            >
              New Geofence
            </Button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Side Panel Layout */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Tactical Map Canvas */}
        <div className="flex-1 bg-slate-900 rounded-md border border-slate-800 relative overflow-hidden flex flex-col shadow-inner">
          {/* Simulated Map Background Grid & Vector Visualizer */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Compass Rose & Map Telemetry Top Left */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-mono text-[11px] text-cyan-400 bg-black/75 px-3 py-1 rounded border border-cyan-800/60 backdrop-blur-xs">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>HEADING: 358° N // GRID: 18T WJ 0365 8977</span>
          </div>

          {/* Map Status Overlay Top Right */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end font-mono text-[10px]">
            <div className="px-2.5 py-1 bg-black/80 backdrop-blur-xs text-cyan-300 border border-cyan-800/60 rounded">
              CENTER: 38.8977° N, 77.0365° W (NCR)
            </div>
            <div className="px-2.5 py-1 bg-black/80 backdrop-blur-xs text-slate-300 border border-slate-700 rounded">
              ZOOM: 16.4x // SENSOR FUSION REFRESH: 1.0s
            </div>
          </div>

          {/* Simulated Tactical Nodes on Map */}
          <div className="relative flex-1 flex items-center justify-center p-8 select-none">
            {/* Geofence Overlay Circles */}
            {layers.geofences &&
              geofences.map((geo, idx) => (
                <div
                  key={geo.id}
                  style={{
                    width: `${geo.radiusMeters * 0.75}px`,
                    height: `${geo.radiusMeters * 0.75}px`,
                    transform: `translate(${idx * 40 - 20}px, ${idx * -30 + 10}px)`,
                  }}
                  className={`absolute rounded-full border-2 border-dashed pointer-events-none flex items-center justify-center transition-opacity ${
                    geo.type === 'RESTRICTED_AIRSPACE'
                      ? 'border-purple-500/60 bg-purple-500/5'
                      : geo.type === 'PERIMETER_SECURITY'
                      ? 'border-cyan-500/60 bg-cyan-500/5'
                      : 'border-amber-500/60 bg-amber-500/5'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 pointer-events-auto">
                    {geo.name}
                  </span>
                </div>
              ))}

            {/* Incidents on Map */}
            {layers.incidents &&
              incidents.map((inc, idx) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedPin(inc.id)}
                  style={{
                    transform: `translate(${idx * 75 - 110}px, ${idx * 45 - 60}px)`,
                  }}
                  className={`absolute z-20 cursor-pointer p-2 rounded-full transition-transform hover:scale-125 ${
                    selectedPin === inc.id
                      ? 'bg-red-600 text-white ring-4 ring-red-400/60 animate-bounce'
                      : 'bg-red-900/90 text-red-200 border border-red-500 shadow-lg'
                  }`}
                  title={`${inc.trackingNumber}: ${inc.title}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ))}

            {/* Tactical Units on Map */}
            {layers.units &&
              radios.map((rad, idx) => (
                <div
                  key={rad.id}
                  onClick={() => setSelectedPin(rad.id)}
                  style={{
                    transform: `translate(${idx * 115 - 130}px, ${idx * -65 + 40}px)`,
                  }}
                  className={`absolute z-10 cursor-pointer p-1.5 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform ${
                    selectedPin === rad.id
                      ? 'bg-cyan-500 ring-4 ring-cyan-400/50 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                  title={`${rad.radioId} (${rad.subscriberName})`}
                >
                  <Radio className="w-3.5 h-3.5" />
                </div>
              ))}

            {/* Cameras on Map */}
            {layers.cameras &&
              cameras.map((cam, idx) => (
                <div
                  key={cam.id}
                  onClick={() => setSelectedPin(cam.id)}
                  style={{
                    transform: `translate(${idx * -95 + 70}px, ${idx * 85 - 45}px)`,
                  }}
                  className={`absolute z-10 cursor-pointer p-1.5 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform ${
                    selectedPin === cam.id
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/50 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                  title={`${cam.cameraCode}: ${cam.name}`}
                >
                  <Video className="w-3.5 h-3.5" />
                </div>
              ))}
          </div>

          {/* Bottom Historical Timeline Playback Slider */}
          <div className="z-10 bg-slate-950/90 border-t border-slate-800 p-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded bg-cyan-700 hover:bg-cyan-600 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setPlaybackTime(100)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset to Live"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                {playbackTime === 100 ? '● LIVE OPERATIONAL FEED' : `T -${100 - playbackTime}m`}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 max-w-xl">
              <span className="text-[10px] text-slate-500 font-mono">-60m</span>
              <input
                type="range"
                min="0"
                max="100"
                value={playbackTime}
                onChange={(e) => setPlaybackTime(Number(e.target.value))}
                className="flex-1 accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-cyan-400 font-mono">NOW</span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono hidden md:block">
              SENSOR FUSION: SYNCED
            </div>
          </div>
        </div>

        {/* Right Tactical Entity Drawer / Inspector */}
        <div className="w-80 bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between overflow-y-auto shadow-2xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Inspector
              </h3>
              <span className="text-[10px] font-mono text-slate-400">PIV SECURE</span>
            </div>

            {selectedPin?.startsWith('inc-') ? (
              (() => {
                const inc = incidents.find((i) => i.id === selectedPin) || incidents[0]
                return (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 font-mono">{inc.trackingNumber}</span>
                        <Badge severity={inc.priority === 'P1_CRITICAL' ? 'CRITICAL' : 'HIGH'}>
                          {inc.priority.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-slate-800 font-semibold mt-1">{inc.title}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Location & Jurisdiction:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{inc.location.address}</p>
                      <p className="text-slate-500 text-[11px]">{inc.location.zone}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {inc.location.coordinates.join(', ')}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Assigned Tactical Units:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inc.assignedUnits.map((u) => (
                          <span
                            key={u}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-800 text-[10px] rounded border border-blue-200 font-mono font-semibold"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Command Summary:</span>
                      <p className="text-slate-700 text-xs mt-0.5 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                        {inc.summary}
                      </p>
                    </div>

                    {/* Direct Tactical Actions */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <Button
                        size="sm"
                        variant="teal"
                        className="w-full"
                        onClick={() => {
                          assignUnitToIncident(inc.id, 'FPS-Patrol-408')
                        }}
                      >
                        Dispatch Nearest Unit (FPS-Patrol-408)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSlewCamera(cameras[0])}
                      >
                        Slew Sector 4 Camera Feed
                      </Button>
                    </div>
                  </div>
                )
              })()
            ) : selectedPin?.startsWith('rad-') ? (
              (() => {
                const rad = radios.find((r) => r.id === selectedPin) || radios[0]
                return (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-bold text-blue-900 font-mono text-sm">{rad.radioId}</div>
                      <div className="text-slate-800 font-medium mt-0.5">{rad.subscriberName}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">P25 Talkgroup:</span>
                      <p className="font-mono font-bold text-slate-900 mt-0.5">{rad.talkgroup}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Radio Telemetry:</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[10px] text-slate-400 block">Battery</span>
                          <span className="font-bold text-emerald-700 font-mono">{rad.batteryPct}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                          <span className="text-[10px] text-slate-400 block">RF Signal</span>
                          <span className="font-bold text-slate-800 font-mono">{rad.signalDbm} dBm</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Cryptographic Key:</span>
                      <p className="text-cyan-800 font-mono text-[11px] bg-cyan-50 p-1.5 rounded border border-cyan-200 mt-0.5">
                        {rad.encryptionKeyStatus}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          addToast({
                            title: 'P25 Voice Patch Engaged',
                            message: `Direct channel opened with ${rad.radioId}`,
                            type: 'info',
                          })
                        }}
                      >
                        Open Voice Channel
                      </Button>
                    </div>
                  </div>
                )
              })()
            ) : selectedPin?.startsWith('cam-') ? (
              (() => {
                const cam = cameras.find((c) => c.id === selectedPin) || cameras[0]
                return (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded">
                      <div className="font-bold text-emerald-900 font-mono text-sm">{cam.cameraCode}</div>
                      <div className="text-slate-800 font-medium mt-0.5">{cam.name}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Location:</span>
                      <p className="font-medium text-slate-800 mt-0.5">{cam.location}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-semibold">Stream Resolution:</span>
                      <p className="font-mono text-slate-700 text-xs mt-0.5">{cam.resolution}</p>
                    </div>

                    {cam.lastDetection && (
                      <div>
                        <span className="text-slate-500 text-[11px] font-semibold">AI Analytics Detection:</span>
                        <p className="text-amber-800 text-[11px] bg-amber-50 p-2 rounded border border-amber-200 mt-0.5 leading-relaxed">
                          {cam.lastDetection}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <Button
                        size="sm"
                        variant="teal"
                        className="w-full"
                        onClick={() => handleSlewCamera(cam)}
                      >
                        Inspect Live Stream
                      </Button>
                    </div>
                  </div>
                )
              })()
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                Select any incident, unit, or camera pin on the tactical map to inspect real-time telemetry.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSelectedPin(null)}
            >
              Clear Pin Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-over Video Stream Preview Drawer */}
      <Drawer
        isOpen={cameraStreamDrawerOpen}
        onClose={() => setCameraStreamDrawerOpen(false)}
        title={activeStreamCamera?.name || 'Surveillance Stream'}
        subtitle={`${activeStreamCamera?.cameraCode} • ${activeStreamCamera?.resolution}`}
        width="xl"
      >
        {activeStreamCamera && (
          <div className="space-y-4 text-xs">
            {/* Simulated Live Video Player */}
            <div className="relative aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Telemetry OSD Header */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>REC // LIVE STREAM // FIPS-201 WATERMARKED</span>
              </div>

              <div className="absolute top-2 right-2 z-10 font-mono text-[10px] text-white/80 bg-black/70 px-2 py-0.5 rounded">
                60 FPS • BITRATE: 12.4 Mbps
              </div>

              {/* Crosshair Simulation */}
              <div className="relative flex flex-col items-center justify-center text-slate-600">
                <Crosshair className="w-16 h-16 text-cyan-500/40 animate-pulse" />
                <span className="text-[11px] font-mono text-cyan-400 mt-2">
                  PTZ OPTICAL FEED: {activeStreamCamera.cameraCode}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeStreamCamera.location}
                </span>
              </div>

              {/* Bottom OSD Bar */}
              <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-between text-[10px] font-mono text-white/70 bg-black/75 px-3 py-1 rounded">
                <span>IRIS: AUTO // ZOOM: 4.2x</span>
                <span>UTC: {new Date().toISOString()}</span>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="font-bold text-slate-800 block">PTZ Slew & Bookmark Controls</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToast({ title: 'PTZ Preset', message: 'Slewed to Door 4B Lock', type: 'info' })}
                >
                  Preset: Door 4B
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToast({ title: 'PTZ Preset', message: 'Slewed to Loading Gate', type: 'info' })}
                >
                  Preset: Gate Outer
                </Button>
                <Button
                  size="sm"
                  variant="teal"
                  onClick={() => addToast({ title: 'Evidence Bookmark', message: 'Event clip bookmarked and sent to DEMS queue', type: 'success' })}
                >
                  Bookmark Event Clip
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Geofence Authoring Modal */}
      <Modal
        isOpen={newGeofenceModalOpen}
        onClose={() => setNewGeofenceModalOpen(false)}
        title="Author Dynamic Operational Geofence"
        subtitle="Define tactical boundary & automatic alert policy"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewGeofenceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleCreateGeofence}>
              Activate Geofence
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateGeofence} className="space-y-4 text-xs">
          <Input
            label="Geofence Name"
            placeholder="e.g. Dignitary Outer Exclusion Perimeter"
            value={geofenceForm.name}
            onChange={(e) => setGeofenceForm({ ...geofenceForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Boundary Category"
              value={geofenceForm.type}
              onChange={(e) =>
                setGeofenceForm({ ...geofenceForm, type: e.target.value as GeofenceZone['type'] })
              }
              options={[
                { value: 'RESTRICTED_AIRSPACE', label: 'Restricted Airspace (C-UAS)' },
                { value: 'PERIMETER_SECURITY', label: 'Perimeter Security Ring' },
                { value: 'EXCLUSION_ZONE', label: 'Hazard / Exclusion Zone' },
                { value: 'DIGNITARY_ROUTE', label: 'Dignitary Route Corridor' },
              ]}
            />

            <Input
              label="Radius (Meters)"
              type="number"
              value={geofenceForm.radiusMeters}
              onChange={(e) => setGeofenceForm({ ...geofenceForm, radiusMeters: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Automatic Breach Policy / Action"
            value={geofenceForm.breachPolicy}
            onChange={(e) => setGeofenceForm({ ...geofenceForm, breachPolicy: e.target.value })}
            placeholder="e.g. Slew Optical Mast & Dispatch Tactical K9"
            required
          />
        </form>
      </Modal>
    </div>
  )
}
