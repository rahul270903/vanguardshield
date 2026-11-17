import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Mic,
  MicOff,
  Radio,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Server,
  FileText,
  UserCheck,
  Activity,
  Layers,
  Search,
  Filter,
  Play,
  Pause,
  Volume2,
  Lock,
  ExternalLink,
  Plus,
  RefreshCw,
  Sliders,
  Send,
  Eye,
  Headphones,
  FileCheck,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { CallSession, RoutingRule, PSAPEndpoint, OperatorSession, CallRecording } from '../../types/modules'
import {
  SEED_CALL_SESSIONS,
  SEED_ROUTING_RULES,
  SEED_PSAP_ENDPOINTS,
  SEED_OPERATOR_SESSIONS,
  SEED_CALL_RECORDINGS,
} from '../../store/seedData'
import { tacticalAudio } from '../../utils/audioSimulator'

export const NG911Page: React.FC = () => {
  const store = useVanguardStore()
  const {
    incidents,
    activeAgencyId,
    agencies,
    answerCall,
    holdCall,
    resumeCall,
    releaseCall,
    transferCall,
    linkCallToIncident,
    simulateIncomingCall,
    toggleRoutingRule,
    simulatePsapFailover,
    requestRedaction,
    updateOperatorState,
    supervisorBargeIn,
    addToast,
  } = store

  const callSessions: CallSession[] = store.callSessions?.length ? store.callSessions : SEED_CALL_SESSIONS
  const routingRules: RoutingRule[] = store.routingRules?.length ? store.routingRules : SEED_ROUTING_RULES
  const psapEndpoints: PSAPEndpoint[] = store.psapEndpoints?.length ? store.psapEndpoints : SEED_PSAP_ENDPOINTS
  const operatorSessions: OperatorSession[] = store.operatorSessions?.length ? store.operatorSessions : SEED_OPERATOR_SESSIONS
  const callRecordings: CallRecording[] = store.callRecordings?.length ? store.callRecordings : SEED_CALL_RECORDINGS

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]

  // Active Screen Tab
  const [activeTab, setActiveTab] = useState<'workspace' | 'routing' | 'supervisor' | 'review' | 'failover'>('workspace')

  // Screen 1: Call-Taking Workspace state
  const [selectedCallId, setSelectedCallId] = useState<string>(callSessions[0]?.id || '')
  const selectedCall = callSessions.find((c) => c.id === selectedCallId) || callSessions[0]
  const [callNotes, setCallNotes] = useState<string>('')
  const [callTimerSec, setCallTimerSec] = useState<number>(selectedCall?.durationSec || 0)

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [targetPsap, setTargetPsap] = useState('USSS-SOD-GATEWAY')
  const [transferReason, setTransferReason] = useState('Jurisdictional handover for protective zone event')

  const [linkIncidentModalOpen, setLinkIncidentModalOpen] = useState(false)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '')

  // Screen 2: Route Simulator state
  const [simLat, setSimLat] = useState('38.8977')
  const [simLng, setSimLng] = useState('-77.0365')
  const [simCallType, setSimCallType] = useState('E911_VOICE')
  const [simResult, setSimResult] = useState<string | null>(null)

  // Screen 4: Call Review state
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>(callRecordings[0]?.id || '')
  const selectedRecording = callRecordings.find((r) => r.id === selectedRecordingId) || callRecordings[0]
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(35)
  const [redactionModalOpen, setRedactionModalOpen] = useState(false)
  const [redactionReason, setRedactionReason] = useState('Redact personally identifiable civilian mobile number (CJIS Policy 5.4)')
  const [redactionRange, setRedactionRange] = useState('00:15 - 00:28')

  // Sync call timer for active calls
  useEffect(() => {
    if (selectedCall?.status === 'ACTIVE') {
      const interval = setInterval(() => {
        setCallTimerSec((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [selectedCall?.status])

  useEffect(() => {
    if (selectedCall) {
      setCallTimerSec(selectedCall.durationSec)
      setCallNotes(selectedCall.notes || '')
    }
  }, [selectedCallId])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Audio playback controller with real audio synthesis
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null
    if (isPlayingAudio) {
      tacticalAudio.startPlayback()
      progressInterval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            tacticalAudio.stopPlayback()
            setIsPlayingAudio(false)
            return 0
          }
          return prev + 1.5
        })
      }, 500)
    } else {
      tacticalAudio.stopPlayback()
    }
    return () => {
      if (progressInterval) clearInterval(progressInterval)
      tacticalAudio.stopPlayback()
    }
  }, [isPlayingAudio])

  const toggleAudioPlayback = () => {
    setIsPlayingAudio((prev) => !prev)
  }

  const handleSaveNotes = () => {
    addToast({
      title: 'Dispatcher Notes Appended',
      message: `Updated notes for session ${selectedCall?.id}`,
      type: 'success',
    })
  }

  const handleExecuteTransfer = () => {
    if (selectedCall) {
      transferCall(selectedCall.id, targetPsap, transferReason)
      setTransferModalOpen(false)
    }
  }

  const handleExecuteLink = () => {
    if (selectedCall && selectedIncidentId) {
      linkCallToIncident(selectedCall.id, selectedIncidentId)
      setLinkIncidentModalOpen(false)
    }
  }

  const handleRunRouteSimulation = () => {
    setSimResult(
      `Resolved Route: FPS-NCR-PRIMARY via ESInet Trunk 04 (Priority 1 Matching Rule: NCR Federal Buildings Life-Safety Geodetic Rule). Target latency: 1.8ms. Automatic conference to FPS Sector 1 CAD dispatched.`
    )
    addToast({
      title: 'ESInet Geodetic Route Computed',
      message: 'Matched 1 active rule with 99.8% confidence',
      type: 'info',
    })
  }

  const handleExecuteRedaction = () => {
    if (selectedRecording) {
      requestRedaction(selectedRecording.id, redactionReason, redactionRange)
      setRedactionModalOpen(false)
    }
  }

  const ringingCallsCount = callSessions.filter((c) => c.status === 'RINGING').length

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 01 // ESInet Core
                </span>
                <span className="text-xs text-slate-400">NENA i3 Compliant</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  ESInet Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                NG911 / Emergency Call Management
              </h1>
              <p className="text-xs text-slate-400">
                Receive, route, geolocate and control emergency voice/text sessions with cryptographic CJIS chain of custody.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={simulateIncomingCall}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5 animate-bounce" />
              <span>Simulate Inbound 911 Call</span>
            </Button>
            <Link to="/command/incidents">
              <Button variant="secondary" size="sm" className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Open CAD Incidents</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Call-Taking Workspace</span>
            {ringingCallsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {ringingCallsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'routing'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Routing Console</span>
          </button>

          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'supervisor'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Supervisor Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'review'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Call Review & CJIS Redaction</span>
          </button>

          <button
            onClick={() => setActiveTab('failover')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'failover'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Failover Configuration</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SCREEN 1: CALL-TAKING WORKSPACE */}
      {/* ========================================================= */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Call Queue & Inbound Ringing List (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Active Emergency Queue ({callSessions.length})
                  </CardTitle>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Jurisdiction: {activeAgency.code}</span>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                {callSessions.map((call) => {
                  const isSelected = call.id === selectedCall?.id
                  return (
                    <div
                      key={call.id}
                      onClick={() => setSelectedCallId(call.id)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{call.id}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              call.status === 'RINGING'
                                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                : call.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : call.status === 'ON_HOLD'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : call.status === 'TRANSFERRED'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {call.status}
                          </span>
                          <span className="text-[10px] px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                            {call.callType}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{formatTimer(call.durationSec)}</span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 truncate mb-1">
                        {call.callerNumber} {call.callerName ? `• ${call.callerName}` : ''}
                      </div>

                      <div className="flex items-center text-[11px] text-slate-500 mb-2 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{call.locationAddress}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-medium text-[10px]">
                          Geo: {call.locationConfidence}% confidence
                        </span>

                        {call.status === 'RINGING' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCallId(call.id)
                              answerCall(call.id)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 px-2.5 h-auto"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Answer Line
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Assigned: {call.operatorId}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Call Workspace Detail & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedCall ? (
              <Card className="border-t-4 border-t-blue-600">
                <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{selectedCall.id}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                        {selectedCall.callType}
                      </span>
                      {selectedCall.cadIncidentId && (
                        <Link to="/command/incidents">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800 hover:underline">
                            Linked: {selectedCall.cadIncidentId}
                          </span>
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session established: {new Date(selectedCall.timestamp).toLocaleTimeString()} • Jurisdiction: {selectedCall.jurisdiction}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-slate-900">{formatTimer(callTimerSec)}</div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Session Duration</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Tactical Call Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 rounded-lg text-white">
                    {selectedCall.status === 'RINGING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => answerCall(selectedCall.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Answer Call</span>
                      </Button>
                    )}

                    {selectedCall.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => holdCall(selectedCall.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Hold Call</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTransferModalOpen(true)}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
                        >
                          <PhoneForwarded className="w-3.5 h-3.5" />
                          <span>Transfer / Conference</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setLinkIncidentModalOpen(true)}
                          className="bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700 flex items-center space-x-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Link CAD Incident</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => releaseCall(selectedCall.id)}
                          className="bg-red-600 hover:bg-red-700 text-white ml-auto flex items-center space-x-1.5"
                        >
                          <PhoneOff className="w-3.5 h-3.5" />
                          <span>Release Line</span>
                        </Button>
                      </>
                    )}

                    {selectedCall.status === 'ON_HOLD' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => resumeCall(selectedCall.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume Call</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => releaseCall(selectedCall.id)}
                          className="bg-red-600 hover:bg-red-700 text-white ml-auto flex items-center space-x-1.5"
                        >
                          <PhoneOff className="w-3.5 h-3.5" />
                          <span>Release Line</span>
                        </Button>
                      </>
                    )}

                    {(selectedCall.status === 'RELEASED' || selectedCall.status === 'TRANSFERRED') && (
                      <div className="flex items-center space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Session concluded ({selectedCall.status}). Master audio archived to DEMS vault.</span>
                      </div>
                    )}
                  </div>

                  {/* Geolocation & Subscriber Meta Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Caller Endpoint</span>
                        <Badge variant="outline" className="text-[10px]">FIPS 140-3 Validated</Badge>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900 mb-0.5">{selectedCall.callerNumber}</div>
                      <div className="text-xs text-slate-700">{selectedCall.callerName || 'Anonymous / Unregistered Line'}</div>
                      <div className="text-[11px] text-slate-500 mt-2 font-mono">
                        Target PSAP: <span className="text-slate-800 font-semibold">{selectedCall.psapTarget || 'FPS-NCR-PRIMARY'}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>ESInet Geodetic Location</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {selectedCall.locationConfidence}% Accuracy
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mb-1">{selectedCall.locationAddress}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Coordinates: {selectedCall?.coordinates?.[0] != null ? `${selectedCall.coordinates[0].toFixed(4)}, ${selectedCall.coordinates[1].toFixed(4)}` : '38.8977, -77.0365'} (Datum: WGS84)
                      </div>
                      <div className="text-[11px] text-blue-600 hover:underline cursor-pointer mt-1.5 flex items-center">
                        <Link to="/command/cop" className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>Plot on Common Operating Picture (COP)</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Live Transcript Stream */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                        <Activity className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                        Live Voice-to-Text Stream (NIST ASR-19)
                      </span>
                      <span className="text-[11px] text-slate-400">Stream encrypted TLS 1.3 / SRTP</span>
                    </div>
                    <div className="p-3.5 bg-slate-900 text-slate-200 rounded font-mono text-xs leading-relaxed border border-slate-800">
                      {selectedCall.transcriptSnippet || '[Awaiting incoming RTP packet payload...]'}
                    </div>
                  </div>

                  {/* Dispatcher Notes Section */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Dispatcher Field Notes & Observations
                    </label>
                    <textarea
                      rows={3}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Enter caller observations, weapons involved, casualty counts, or tactical directions..."
                      className="w-full text-xs font-sans p-3 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <Button variant="secondary" size="sm" onClick={handleSaveNotes} className="text-xs">
                        Save & Append Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center bg-white rounded border border-slate-200">
                <p className="text-sm text-slate-500">Select a call session from the queue to view controls</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: ROUTING CONSOLE */}
      {/* ========================================================= */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-3 bg-blue-50 rounded text-blue-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Active Routing Rules</div>
                  <div className="text-lg font-bold text-slate-900">
                    {routingRules.filter((r) => r.active).length} / {routingRules.length} Active
                  </div>
                  <div className="text-[11px] text-slate-400">Policy evaluation latency &lt; 2ms</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded text-emerald-600">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">ESInet Gateways</div>
                  <div className="text-lg font-bold text-slate-900">{psapEndpoints.length} Gateways Online</div>
                  <div className="text-[11px] text-emerald-600">All Session Border Controllers Nominal</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-3 bg-purple-50 rounded text-purple-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Geodetic Location Server (LIS)</div>
                  <div className="text-lg font-bold text-slate-900">99.82% Confidence</div>
                  <div className="text-[11px] text-slate-400">Datum: NAD83 / WGS84 High Precision</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy-Based Routing Engine Rules */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Policy-Based Routing (ESInet Policy Decision Point)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered geodetic and condition-based rules evaluated at the emergency call border gateway.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">NENA-STA-010.3b</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Policy Rule Name</th>
                    <th className="py-3 px-4">Condition Expression</th>
                    <th className="py-3 px-4">Primary Destination PSAP</th>
                    <th className="py-3 px-4">Failover Route</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routingRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{rule.priority}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{rule.ruleName}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700 bg-blue-50/50 rounded">
                        {rule.condition}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{rule.primaryPSAP}</td>
                      <td className="py-3.5 px-4 text-slate-500">{rule.failoverPSAP}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            rule.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleRoutingRule(rule.id)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          {rule.active ? 'Disable Rule' : 'Enable Rule'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Interactive Route Simulation Engine */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Interactive ESInet Route Simulator
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate ingress SIP emergency INVITE packet against policy rules to verify PSAP delivery prior to deployment.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Caller Geodetic Latitude</label>
                  <Input
                    value={simLat}
                    onChange={(e) => setSimLat(e.target.value)}
                    placeholder="38.8977"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Caller Geodetic Longitude</label>
                  <Input
                    value={simLng}
                    onChange={(e) => setSimLng(e.target.value)}
                    placeholder="-77.0365"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Session Media Type</label>
                  <Select
                    value={simCallType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSimCallType(e.target.value)}
                    options={[
                      { value: 'E911_VOICE', label: 'E911 Voice (SIP RTP G.711u)' },
                      { value: 'NG911_TEXT', label: 'NG911 Real-Time Text (RTT / MSRP)' },
                      { value: 'SIP_EMERGENCY', label: 'SIP Direct Agency Interconnect' },
                    ]}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Evaluates current GIS shapefiles and priority policy chain</span>
                <Button variant="primary" size="sm" onClick={handleRunRouteSimulation}>
                  Compute Route Resolution
                </Button>
              </div>

              {simResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-mono leading-relaxed">
                  <div className="font-bold flex items-center mb-1 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    SIMULATION TEST SUCCESSFUL
                  </div>
                  {simResult}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 3: SUPERVISOR MONITOR */}
      {/* ========================================================= */}
      {activeTab === 'supervisor' && (
        <div className="space-y-6">
          {/* Key Service Level Indicators (SLAs) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-slate-500">Average Speed of Answer (ASA)</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">3.2s</div>
                <div className="text-[11px] text-emerald-600 mt-1">99.4% &lt; 10s (Target: 95%)</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-slate-500">Current Queue Depth</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {callSessions.filter((c) => c.status === 'RINGING' || c.status === 'ON_HOLD').length} Calls
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Surge threshold: 6 calls</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-slate-500">Active Operator Stations</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {operatorSessions.filter((o) => o.state === 'READY' || o.state === 'ON_CALL').length} / {operatorSessions.length} Online
                </div>
                <div className="text-[11px] text-blue-600 mt-1">Shift 1 - Full Staffing</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-medium text-slate-500">Total Handled Today</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {operatorSessions.reduce((sum, o) => sum + o.handledTodayCount, 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Zero dropped or abandoned calls</div>
              </CardContent>
            </Card>
          </div>

          {/* Operator Presence Roster & Intervention Controls */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Dispatcher & Call-Taker Presence Console
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supervisory real-time oversight, presence status overrides, and silent monitor / barge-in controls.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">Supervisor Clearance: Active</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Active Call Leg</th>
                    <th className="py-3 px-4">Calls Today</th>
                    <th className="py-3 px-4">Avg Talk Time</th>
                    <th className="py-3 px-4 text-right">Supervisory Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operatorSessions.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{op.operatorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{op.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">{op.role}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            op.state === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : op.state === 'ON_CALL'
                              ? 'bg-blue-100 text-blue-800'
                              : op.state === 'WRAP_UP'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {op.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {op.activeCallId ? (
                          <span className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => setSelectedCallId(op.activeCallId!)}>
                            {op.activeCallId}
                          </span>
                        ) : (
                          <span className="text-slate-400">None (Idle)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{op.handledTodayCount}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{op.avgTalkSec}s</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {op.state === 'ON_CALL' && op.activeCallId && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => supervisorBargeIn(op.id, op.activeCallId!)}
                              className="text-[10px] py-1 px-2 h-auto flex items-center space-x-1"
                            >
                              <Headphones className="w-3 h-3" />
                              <span>Barge-In</span>
                            </Button>
                          )}
                          <Select
                            value={op.state}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateOperatorState(op.id, e.target.value as OperatorSession['state'])}
                            options={[
                              { value: 'READY', label: 'Set READY' },
                              { value: 'ON_CALL', label: 'Set ON_CALL' },
                              { value: 'WRAP_UP', label: 'Set WRAP_UP' },
                              { value: 'BREAK', label: 'Set BREAK' },
                            ]}
                            className="text-[10px] py-0.5 px-1.5 w-28"
                          />
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
      {/* SCREEN 4: CALL REVIEW & CJIS REDACTION */}
      {/* ========================================================= */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recording Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Recorded Sessions Archive (WORM Storage)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  CJIS Security Policy 5.4 compliant tamper-evident audio logs.
                </p>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                {callRecordings.map((rec) => {
                  const isSelected = rec.id === selectedRecording?.id
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecordingId(rec.id)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{rec.id}</span>
                        <span className="font-mono text-[11px] text-slate-500">{formatTimer(rec.durationSec)}</span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold mb-1">
                        Linked: {rec.callSessionId} • {rec.callerNumber}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{new Date(rec.timestamp).toLocaleString()}</span>
                        {rec.hasLegalHold && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold flex items-center">
                            <Lock className="w-2.5 h-2.5 mr-0.5" />
                            Legal Hold
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Audio Waveform Player & Redaction Tools (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedRecording ? (
              <Card>
                <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Recording Player: {selectedRecording.id}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session: {selectedRecording.callSessionId} • Retention: {selectedRecording.retentionCategory}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRedactionModalOpen(true)}
                    className="text-xs flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Request CJIS Redaction</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  {/* Waveform Visualization Simulation */}
                  <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
                      <span>CH-01: Inbound Emergency Line</span>
                      <span>Opus 48kHz / 24-bit PCM</span>
                    </div>

                    {/* Bar visualization */}
                    <div className="h-20 flex items-center justify-between gap-1 px-1">
                      {Array.from({ length: 48 }).map((_, i) => {
                        const height = Math.min(100, Math.max(15, Math.sin(i * 0.4) * 50 + 40 + (i % 5) * 8))
                        const isPast = (i / 48) * 100 <= playbackProgress
                        return (
                          <div
                            key={i}
                            className={`w-full rounded-sm transition-all ${
                              isPast ? 'bg-blue-400' : 'bg-slate-700'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        )
                      })}
                    </div>

                    {/* Playback Progress Slider */}
                    <div className="mt-4 flex items-center space-x-3">
                      <span className="font-mono text-xs text-slate-400">
                        {formatTimer(Math.floor((playbackProgress / 100) * selectedRecording.durationSec))}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={playbackProgress}
                        onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <span className="font-mono text-xs text-slate-400">{formatTimer(selectedRecording.durationSec)}</span>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center space-x-4 mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleAudioPlayback}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 mr-1.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1.5" /> Playback Audio
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-slate-400 font-mono">Rate: 1.0x</span>
                    </div>
                  </div>

                  {/* Cryptographic Chain of Custody Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Shield className="w-4 h-4 text-emerald-600 mr-1.5" />
                      Cryptographic Evidence Verification (FIPS 180-4)
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 break-all bg-white p-2.5 rounded border border-slate-200">
                      SHA-256: {selectedRecording.hashSha256}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Redactions recorded: {selectedRecording.redactionsCount || 0}</span>
                      <span className="text-emerald-700 font-medium">Chain of Custody Unbroken</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center bg-white rounded border border-slate-200">
                <p className="text-sm text-slate-500">Select a recording from the archive to review</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 5: FAILOVER CONFIGURATION */}
      {/* ========================================================= */}
      {activeTab === 'failover' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  PSAP Border Gateway & ESInet Failover Endpoints
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated SIP trunk health heartbeats, secondary cluster failover triggers, and disaster recovery route diverters.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">COOP Level 1</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">PSAP Endpoint Name</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">ESInet SIP URI</th>
                    <th className="py-3 px-4">Queue Depth</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Failover Mode</th>
                    <th className="py-3 px-4 text-right">Emergency Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {psapEndpoints.map((psap) => (
                    <tr key={psap.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{psap.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{psap.jurisdiction}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700">{psap.esinetUri}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">{psap.queueDepth} sessions</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            psap.status === 'NOMINAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {psap.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            psap.failoverActive
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {psap.failoverActive ? 'FAILOVER ACTIVE' : 'PRIMARY DIRECT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={psap.failoverActive ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => simulatePsapFailover(psap.id)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          {psap.failoverActive ? 'Revert to Primary' : 'Trigger Failover Test'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Automated Health Check Heartbeat Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  SIP OPTIONS Probe Heartbeat Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">FPS-NCR Primary Trunk Latency</span>
                  <span className="font-mono font-bold text-emerald-600">2.1ms (0.00% jitter)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">USSS Gateway Interconnect</span>
                  <span className="font-mono font-bold text-emerald-600">1.8ms (0.00% jitter)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">FEMA NRCC Standby Cloud Route</span>
                  <span className="font-mono font-bold text-slate-700">8.4ms (Standby OK)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">BGP Route Diverter Convergence Time</span>
                  <span className="font-mono font-bold text-blue-600">&lt; 400ms Sub-Second</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50/70">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Automated Failover Release Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  • <strong>Trigger Condition:</strong> 3 consecutive SIP 503 Service Unavailable responses or ping latency &gt; 250ms triggers automated diversion to secondary PSAP within 1.2 seconds.
                </p>
                <p>
                  • <strong>Hold-Down Timer:</strong> Minimum 15-minute stabilization period required before automatic return to primary trunk to prevent route oscillation.
                </p>
                <p>
                  • <strong>Audit Requirement:</strong> Every failover invocation triggers an append-only cryptographic event in the Operational Audit Ledger.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INTER-AGENCY PSAP TRANSFER */}
      {/* ========================================================= */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Inter-Agency PSAP Call Transfer"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Transfer session <span className="font-mono font-bold text-slate-900">{selectedCall?.id}</span> to another authorized PSAP or Special Operations Gateway with verified location data.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target PSAP / Gateway</label>
            <Select
              value={targetPsap}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetPsap(e.target.value)}
              options={[
                { value: 'USSS-SOD-GATEWAY', label: 'USSS Special Ops Gateway (Protective Perimeter Alpha)' },
                { value: 'FEMA-NRCC-OVERFLOW', label: 'FEMA National Response Coordination Center' },
                { value: 'MPD-CITY-911-COOP', label: 'DC Metropolitan Police Department City 911 COOP' },
                { value: 'FPS-REGION-3-BACKUP', label: 'FPS Region 3 Emergency Standby' },
              ]}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Justification & Handover Notes</label>
            <textarea
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="State reason for transfer (e.g., jurisdictional shift, protective boundary)..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
            Emergency audio leg, caller GIS metadata, and live transcript will transfer simultaneously via ESInet SIP REFER.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteTransfer}>
              Execute Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: LINK TO CAD INCIDENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={linkIncidentModalOpen}
        onClose={() => setLinkIncidentModalOpen(false)}
        title="Associate Call with CAD Incident Record"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select an active Computer-Aided Dispatch (CAD) incident to link with call session <span className="font-mono font-bold text-slate-900">{selectedCall?.id}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Active CAD Incident</label>
            <Select
              value={selectedIncidentId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedIncidentId(e.target.value)}
              options={incidents.map((inc) => ({
                value: inc.id,
                label: `[${inc.trackingNumber}] ${inc.title} (${inc.priority})`,
              }))}
              className="text-xs"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <div className="font-semibold text-slate-800">Incident Cross-Reference Impact:</div>
            <p className="text-slate-600 text-[11px]">
              Linking associates audio transcripts, caller location, and time stamps directly into the incident evidence bundle.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setLinkIncidentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteLink}>
              Confirm Association
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CJIS REDACTION REQUEST */}
      {/* ========================================================= */}
      <Modal
        isOpen={redactionModalOpen}
        onClose={() => setRedactionModalOpen(false)}
        title="Request CJIS Audio Redaction"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            File a formal redaction request for recording <span className="font-mono font-bold text-slate-900">{selectedRecording?.id}</span> pursuant to CJIS Security Policy 5.4.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time Range to Redact (MM:SS - MM:SS)</label>
            <Input
              value={redactionRange}
              onChange={(e) => setRedactionRange(e.target.value)}
              placeholder="00:15 - 00:28"
              className="text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Statutory Justification & Policy Reason</label>
            <textarea
              rows={3}
              value={redactionReason}
              onChange={(e) => setRedactionReason(e.target.value)}
              placeholder="Cite CJIS policy, privacy act, juvenile PII, or security detail exclusion..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
            Original master recording will remain preserved in immutable WORM storage. Redacted version will be generated with a derivative SHA-256 hash.
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRedactionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteRedaction}>
              Submit Redaction Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
