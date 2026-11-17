import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  Share2,
  Shield,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Zap,
  Sliders,
  CheckCircle2,
  Lock,
  Battery,
  Gauge,
  Clock,
  ChevronRight,
  Info,
  Server,
  Wifi,
  WifiOff,
  Compass,
  Send,
  Trash2,
  Cpu,
  Layers,
  ArrowRightLeft,
  Flame,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { MeshNode, MeshLink, MissionNetworkProfile, MANETSecurityEvent, TacticalGateway } from '../../types/modules'

type TabType =
  | 'topology'
  | 'enrollment'
  | 'profiles'
  | 'link-monitor'
  | 'security-events'
  | 'gateways'

export default function MANETPage() {
  const [activeTab, setActiveTab] = useState<TabType>('topology')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-gw-01')
  const [nodeSearchQuery, setNodeSearchQuery] = useState('')
  const [nodeRoleFilter, setNodeRoleFilter] = useState<string>('ALL')
  const [eventSearchQuery, setEventSearchQuery] = useState('')

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [newNodeCode, setNewNodeCode] = useState('MN-TAC-08')
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeModel, setNewNodeModel] = useState('Silvus StreamCaster SC4400E')
  const [newNodeRole, setNewNodeRole] = useState<MeshNode['role']>('ENDPOINT')
  const [newNodeIp, setNewNodeIp] = useState('10.198.1.8')
  const [newNodeMac, setNewNodeMac] = useState('00:1E:C0:A4:12:08')
  const [newNodeFreq, setNewNodeFreq] = useState(2240)
  const [newNodeTxPower, setNewNodeTxPower] = useState(4.0)
  const [newNodeMission, setNewNodeMission] = useState('NCR Federal Core Protection')

  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false)
  const [quarantineTargetNode, setQuarantineTargetNode] = useState<MeshNode | null>(null)
  const [quarantineReason, setQuarantineReason] = useState('Certificate validation failed / anomalous beacon drift')

  const [isZeroizeModalOpen, setIsZeroizeModalOpen] = useState(false)
  const [zeroizeTargetNode, setZeroizeTargetNode] = useState<MeshNode | null>(null)

  const [isFleetZeroizeModalOpen, setIsFleetZeroizeModalOpen] = useState(false)

  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileMissionCode, setNewProfileMissionCode] = useState('TAC-OPS-NEW')
  const [newProfileBand, setNewProfileBand] = useState<MissionNetworkProfile['rfBand']>('S-BAND (2200-2400 MHz)')
  const [newProfileBw, setNewProfileBw] = useState(10.0)
  const [newProfileQos, setNewProfileQos] = useState<MissionNetworkProfile['qosPriorityClass']>('VOICE_CRITICAL_CLASS_1')
  const [newProfileMaxHops, setNewProfileMaxHops] = useState(4)

  // Store bindings
  const {
    meshNodes,
    meshLinks,
    missionProfiles,
    manetSecurityEvents,
    tacticalGateways,
    enrollMeshNode,
    quarantineMeshNode,
    reinstateMeshNode,
    emergencyZeroizeNode,
    emergencyZeroizeAllNodes,
    activateMissionProfile,
    simulateLinkBreak,
    toggleGatewayFailover,
    addToast,
    logAuditEvent,
    activeAgencyId,
  } = useVanguardStore()

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return meshNodes.find(n => n.id === selectedNodeId) || meshNodes[0] || null
  }, [meshNodes, selectedNodeId])

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return meshNodes.filter(node => {
      const matchesSearch =
        node.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        node.nodeCode.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        node.ipAddress.includes(nodeSearchQuery) ||
        node.model.toLowerCase().includes(nodeSearchQuery.toLowerCase())
      const matchesRole = nodeRoleFilter === 'ALL' || node.role === nodeRoleFilter
      return matchesSearch && matchesRole
    })
  }, [meshNodes, nodeSearchQuery, nodeRoleFilter])

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return manetSecurityEvents.filter(evt =>
      evt.nodeName.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.details.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.eventType.toLowerCase().includes(eventSearchQuery.toLowerCase())
    )
  }, [manetSecurityEvents, eventSearchQuery])

  // Active Profile
  const activeProfile = useMemo(() => {
    return missionProfiles.find(p => p.active) || missionProfiles[0]
  }, [missionProfiles])

  // Form Handlers
  const handleEnrollNode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNodeName.trim()) return

    enrollMeshNode({
      nodeCode: newNodeCode,
      name: newNodeName,
      model: newNodeModel,
      role: newNodeRole,
      ipAddress: newNodeIp,
      macAddress: newNodeMac,
      frequencyMhz: newNodeFreq,
      txPowerWatts: newNodeTxPower,
      batteryPct: 100,
      status: 'ACTIVE',
      hopCount: newNodeRole === 'GATEWAY' ? 0 : 1,
      snrDb: 25,
      assignedMission: newNodeMission,
      certificateExpiry: '2027-12-31',
      fipsValidated: true,
      tamperState: 'SECURE',
      gatewayUplink: newNodeRole === 'GATEWAY' ? 'STARLINK_SAT' : 'NONE',
      coordinates: [38.8975, -77.0362],
    })

    setIsEnrollModalOpen(false)
    setNewNodeName('')
  }

  const handleConfirmQuarantine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quarantineTargetNode) return
    quarantineMeshNode(quarantineTargetNode.id, quarantineReason)
    setIsQuarantineModalOpen(false)
    setQuarantineTargetNode(null)
  }

  const handleConfirmZeroize = () => {
    if (!zeroizeTargetNode) return
    emergencyZeroizeNode(zeroizeTargetNode.id)
    setIsZeroizeModalOpen(false)
    setZeroizeTargetNode(null)
  }

  const handleConfirmFleetZeroize = () => {
    emergencyZeroizeAllNodes()
    setIsFleetZeroizeModalOpen(false)
  }

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfileName.trim()) return

    const newProf: MissionNetworkProfile = {
      id: `prof-${Date.now()}`,
      profileName: newProfileName,
      missionCode: newProfileMissionCode,
      rfBand: newProfileBand,
      bandwidthMhz: newProfileBw,
      qosPriorityClass: newProfileQos,
      maxHops: newProfileMaxHops,
      activeNodesCount: 0,
      keyRotationEpochHours: 12,
      active: false,
    }

    useVanguardStore.setState(s => ({
      missionProfiles: [...s.missionProfiles, newProf],
    }))

    addToast({
      title: 'Mission Profile Created',
      message: `${newProf.profileName} saved in tactical profiles catalogue`,
      type: 'success',
    })

    setIsCreateProfileModalOpen(false)
    setNewProfileName('')
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 05 // MANET-TACCOM
                </span>
                <span className="text-xs text-slate-400">TSM / Silvus MIMO / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  TSM / MIMO Active
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                MANET Tactical Communications &amp; Mobile Mesh Network
              </h1>
              <p className="text-xs text-slate-400">
                Self-forming, self-healing ad-hoc tactical mesh networking with FIPS 140-3 mutual authentication, QoS prioritization, and enterprise gateway bridging.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const activeLink = meshLinks[0]
                if (activeLink) simulateLinkBreak(activeLink.id)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Mesh Heal</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsFleetZeroizeModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fleet Zeroize</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Mesh Node</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'topology'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Mesh Topology Console</span>
          </button>

          <button
            onClick={() => setActiveTab('enrollment')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'enrollment'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Node Enrollment &amp; Posture</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {meshNodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profiles'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mission Network Profiles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/60">
              {missionProfiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('link-monitor')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'link-monitor'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Link Monitor &amp; RF Telemetry</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {meshLinks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security-events')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security-events'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security &amp; Zeroization</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {manetSecurityEvents.length}
            </span>
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
            <span>Tactical Gateways &amp; Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-cyan-300 border border-blue-700/50">
              {tacticalGateways.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mesh Nodes</span>
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {meshNodes.filter(n => n.status === 'ACTIVE').length}{' '}
            <span className="text-xs font-semibold text-emerald-600 font-sans">
              / {meshNodes.length} Online
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% FIPS 140-3 Validated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active RF Links</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {meshLinks.filter(l => l.status === 'OPTIMAL').length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">
              / {meshLinks.length} Links
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Avg Latency: 12ms</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>RF Spectrum Band</span>
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            2,240 <span className="text-xs font-normal text-slate-500 font-sans">MHz</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">S-Band MIMO (10 MHz BW)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mission Profile</span>
            <Shield className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono truncate">
            {activeProfile.missionCode}
          </div>
          <div className="text-[10px] text-teal-600 font-medium mt-0.5">QoS: Voice Priority 1</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Primary Gateway</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            SATCOM <span className="text-xs font-semibold text-emerald-600 font-sans">184M</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Starlink HP Flat Uplink</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>OTAR Key Epoch</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            AES-256
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Next Rekey: 8h 14m</div>
        </div>
      </div>


      {/* TAB 1: MESH TOPOLOGY CONSOLE */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visual Topology Canvas */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-slate-950 border-slate-800 overflow-hidden relative">
              {/* Top Controls Overlay */}
              <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 pointer-events-auto flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium">Topology Status:</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    SELF-FORMING / OPTIMAL (7 NODES)
                  </span>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-300 pointer-events-auto flex items-center gap-2 text-[11px] font-mono text-slate-600">
                  <span>FREQ: 2,240 MHz</span>
                  <span>|</span>
                  <span className="text-teal-300">CHANNEL: MIMO S-BAND</span>
                </div>
              </div>

              {/* Topology Canvas */}
              <div className="w-full h-[560px] bg-[#070d18] relative p-6 flex items-center justify-center overflow-hidden">
                {/* Radial Grid Circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-[520px] h-[520px] rounded-full border border-blue-500/30 flex items-center justify-center">
                    <div className="w-[360px] h-[360px] rounded-full border border-teal-500/30 flex items-center justify-center">
                      <div className="w-[200px] h-[200px] rounded-full border border-cyan-500/30" />
                    </div>
                  </div>
                </div>

                {/* SVG Visual Mesh Link Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Gateway Alpha to Relay 02 */}
                  <line x1="50%" y1="50%" x2="70%" y2="28%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                  {/* Gateway Alpha to UAS 03 */}
                  <line x1="50%" y1="50%" x2="28%" y2="25%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                  {/* Gateway Alpha to Veh 04 */}
                  <line x1="50%" y1="50%" x2="28%" y2="68%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                  {/* Relay 02 to Foot 05 */}
                  <line x1="70%" y1="28%" x2="82%" y2="52%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                  {/* Relay 02 to K9 06 */}
                  <line x1="70%" y1="28%" x2="80%" y2="78%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                  {/* Foot 05 to Sub 07 (Degraded Link) */}
                  <line x1="82%" y1="52%" x2="52%" y2="82%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2" />
                </svg>

                {/* Center Node: Gateway Alpha */}
                <button
                  onClick={() => setSelectedNodeId('node-gw-01')}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`relative flex items-center justify-center transition-transform group-hover:scale-110 ${selectedNodeId === 'node-gw-01' ? 'scale-110 ring-4 ring-blue-500/50 rounded-2xl' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 border-2 border-white text-white flex flex-col items-center justify-center shadow-xl">
                      <Server className="w-6 h-6 mb-0.5" />
                      <span className="text-[9px] font-mono font-bold">MN-GW-01</span>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[10px] font-mono rounded shadow border border-blue-500/50 whitespace-nowrap">
                    Command Gateway (Starlink)
                  </div>
                </button>

                {/* Node: Relay 02 */}
                <button
                  onClick={() => setSelectedNodeId('node-relay-02')}
                  style={{ top: '28%', left: '70%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-teal-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-relay-02' ? 'scale-110 ring-4 ring-teal-500/50' : ''}`}>
                    <Radio className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">RL-02</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-teal-500/50 whitespace-nowrap">
                    Vault Mast Relay
                  </div>
                </button>

                {/* Node: Airborne UAS 03 */}
                <button
                  onClick={() => setSelectedNodeId('node-uas-03')}
                  style={{ top: '25%', left: '28%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-cyan-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-uas-03' ? 'scale-110 ring-4 ring-cyan-500/50' : ''}`}>
                    <Compass className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">AIR-03</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-cyan-500/50 whitespace-nowrap">
                    UAS Airborne Relay (140ft)
                  </div>
                </button>

                {/* Node: Veh 04 */}
                <button
                  onClick={() => setSelectedNodeId('node-veh-04')}
                  style={{ top: '68%', left: '28%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-blue-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-veh-04' ? 'scale-110 ring-4 ring-blue-500/50' : ''}`}>
                    <Cpu className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">VEH-04</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-blue-500/50 whitespace-nowrap">
                    Patrol 402 Vehicle
                  </div>
                </button>

                {/* Node: Foot 05 */}
                <button
                  onClick={() => setSelectedNodeId('node-foot-05')}
                  style={{ top: '52%', left: '82%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-indigo-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-foot-05' ? 'scale-110 ring-4 ring-indigo-500/50' : ''}`}>
                    <Radio className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">DISP-05</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-indigo-500/50 whitespace-nowrap">
                    Echo-1 Body-Worn
                  </div>
                </button>

                {/* Node: K9 06 */}
                <button
                  onClick={() => setSelectedNodeId('node-k9-06')}
                  style={{ top: '78%', left: '80%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-teal-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-k9-06' ? 'scale-110 ring-4 ring-teal-500/50' : ''}`}>
                    <Cpu className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">K9-06</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-teal-500/50 whitespace-nowrap">
                    K9 Alpha Harness Scout
                  </div>
                </button>

                {/* Node: Sub 07 (Degraded) */}
                <button
                  onClick={() => setSelectedNodeId('node-sub-07')}
                  style={{ top: '82%', left: '52%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl bg-amber-600 border border-white text-white flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${selectedNodeId === 'node-sub-07' ? 'scale-110 ring-4 ring-amber-500/50' : ''}`}>
                    <Radio className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold">SUB-07</span>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white text-white text-[9px] font-mono rounded shadow border border-amber-500/50 whitespace-nowrap">
                    Sub-Vault Repeater (Degraded)
                  </div>
                </button>

                {/* Bottom HUD Bar */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono text-teal-300 flex items-center gap-4 pointer-events-auto">
                    <span>TOPOLOGY: 6 ACTIVE LINKS</span>
                    <span>QOS: VOICE PRIORITY (CLASS 1)</span>
                    <span>MAX HOPS: 4</span>
                  </div>

                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono text-slate-600 flex items-center gap-3 pointer-events-auto">
                    <span className="text-emerald-400 font-bold">FIPS 140-3 VALIDATED</span>
                    <span>OTAR RE-KEY: 12H EPOCH</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel: Selected Node Inspector Drawer */}
          <div className="space-y-4">
            {selectedNode && (
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-white">{selectedNode.name}</CardTitle>
                        <div className="text-[11px] font-mono text-slate-500">{selectedNode.nodeCode}</div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedNode.status === 'ACTIVE'
                          ? 'nominal'
                          : selectedNode.status === 'DEGRADED'
                          ? 'warning'
                          : 'critical'
                      }
                    >
                      {selectedNode.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Hardware Model:</span>
                      <span className="font-mono text-white text-right">{selectedNode.model}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mesh Role:</span>
                      <span className="font-mono text-teal-300">{selectedNode.role}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">IP / MAC Address:</span>
                      <div className="font-mono text-right text-white">
                        <div>{selectedNode.ipAddress}</div>
                        <div className="text-[10px] text-slate-500">{selectedNode.macAddress}</div>
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">RF Signal &amp; SNR:</span>
                      <span className="font-mono text-emerald-400">{selectedNode.snrDb} dB SNR</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Transmit Power &amp; Hop:</span>
                      <span className="font-mono text-white">{selectedNode.txPowerWatts}W ({selectedNode.hopCount} Hops)</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Battery Level:</span>
                      <span className={`font-mono ${selectedNode.batteryPct < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedNode.batteryPct}%
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">FIPS Cryptographic Core:</span>
                      <span className="font-mono text-emerald-400">
                        {selectedNode.fipsValidated ? 'VALIDATED (140-3)' : 'UNVERIFIED'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Gateway Uplink:</span>
                      <span className="font-mono text-blue-300">{selectedNode.gatewayUplink || 'NONE'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {selectedNode.status === 'QUARANTINED' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full text-xs"
                        onClick={() => reinstateMeshNode(selectedNode.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Reinstate Node
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs text-amber-300 border-amber-500/40 hover:bg-amber-950/30"
                        onClick={() => {
                          setQuarantineTargetNode(selectedNode)
                          setIsQuarantineModalOpen(true)
                        }}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        Quarantine Node
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full text-xs"
                      onClick={() => {
                        setZeroizeTargetNode(selectedNode)
                        setIsZeroizeModalOpen(true)
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Zeroize Cryptographic Keys
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Link Status Card */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Link Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {meshLinks.slice(0, 3).map(link => (
                  <div
                    key={link.id}
                    className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-white text-[11px]">
                        {link.sourceNodeId} ↔ {link.targetNodeId}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {link.throughputMbps} Mbps | {link.latencyMs}ms | {link.snrDb} dB SNR
                      </div>
                    </div>
                    <Badge variant={link.status === 'OPTIMAL' ? 'nominal' : 'warning'}>
                      {link.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: NODE ENROLLMENT & POSTURE */}
      {activeTab === 'enrollment' && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={nodeSearchQuery}
                    onChange={e => setNodeSearchQuery(e.target.value)}
                    placeholder="Search nodes by code, model, or IP..."
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Role:</span>
                  <select
                    value={nodeRoleFilter}
                    onChange={e => setNodeRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="GATEWAY">Gateway</option>
                    <option value="RELAY">Relay</option>
                    <option value="AIRBORNE_RELAY">Airborne Relay</option>
                    <option value="ENDPOINT">Endpoint</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Enroll New Node
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Node Registry Table */}
          <Card className="bg-white border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Node Code &amp; Name</th>
                    <th className="py-3 px-4">Hardware Model</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Network IP / MAC</th>
                    <th className="py-3 px-4">Battery</th>
                    <th className="py-3 px-4">SNR / Hops</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {filteredNodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{node.nodeCode}</div>
                        <div className="text-[11px] font-sans text-slate-500">{node.name}</div>
                      </td>
                      <td className="py-3 px-4 text-white font-sans">{node.model}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                          {node.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{node.ipAddress}</div>
                        <div className="text-[10px] text-slate-400">{node.macAddress}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={node.batteryPct < 25 ? 'text-red-400' : 'text-emerald-400'}>
                          {node.batteryPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-emerald-400">{node.snrDb} dB</span> / {node.hopCount} hops
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            node.status === 'ACTIVE'
                              ? 'nominal'
                              : node.status === 'DEGRADED'
                              ? 'warning'
                              : 'critical'
                          }
                        >
                          {node.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {node.status === 'QUARANTINED' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs"
                              onClick={() => reinstateMeshNode(node.id)}
                            >
                              Reinstate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-amber-300 border-amber-500/40 hover:bg-amber-950/30"
                              onClick={() => {
                                setQuarantineTargetNode(node)
                                setIsQuarantineModalOpen(true)
                              }}
                            >
                              Quarantine
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => {
                              setZeroizeTargetNode(node)
                              setIsZeroizeModalOpen(true)
                            }}
                          >
                            Zeroize
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: MISSION NETWORK PROFILES */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Tactical Mission Network Profiles</h2>
              <p className="text-xs text-slate-500">
                RF frequency allocations, QoS priority queues, bandwidth allocation, and multi-hop limits.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateProfileModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missionProfiles.map(prof => (
              <Card
                key={prof.id}
                className={`bg-white border transition-all ${
                  prof.active ? 'border-teal-500 shadow-md ring-1 ring-teal-500/30' : 'border-slate-200'
                }`}
              >
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-white">{prof.profileName}</CardTitle>
                      <div className="text-[11px] font-mono text-slate-500">{prof.missionCode}</div>
                    </div>
                    <Badge variant={prof.active ? 'nominal' : 'neutral'}>
                      {prof.active ? 'ACTIVE PROFILE' : 'STANDBY'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">RF Band &amp; Channel</span>
                      <span className="font-mono text-cyan-300">{prof.rfBand}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Bandwidth &amp; Max Hops</span>
                      <span className="font-mono text-white">
                        {prof.bandwidthMhz} MHz / {prof.maxHops} Hops
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">QoS Priority Queue</span>
                      <span className="font-mono text-teal-300">{prof.qosPriorityClass}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Rekey Epoch</span>
                      <span className="font-mono text-amber-300">{prof.keyRotationEpochHours} Hours</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant={prof.active ? 'outline' : 'primary'}
                      className="w-full text-xs"
                      onClick={() => activateMissionProfile(prof.id)}
                    >
                      {prof.active ? 'Re-Apply Profile to Mesh' : 'Activate Mission Profile'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LINK MONITOR & RF TELEMETRY */}
      {activeTab === 'link-monitor' && (
        <div className="space-y-6">
          {/* RF Spectrum Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>RF Noise Floor</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">-102 dBm</div>
                <div className="text-[11px] text-slate-500">RF Environment Clean</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Channel Utilization</span>
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-xl font-bold font-mono text-blue-300">42.4%</div>
                <div className="text-[11px] text-slate-500">Capacity Nominal</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Packet Delivery Ratio</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-xl font-bold font-mono text-teal-300">99.2%</div>
                <div className="text-[11px] text-slate-500">0.8% Aggregate Loss</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Jamming / EW Alert</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">CLEAR</div>
                <div className="text-[11px] text-slate-500">No EW Detected</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Link Matrix Table */}
          <Card className="bg-white border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200">
              <CardTitle className="text-sm font-bold text-white">Active Point-to-Point Mesh Links</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono">
                  <tr>
                    <th className="py-3 px-4">Link Endpoint Pair</th>
                    <th className="py-3 px-4">Throughput</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">RSSI / SNR</th>
                    <th className="py-3 px-4">Packet Loss</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right font-sans">Simulate Break</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {meshLinks.map(link => (
                    <tr key={link.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {link.sourceNodeId} <span className="text-teal-400">↔</span> {link.targetNodeId}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">{link.throughputMbps} Mbps</td>
                      <td className="py-3 px-4 text-white">{link.latencyMs} ms</td>
                      <td className="py-3 px-4 text-slate-600">
                        {link.rssiDbm} dBm / <span className="text-teal-300">{link.snrDb} dB SNR</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={link.packetLossPct > 2 ? 'text-amber-400' : 'text-slate-600'}>
                          {link.packetLossPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            link.status === 'OPTIMAL'
                              ? 'nominal'
                              : link.status === 'DEGRADED'
                              ? 'warning'
                              : 'critical'
                          }
                        >
                          {link.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => simulateLinkBreak(link.id)}
                        >
                          {link.status === 'DOWN' ? 'Restore Link' : 'Break Link'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: SECURITY & ZEROIZATION */}
      {activeTab === 'security-events' && (
        <div className="space-y-6">
          {/* Key Management Header Banner */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    FIPS 140-3 Zero-Trust Cryptographic Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mutual X.509 device admission, over-the-air re-keying (OTAR), and instantaneous cryptographic zeroization protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsFleetZeroizeModalOpen(true)}
                  className="text-xs font-bold"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Emergency Fleet Zeroize
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Events Stream Table */}
          <Card className="bg-white border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white">FIPS Cryptographic Audit Stream</CardTitle>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={e => setEventSearchQuery(e.target.value)}
                  placeholder="Filter security events..."
                  className="w-full bg-white border border-slate-200 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Node Target</th>
                    <th className="py-3 px-4">Audit Details</th>
                    <th className="py-3 px-4 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {filteredEvents.map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-teal-300 font-bold text-[10px]">
                          {evt.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-sans">{evt.nodeName}</td>
                      <td className="py-3 px-4 text-slate-600 font-sans max-w-lg">{evt.details}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={
                            evt.severity === 'CRITICAL'
                              ? 'critical'
                              : evt.severity === 'HIGH' || evt.severity === 'MEDIUM'
                              ? 'warning'
                              : 'nominal'
                          }
                        >
                          {evt.severity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: TACTICAL GATEWAYS & BRIDGES */}
      {activeTab === 'gateways' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Tactical Gateways &amp; Enterprise Backbone Bridges</h2>
              <p className="text-xs text-slate-500">
                Secure bridging between ad-hoc local mesh nodes and enterprise SATCOM, FirstNet, P25 ISSI, and ATAK CoT infrastructure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tacticalGateways.map(gw => (
              <Card key={gw.id} className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-white">{gw.name}</CardTitle>
                        <div className="text-[11px] font-mono text-slate-500">{gw.gatewayType}</div>
                      </div>
                    </div>
                    <Badge variant={gw.status === 'CONNECTED' ? 'nominal' : 'warning'}>
                      {gw.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Gateway IP</span>
                      <span className="font-mono text-white">{gw.ipAddress}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Throughput / Latency</span>
                      <span className="font-mono text-emerald-400">
                        {gw.throughputMbps} Mbps / {gw.latencyMs}ms
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Connected Mesh Clients</span>
                      <span className="font-mono text-teal-300">{gw.activeMeshClients} Nodes</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Auto Failover Policy</span>
                      <span className="font-mono text-white">
                        {gw.autoFailover ? 'ENGAGED' : 'MANUAL'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => toggleGatewayFailover(gw.id)}
                    >
                      {gw.status === 'CONNECTED' ? 'Simulate Gateway Outage' : 'Restore Uplink Connection'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Enroll Mesh Node */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Tactical Mesh Node"
        maxWidth="md"
      >
        <form onSubmit={handleEnrollNode} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Node Code</label>
            <Input
              type="text"
              value={newNodeCode}
              onChange={e => setNewNodeCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Node Name</label>
            <Input
              type="text"
              value={newNodeName}
              onChange={e => setNewNodeName(e.target.value)}
              placeholder="e.g. Tactical Team Bravo-2 Wearable"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Hardware Model</label>
              <Select
                value={newNodeModel}
                onChange={e => setNewNodeModel(e.target.value)}
              >
                <option value="Silvus StreamCaster SC4400E">Silvus StreamCaster SC4400E</option>
                <option value="Persistent Systems MPU5 Smart Radio">Persistent Systems MPU5</option>
                <option value="TrellisWare TW-950 TSM Shadow">TrellisWare TW-950 TSM</option>
                <option value="Silvus SC4200P Micro MIMO">Silvus SC4200P Micro</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Mesh Role</label>
              <Select
                value={newNodeRole}
                onChange={e => setNewNodeRole(e.target.value as any)}
              >
                <option value="ENDPOINT">ENDPOINT (Mobile Body/Veh)</option>
                <option value="RELAY">RELAY (Fixed / Standalone)</option>
                <option value="AIRBORNE_RELAY">AIRBORNE_RELAY (UAS Drone)</option>
                <option value="GATEWAY">GATEWAY (Backbone Uplink)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Static IP Address</label>
              <Input
                type="text"
                value={newNodeIp}
                onChange={e => setNewNodeIp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">MAC Address</label>
              <Input
                type="text"
                value={newNodeMac}
                onChange={e => setNewNodeMac(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Enroll &amp; Authorize Node
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Quarantine Node */}
      <Modal
        isOpen={isQuarantineModalOpen}
        onClose={() => setIsQuarantineModalOpen(false)}
        title={`Quarantine Mesh Node: ${quarantineTargetNode?.nodeCode || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmQuarantine} className="space-y-4">
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded text-xs text-amber-200">
            Quarantining this node will immediately revoke its active cryptographic mesh keys and sever all peer-to-peer RF links.
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Reason for Quarantine</label>
            <Input
              type="text"
              value={quarantineReason}
              onChange={e => setQuarantineReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQuarantineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" size="sm">
              Confirm Quarantine
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Emergency Zeroize Node */}
      <Modal
        isOpen={isZeroizeModalOpen}
        onClose={() => setIsZeroizeModalOpen(false)}
        title={`EMERGENCY ZEROIZE: ${zeroizeTargetNode?.nodeCode || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded text-xs text-red-200">
            <strong>CRITICAL FIPS 140-3 ZEROIZATION:</strong> This command will purge all traffic encryption keys (TEK), key encryption keys (KEK), and private certificates stored on the device flash storage. This action cannot be undone over-the-air.
          </div>

          <p className="text-xs text-slate-600">
            Are you certain you wish to zeroize node <strong className="text-white">{zeroizeTargetNode?.nodeCode}</strong> ({zeroizeTargetNode?.name})?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsZeroizeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmZeroize}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Execute Zeroization
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Emergency Fleet Zeroize */}
      <Modal
        isOpen={isFleetZeroizeModalOpen}
        onClose={() => setIsFleetZeroizeModalOpen(false)}
        title="DANGER: FLEET-WIDE CRYPTOGRAPHIC ZEROIZATION"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded text-xs text-red-200 font-mono leading-relaxed">
            CRITICAL EMERGENCY PROTOCOL: This action broadcasts an unrecoverable zeroize broadcast signal across all 7 deployable mesh nodes. All tactical communications will instantly terminate and require depot-level physical re-keying.
          </div>

          <p className="text-xs text-slate-600">
            Confirm Watch Commander / SOC authorization to collapse and wipe the tactical mesh network.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFleetZeroizeModalOpen(false)}
            >
              Abort Protocol
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmFleetZeroize}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              CONFIRM FLEET ZEROIZATION
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Create Mission Profile */}
      <Modal
        isOpen={isCreateProfileModalOpen}
        onClose={() => setIsCreateProfileModalOpen(false)}
        title="Create Tactical Mission Profile"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Profile Name</label>
            <Input
              type="text"
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              placeholder="e.g. NCR Rapid Reaction Mesh"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Mission Code</label>
            <Input
              type="text"
              value={newProfileMissionCode}
              onChange={e => setNewProfileMissionCode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">RF Band</label>
              <Select
                value={newProfileBand}
                onChange={e => setNewProfileBand(e.target.value as any)}
              >
                <option value="S-BAND (2200-2400 MHz)">S-BAND (2200-2400 MHz)</option>
                <option value="L-BAND (1350-1390 MHz)">L-BAND (1350-1390 MHz)</option>
                <option value="UHF (450-470 MHz)">UHF (450-470 MHz)</option>
                <option value="C-BAND (4.4-4.9 GHz Public Safety)">C-BAND (4.4-4.9 GHz Public Safety)</option>
                <option value="ISM (902-928 MHz)">ISM (902-928 MHz)</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Channel Bandwidth (MHz)</label>
              <Select
                value={newProfileBw.toString()}
                onChange={e => setNewProfileBw(parseFloat(e.target.value))}
              >
                <option value="1.25">1.25 MHz</option>
                <option value="2.5">2.5 MHz</option>
                <option value="5">5.0 MHz</option>
                <option value="10">10.0 MHz</option>
                <option value="20">20.0 MHz</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">QoS Priority Queue</label>
            <Select
              value={newProfileQos}
              onChange={e => setNewProfileQos(e.target.value as any)}
            >
              <option value="VOICE_CRITICAL_CLASS_1">Class 1: Tactical Voice PTT Priority</option>
              <option value="TELEMETRY_ATAK_CLASS_2">Class 2: Telemetry &amp; ATAK CoT</option>
              <option value="VIDEO_STREAM_CLASS_3">Class 3: Video Streaming &amp; ISR</option>
              <option value="BULK_SYNC_CLASS_4">Class 4: Background File &amp; Database Sync</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateProfileModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Mission Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
