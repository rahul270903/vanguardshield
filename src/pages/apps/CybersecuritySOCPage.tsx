import React, { useState } from 'react'
import {
  ShieldAlert,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Terminal,
  Server,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Sliders,
  FileText,
  Zap,
  Cpu,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CyberThreatEvent } from '../../types/modules'

export type SOCTab = 'threats' | 'sensors' | 'mitre' | 'containment' | 'vulns' | 'audit'

export const CybersecuritySOCPage: React.FC = () => {
  const {
    cyberThreats,
    cyberPhysicalSensors,
    auditLogs,
    executeCyberContainment,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<SOCTab>('threats')
  const [selectedThreatId, setSelectedThreatId] = useState<string>('threat-01')
  const [searchQuery, setSearchQuery] = useState('')

  const socAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('CYBER_') || a.targetEntity === 'CyberThreatEvent'
  )

  const selectedThreat = cyberThreats.find((t) => t.id === selectedThreatId) || cyberThreats[0]

  const filteredThreats = cyberThreats.filter((t) => {
    return (
      t.eventCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceIp.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalThreats = cyberThreats.length
  const criticalThreats = cyberThreats.filter((t) => t.severity === 'CRITICAL').length
  const containedCount = cyberThreats.filter((t) => t.status === 'CONTAINED' || t.status === 'RESOLVED').length
  const normalSensors = cyberPhysicalSensors.filter((s) => s.status === 'NORMAL').length

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-900/60 text-rose-300 border border-rose-700/50">
                  Mission App 15 // CYBER-SOC
                </span>
                <span className="text-xs text-slate-400">FedRAMP High SIEM / NIST SP 800-53 r5</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SOC SIEM Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Cybersecurity SOC &amp; Cyber-Physical Defense
              </h1>
              <p className="text-xs text-slate-400">
                Unified IT/OT/RF Threat Monitoring • Automated Containment Playbooks • Cyber-Physical Building Automation Sensors
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
                  title: 'SOC Threat Feeds Polled',
                  message: 'All SIEM, OT Modbus sensors, and WAF rate limiters verified nominal',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Threat Grid</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActiveTab('containment')
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Containment Center</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'threats'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SIEM Threat Console</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
              {cyberThreats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sensors'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>OT / Cyber-Physical Sensors</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
              {cyberPhysicalSensors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mitre')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'mitre'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>MITRE ATT&amp;CK Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('containment')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'containment'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Automated Containment</span>
          </button>

          <button
            onClick={() => setActiveTab('vulns')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'vulns'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CVE &amp; Patch Governance</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SOC Incident Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Threats</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono">{totalThreats} Events</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Correlated by FedRAMP SIEM</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Critical Severity</span>
            <Zap className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-600 font-mono">{criticalThreats} Priority 1</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5">Immediate Triage Armed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Contained / Mitigated</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {containedCount} <span className="text-xs font-normal text-slate-500">/ {totalThreats}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Automated SOAR Execution</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Cyber-Physical Sensors</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">
            {normalSensors} <span className="text-xs font-normal text-slate-500">/ {cyberPhysicalSensors.length} Normal</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">BACnet / Modbus Grid Sentry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Zero Trust Architecture</span>
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">NIST 800-207</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Continuous Micro-Segmentation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>SOC Readiness Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">NOMINAL</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">24/7 Watch Desk Armed</div>
        </div>
      </div>


{/* Screen 1: SIEM Threat Console */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search event code, IP, asset, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
              }}
            >
              Clear Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredThreats.map((threat) => {
              const isSelected = threat.id === selectedThreatId
              const isContained = threat.status === 'CONTAINED' || threat.status === 'RESOLVED'

              return (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreatId(threat.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-rose-500/80 ring-1 ring-rose-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{threat.eventCode}</span>
                        <Badge variant={threat.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                          {threat.severity}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{threat.category.replace(/_/g, ' ')}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Src: {threat.sourceIp}</p>
                    </div>

                    <Badge variant={isContained ? 'nominal' : 'critical'}>
                      {threat.status}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded bg-background/50 border border-slate-200/50 text-xs font-mono space-y-1">
                    <div className="text-[10px] text-slate-500">Target Asset</div>
                    <div className="text-slate-900 font-semibold">{threat.targetAsset}</div>
                  </div>

                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-emerald-400 truncate">
                    &gt; {threat.rawLogSnippet}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <span>MITRE: {threat.mitreTactic}</span>
                    <span>Confidence: {threat.confidenceScorePct}%</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant={isContained ? 'outline' : 'destructive'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        executeCyberContainment(threat.id, 'ISOLATE_HOST')
                      }}
                    >
                      {isContained ? 'Review Action' : 'Execute Containment'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        executeCyberContainment(threat.id, 'BLOCK_IP')
                      }}
                    >
                      Block IP
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Cyber-Physical Sensors (OT/ICS) */}
      {activeTab === 'sensors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Cyber-Physical & Building Automation SCADA Sensor Network
            </h3>
            <p className="text-xs text-slate-500">
              Real-time telemetry from BACnet, Modbus-TCP, and dry contact portal tamper switches defending mission critical federal physical infrastructure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {cyberPhysicalSensors.map((sensor) => (
                <div key={sensor.id} className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">{sensor.sensorTag}</span>
                      <p className="text-[11px] text-slate-500">{sensor.facility}</p>
                    </div>
                    <Badge variant={sensor.status === 'NORMAL' ? 'nominal' : 'critical'}>
                      {sensor.status}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded bg-white border border-slate-200 text-xs font-mono space-y-1">
                    <div className="text-[10px] text-slate-500">Subsystem: {sensor.subsystem}</div>
                    <div className="text-emerald-400 font-bold">{sensor.currentReading}</div>
                    <div className="text-[10px] text-slate-500">Threshold: {sensor.thresholdLimit}</div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      addToast({
                        title: `Sensor Calibrated: ${sensor.sensorTag}`,
                        message: `Optocoupler baseline re-zeroed. Current reading within nominal limits.`,
                        type: 'info',
                      })
                    }}
                  >
                    Calibrate Sensor Loop
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: MITRE ATT&CK Matrix */}
      {activeTab === 'mitre' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">MITRE ATT&CK for Enterprise & ICS Defense Framework</h4>
              <p className="text-xs text-slate-500">Automated mapping of detected anomalous vectors against adversary tactics</p>
            </div>
            <Badge variant="nominal">MITRE v14 Mapped</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-rose-400">TA0108: Inhibit Response Function</span>
              <p className="text-[11px] text-slate-500 font-sans">Adversary attempts to manipulate SCADA cooling PLCs to trigger thermal shutdowns.</p>
              <div className="text-[10px] text-slate-900 font-bold">Technique T0836 / Modify Parameter</div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-amber-400">TA0006: Credential Access</span>
              <p className="text-[11px] text-slate-500 font-sans">Automated dictionary attack against PIV smart card mutual handshake listeners.</p>
              <div className="text-[10px] text-slate-900 font-bold">Technique T1110.004 / Stuffing</div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="font-bold text-purple-400">TA0001: RF Initial Access</span>
              <p className="text-[11px] text-slate-500 font-sans">Rogue transceiver broadcasting unauthorized TIA-102 unit registration frames.</p>
              <div className="text-[10px] text-slate-900 font-bold">Technique T0817 / Drive-by Radio</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Automated Containment Orchestrator */}
      {activeTab === 'containment' && (
        <div className="p-5 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                SOAR Automated Containment & Defensive Countermeasure Playbook
              </h4>
              <p className="text-xs text-slate-500">Select an active threat and immediately enforce network quarantine or credential revocation</p>
            </div>
            <Badge variant="critical">ACTIVE ENFORCEMENT</Badge>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-900 block">Select Threat for Immediate Action</label>
            <select
              value={selectedThreatId}
              onChange={(e) => setSelectedThreatId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
            >
              {cyberThreats.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.eventCode} — {t.category} [{t.severity}] on {t.targetAsset}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => {
                  executeCyberContainment(selectedThreatId, 'ISOLATE_HOST')
                }}
              >
                <Lock className="w-4 h-4 mr-1.5" />
                Isolate Host from Core Network
              </Button>

              <Button
                variant="outline"
                className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => {
                  executeCyberContainment(selectedThreatId, 'BLOCK_IP')
                }}
              >
                Block Source IP at Perimeter WAF
              </Button>

              <Button
                variant="outline"
                className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                onClick={() => {
                  executeCyberContainment(selectedThreatId, 'REVOKE_PIV')
                }}
              >
                Revoke PIV Authentication Token
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: CISA KEV Vulnerability Feed */}
      {activeTab === 'vulns' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">CISA Known Exploited Vulnerabilities (KEV) Catalog</h4>
              <p className="text-xs text-slate-500">Binding Operational Directive 22-01 mandatory remediation tracker for federal agencies</p>
            </div>
            <Badge variant="nominal">100% Patch Compliant</Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">CVE-2026-2189: Linux Kernel Netfilter Buffer Overflow</span>
                <p className="text-[10px] text-slate-500">Remediated via Kernel Patch 6.6.38 on all P25 base station controllers.</p>
              </div>
              <Badge variant="nominal">PATCHED</Badge>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">CVE-2026-1044: OpenSSL 3.2 AES-GCM Side-Channel Timing Vulnerability</span>
                <p className="text-[10px] text-slate-500">Updated to OpenSSL 3.2.2 FIPS validated cryptographic module.</p>
              </div>
              <Badge variant="nominal">PATCHED</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: SOC Incident Response Ledger */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Cybersecurity Incident Response & Containment Ledger ({socAuditLogs.length} Events)
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
                {socAuditLogs.map((log) => (
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
export default CybersecuritySOCPage
