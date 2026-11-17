import React, { useState } from 'react'
import {
  Network,
  Radio,
  RadioTower,
  Shield,
  ShieldCheck,
  Link,
  Layers,
  Activity,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Sliders,
  Zap,
  Server,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CriticalConnectBridgeSession } from '../../types/modules'

export type CCTab = 'bridges' | 'rules' | 'issi' | 'broadband' | 'create' | 'audit'

export const CriticalConnectPage: React.FC = () => {
  const {
    criticalConnectBridges,
    interAgencyRules,
    auditLogs,
    toggleCriticalConnectBridge,
    createCriticalConnectBridge,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<CCTab>('bridges')
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>('cc-bridge-01')

  // New Bridge Form State
  const [bridgeId, setBridgeId] = useState(`CC-ISSI-${Math.floor(1000 + Math.random() * 9000)}`)
  const [bridgeName, setBridgeName] = useState('FPS Sector 2 to US Capitol Police Tactical Link')
  const [localAgency, setLocalAgency] = useState('Federal Protective Service (FPS)')
  const [localTalkgroup, setLocalTalkgroup] = useState('FPS TAC-2 (TGID 1043)')
  const [partnerAgency, setPartnerAgency] = useState('US Capitol Police (USCP)')
  const [partnerSystem, setPartnerSystem] = useState('USCP Capitol Hill P25 Trunk')
  const [partnerTalkgroup, setPartnerTalkgroup] = useState('CAPITOL-VIP-1 (TGID 5012)')
  const [linkType, setLinkType] = useState<CriticalConnectBridgeSession['linkType']>('ISSI_P25')
  const [encryptionMode, setEncryptionMode] = useState<CriticalConnectBridgeSession['encryptionMode']>('END_TO_END_AES256')

  const ccAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('CRITICAL_CONNECT_') || a.targetEntity === 'CriticalConnectBridgeSession'
  )

  const selectedBridge = criticalConnectBridges.find((b) => b.id === selectedBridgeId) || criticalConnectBridges[0]

  const totalBridges = criticalConnectBridges.length
  const activeBridges = criticalConnectBridges.filter((b) => b.status === 'PATCH_ACTIVE').length
  const activeTalkers = criticalConnectBridges.reduce((acc, b) => acc + b.activeTalkersCount, 0)
  const avgLatency = Math.round(
    criticalConnectBridges.reduce((acc, b) => acc + b.packetLatencyMs, 0) / (totalBridges || 1)
  )

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Mission App 16 // INTEROP-BRIDGE
                </span>
                <span className="text-xs text-slate-400">TIA-102 ISSI / CSSI / 3GPP MCX FirstNet</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Cloud Interop Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Critical Connect Interoperability Gateway
              </h1>
              <p className="text-xs text-slate-400">
                Cloud-to-Cloud Inter-Agency PTT Routing • P25 to FirstNet Broadband Bridges • Cross-Agency Dynamic Encryption
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
                  title: 'Interop Gateways Polled',
                  message: 'All 3 cloud ISSI/CSSI cross-domain session border controllers verified active',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Gateways</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab('create')
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Patch</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bridges')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bridges'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interop Patch Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
              {criticalConnectBridges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Talkgroup Translation Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('issi')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'issi'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>P25 ISSI / CSSI Trunks</span>
          </button>

          <button
            onClick={() => setActiveTab('broadband')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'broadband'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>FirstNet / Broadband Push-To-Talk</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Cross-Agency Patch</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Interop Bridge Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inter-Agency Bridges</span>
            <Network className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {activeBridges} <span className="text-xs font-normal text-slate-500">/ {totalBridges} Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ISSI / CSSI Cloud Patches</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active PTT Sessions</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{activeTalkers} Live</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">FirstNet + P25 Cross-Call</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Participating Agencies</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">
            4 Fed / Local
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">USSS, FBI, MPD, Park Police</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Network Latency</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">18ms Avg</div>
          <div className="text-[10px] text-slate-500 mt-0.5">SLA Target &lt; 50ms (3GPP MCX)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Cross-Encryption Gateway</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">AES-256 OTAR</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Hardware Cryptographic Relay</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Critical Connect Gateway</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">NOMINAL</div>
          <div className="text-[10px] text-slate-500 mt-0.5">FedRAMP In-Process Core</div>
        </div>
      </div>


{/* Screen 1: Active Interop Bridges */}
      {activeTab === 'bridges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalConnectBridges.map((bridge) => {
              const isSelected = bridge.id === selectedBridgeId
              const isActive = bridge.status === 'PATCH_ACTIVE'

              return (
                <div
                  key={bridge.id}
                  onClick={() => setSelectedBridgeId(bridge.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-indigo-500/80 ring-1 ring-indigo-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">{bridge.bridgeId}</span>
                      <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{bridge.bridgeName}</h4>
                      <p className="text-[10px] text-slate-500">Type: {bridge.linkType.replace(/_/g, ' ')}</p>
                    </div>

                    <Badge variant={isActive ? 'nominal' : 'outline'}>
                      {bridge.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded bg-background/50 border border-slate-200/50 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Local TG:</span>
                      <span className="text-emerald-400 font-bold">{bridge.localTalkgroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Partner TG:</span>
                      <span className="text-purple-400 font-bold">{bridge.partnerTalkgroup}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">Latency / Jitter</span>
                      <span className="text-blue-400 font-bold">{bridge.packetLatencyMs}ms • {bridge.jitterMs}ms</span>
                    </div>

                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">Encryption</span>
                      <span className="text-slate-900 font-bold">{bridge.encryptionMode.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant={isActive ? 'destructive' : 'primary'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCriticalConnectBridge(bridge.id)
                      }}
                    >
                      {isActive ? 'Suspend Bridge' : 'Engage Patch'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToast({
                          title: `SIP Session Inspected: ${bridge.bridgeId}`,
                          message: `SDP negotiation nominal • FIPS 140-3 SRTP keys synchronized with partner core`,
                          type: 'info',
                        })
                      }}
                    >
                      SIP Ping
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Multi-Agency MOUs & Governance */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Inter-Agency Interoperability MOUs & Mutual Governance Rules
            </h3>
            <p className="text-xs text-slate-500">
              Formal memorandums of understanding (MOUs) defining allowable talkgroups, time bounds, and cryptographic boundary authorizations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {interAgencyRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{rule.ruleName}</h4>
                      <p className="text-[11px] text-purple-400 font-mono mt-0.5">{rule.authorizedAgency}</p>
                    </div>
                    <Badge variant={rule.status === 'ACTIVE' ? 'nominal' : 'outline'}>{rule.status}</Badge>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <span className="text-[10px] text-slate-500 block">Allowed Talkgroup Vectors:</span>
                    <div className="flex flex-wrap gap-1">
                      {rule.allowedTalkgroups.map((tg, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-900">
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <span>Max Duration: {rule.maxDurationHours}h</span>
                    <span>Dual Approval: {rule.mutualApprovalRequired ? 'REQUIRED' : 'NO'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: TIA-102 ISSI / CSSI Telemetry */}
      {activeTab === 'issi' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">TIA-102.BACA Inter-Subsystem Interface (ISSI) Telemetry</h4>
              <p className="text-xs text-slate-500">SIP session call control, RTP audio transport, and mobility location management between disparate P25 cores</p>
            </div>
            <Badge variant="nominal">P25 Standard ISSI</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">SIP Signaling Port</span>
              <div className="text-emerald-400 font-bold">5060 TCP/TLS (FIPS 140-3)</div>
              <p className="text-[10px] text-slate-500">Session Border Controller Active</p>
            </div>

            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Audio Transcoding Vocoder</span>
              <div className="text-emerald-400 font-bold">IMBE / AMBE+2 Pass-Through</div>
              <p className="text-[10px] text-slate-500">Zero loss native P25 vocoder stream</p>
            </div>

            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Mobility Home Agent (HA)</span>
              <div className="text-emerald-400 font-bold">Roaming Handshake &lt; 85ms</div>
              <p className="text-[10px] text-slate-500">Inter-agency subscriber validation</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: FirstNet LMR-to-Broadband PTT */}
      {activeTab === 'broadband' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            FirstNet Band 14 Mission Critical Push-to-Talk (MCPTT) Bridge
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bridges land mobile radio (LMR) P25 Phase 2 subscriber talkgroups directly into 3GPP Release 15 compliant FirstNet smartphone clients. Officers using Samsung Galaxy Tactical Edition or iPhone can speak directly to tactical officers carrying APX radios with sub-100ms mouth-to-ear latency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-background/60 border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900">Broadband Quality of Service (QoS)</span>
              <p className="text-[11px] text-slate-500">FirstNet QCI 6 / QCI 7 mission critical priority preemption.</p>
              <div className="text-[10px] text-emerald-400 font-mono">PRIORITY: PREEMPTIVE BAND 14</div>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900">Encryption Transcoder Module</span>
              <p className="text-[11px] text-slate-500">Transcodes P25 OTAR keys to WebRTC SRTP FIPS keystores.</p>
              <div className="text-[10px] text-emerald-400 font-mono">STATUS: AES-256-GCM HARDWARE</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: Provision Interop Patch */}
      {activeTab === 'create' && (
        <div className="p-5 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Provision Dynamic Inter-Agency Interop Bridge</h4>
              <p className="text-xs text-slate-500">Establish authenticated ISSI, CSSI, or FirstNet broadband cross-domain patch</p>
            </div>
            <Badge variant="nominal">Secure Interop Wizard</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Bridge Identifier</label>
              <input
                type="text"
                value={bridgeId}
                onChange={(e) => setBridgeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Bridge Title / Description</label>
              <input
                type="text"
                value={bridgeName}
                onChange={(e) => setBridgeName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Local Agency & Talkgroup</label>
              <input
                type="text"
                value={localTalkgroup}
                onChange={(e) => setLocalTalkgroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Partner Agency & Talkgroup</label>
              <input
                type="text"
                value={partnerTalkgroup}
                onChange={(e) => setPartnerTalkgroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Interface Link Type</label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as CriticalConnectBridgeSession['linkType'])}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
              >
                <option value="ISSI_P25">TIA-102 ISSI P25 Core-to-Core</option>
                <option value="CSSI_CONSOLE">TIA-102 CSSI Dispatch Console Interface</option>
                <option value="BROADBAND_PTT_FIRSTNET">FirstNet Broadband Push-to-Talk</option>
                <option value="MCX_3GPP">3GPP Mission Critical Interop</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Encryption Mode</label>
              <select
                value={encryptionMode}
                onChange={(e) => setEncryptionMode(e.target.value as CriticalConnectBridgeSession['encryptionMode'])}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
              >
                <option value="END_TO_END_AES256">End-to-End AES-256 (P25 OTAR Key Agreement)</option>
                <option value="TRANSCODED_SECURE">Transcoded FIPS 140-3 Hardware Boundary</option>
                <option value="CLEARTEXT_INTEROP">Cleartext Mutual Aid Interop Channel</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              createCriticalConnectBridge({
                bridgeId,
                bridgeName,
                localAgency,
                localTalkgroup,
                partnerAgency,
                partnerSystem,
                partnerTalkgroup,
                linkType,
                encryptionMode,
                activeTalkersCount: 1,
                packetLatencyMs: 42,
                jitterMs: 5,
                status: 'PATCH_ACTIVE',
              })
              setActiveTab('bridges')
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Provision & Engage Bridge
          </Button>
        </div>
      )}

      {/* Screen 6: Governance Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Critical Connect Interoperability Audit Ledger ({ccAuditLogs.length} Events)
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
                {ccAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 text-slate-900 font-sans font-medium">{log.actor}</td>
                    <td className="px-3 py-2 text-slate-500">{log.actorRole}</td>
                    <td className="px-3 py-2 text-purple-400 font-bold">{log.action}</td>
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
      )}
    </div>
  )
}
export default CriticalConnectPage
