import React, { useState } from 'react'
import {
  Server,
  Radio,
  RadioTower,
  Cpu,
  Wifi,
  Activity,
  Shield,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Power,
  Sliders,
  CheckCircle2,
  Clock,
  Zap,
  Layers,
  FileText,
  Lock,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export type P25InfraTab = 'cores' | 'voters' | 'microwave' | 'power' | 'failover' | 'audit'

export const P25InfrastructurePage: React.FC = () => {
  const {
    p25CoreSites,
    p25ComparatorVoters,
    microwaveLinks,
    auditLogs,
    triggerP25FailoverTest,
    toggleP25CoreSiteStatus,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<P25InfraTab>('cores')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('p25-core-01')

  const infraAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('P25_') || a.targetEntity === 'P25CoreSiteController'
  )

  const totalActiveChannels = p25CoreSites.reduce((acc, s) => acc + s.activeChannels, 0)
  const totalChannels = p25CoreSites.reduce((acc, s) => acc + s.totalChannels, 0)
  const optimalMwLinks = microwaveLinks.filter((l) => l.linkStatus === 'LOCKED_OPTIMAL').length

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Mission App 11 // P25-INFRA
                </span>
                <span className="text-xs text-slate-400">TIA-102 Phase 2 Simulcast / FIPS 140-3 L3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Simulcast Prime Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                On-Prem P25 Infrastructure
              </h1>
              <p className="text-xs text-slate-400">
                Master Prime Site Controllers • Voting Comparator Racks • Microwave Backhaul • Subterranean BDA In-Building Repeaters
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
                  title: 'Infrastructure Telemetry Polled',
                  message: 'All 3 master site controllers & 3 microwave links responded nominal',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Telemetry</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                triggerP25FailoverTest(selectedSiteId)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test Failover</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cores')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cores'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Master Site Controllers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {p25CoreSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('voters')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'voters'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Comparator / Voting Racks</span>
          </button>

          <button
            onClick={() => setActiveTab('microwave')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'microwave'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Microwave Backhaul Links</span>
          </button>

          <button
            onClick={() => setActiveTab('power')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'power'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Environmental &amp; Power</span>
          </button>

          <button
            onClick={() => setActiveTab('failover')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'failover'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Failover &amp; DR Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Infrastructure Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Trunked Channels</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {totalActiveChannels} <span className="text-xs font-normal text-slate-500">/ {totalChannels}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active Simulcast TDMA Slots</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Core Redundancy</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">100% 1+1 HOT</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Geographic Redundant Standby</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Voting Comparators</span>
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{p25ComparatorVoters.length} Units</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">50 packets/sec voting rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Microwave Backbone</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {optimalMwLinks} <span className="text-xs font-normal text-slate-500">/ {microwaveLinks.length} Locked</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">&lt; 2.5ms average packet latency</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Site Prime Controller</span>
            <Server className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">ONLINE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulcast Synchronization Locked</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Power &amp; Generator</span>
            <Power className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">COMMERCIAL</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Diesel Gen Standby 100% Fuel</div>
        </div>
      </div>


{/* Screen 1: Master Site Controllers */}
      {activeTab === 'cores' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {p25CoreSites.map((site) => {
              const isSelected = site.id === selectedSiteId
              const isOnline = site.status === 'ONLINE' || site.status === 'STANDBY_HOT'

              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{site.siteId}</span>
                        <Badge variant={site.status === 'ONLINE' ? 'nominal' : site.status === 'STANDBY_HOT' ? 'info' : 'critical'}>
                          {site.status}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 mt-1">{site.siteName}</h4>
                      <p className="text-[10px] text-slate-500">{site.zone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/50 border border-slate-200/50">
                      <span className="text-[10px] text-slate-500 block">Active Channels</span>
                      <span className="text-emerald-400 font-bold">{site.activeChannels} / {site.totalChannels}</span>
                    </div>

                    <div className="p-2 rounded bg-background/50 border border-slate-200/50">
                      <span className="text-[10px] text-slate-500 block">CPU Load</span>
                      <span className="text-blue-400 font-bold">{site.cpuLoadPct}%</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>IP Core:</span>
                      <span className="text-slate-900">{site.ipv4Address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="text-slate-900">{site.uptimeDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software:</span>
                      <span className="text-slate-900">{site.softwareVersion}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerP25FailoverTest(site.id)
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Test Failover
                    </Button>

                    <Button
                      variant={isOnline ? 'outline' : 'secondary'}
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleP25CoreSiteStatus(site.id)
                      }}
                    >
                      {site.status === 'ONLINE' ? 'Force Failsoft' : 'Restore Online'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Comparator / Voting Racks */}
      {activeTab === 'voters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Digital Voting Comparator Subsystems (TIA-102.CAAB)
            </h3>
            <p className="text-xs text-slate-500">
              Compares frame-by-frame audio packets from multi-site receivers and selects the receiver stream with the lowest Bit Error Rate (BER) in real-time.
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Comparator Code</th>
                    <th className="px-3 py-2">Subsystem Name</th>
                    <th className="px-3 py-2">Assigned Talkgroup</th>
                    <th className="px-3 py-2">Receiver Inputs</th>
                    <th className="px-3 py-2">Best Voted Site</th>
                    <th className="px-3 py-2">Voting Rate</th>
                    <th className="px-3 py-2">BER %</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {p25ComparatorVoters.map((v) => (
                    <tr key={v.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-900">{v.comparatorCode}</td>
                      <td className="px-3 py-2 font-sans text-slate-900">{v.subsystemName}</td>
                      <td className="px-3 py-2 text-purple-400">{v.talkgroupAssigned}</td>
                      <td className="px-3 py-2 text-slate-900">{v.receiverInputsCount} Towers</td>
                      <td className="px-3 py-2 text-emerald-400 font-sans">{v.bestVotedSite}</td>
                      <td className="px-3 py-2">{v.votingRatePacketsPerSec} pkt/s</td>
                      <td className="px-3 py-2 text-emerald-400">{(v.bitErrorRatePct * 100).toFixed(3)}%</td>
                      <td className="px-3 py-2">
                        <Badge variant={v.status === 'VOTING_ACTIVE' ? 'nominal' : 'outline'}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Microwave Backhaul Links */}
      {activeTab === 'microwave' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {microwaveLinks.map((link) => (
              <div key={link.id} className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{link.linkName}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {link.sourceSite} → {link.destinationSite}
                    </div>
                  </div>
                  <Badge variant={link.linkStatus === 'LOCKED_OPTIMAL' ? 'nominal' : 'warning'}>
                    {link.linkStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 p-2.5 rounded-lg bg-background/50 border border-slate-200/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Capacity Utilization</span>
                    <span className="font-mono font-bold text-slate-900">
                      {link.utilizationPct}% ({Math.round((link.capacityMbps * link.utilizationPct) / 100)} / {link.capacityMbps} Mbps)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        link.utilizationPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${link.utilizationPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                    <span className="text-[10px] text-slate-500 block">Frequency</span>
                    <span className="text-slate-900 font-bold">{link.frequencyGhz} GHz</span>
                  </div>
                  <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                    <span className="text-[10px] text-slate-500 block">Latency</span>
                    <span className="text-emerald-400 font-bold">{link.latencyMs} ms</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    addToast({
                      title: `Microwave Sweep: ${link.linkName}`,
                      message: `RF link alignment nominal • Fading margin 38 dBm • Polarization: ${link.polarization}`,
                      type: 'info',
                    })
                  }}
                >
                  Run RF Alignment Sweep
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen 4: Environmental & Power Telemetry */}
      {activeTab === 'power' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Dual A+B UPS Battery Vault</span>
              <Badge variant="nominal">Online / Floating</Badge>
            </div>
            <p className="text-xs text-slate-500">
              480 VDC battery bank provides 4 hours of uninterrupted primary power at 100% full RF transmit load.
            </p>
            <div className="font-mono text-emerald-400 text-sm font-bold">542 VDC • 99.8% Capacity</div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Caterpillar 500kW Diesel Gen</span>
              <Badge variant="nominal">Auto-Standby Ready</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Subterranean fuel tank holds 2,500 gallons of ultra-low sulfur diesel for 72 hours of continuous off-grid operation.
            </p>
            <div className="font-mono text-emerald-400 text-sm font-bold">94% Fuel • Oil Temp 140°F</div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>HVAC Transmitter Room Chiller</span>
              <Badge variant="nominal">Dual Redundant</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Precision climate control maintaining transmitter racks at optimal operating temperatures to prevent power amplifier thermal drift.
            </p>
            <div className="font-mono text-blue-400 text-sm font-bold">68.2 °F (20.1 °C) • 42% RH</div>
          </div>
        </div>
      )}

      {/* Screen 5: Failover & Disaster Recovery Matrix */}
      {activeTab === 'failover' && (
        <div className="p-5 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Autonomous Core Failover & TIA-102 Failsoft Simulation</h4>
              <p className="text-xs text-slate-500">
                Verify high-availability switchover between Primary Master Site and Alternate Mount Weather Core
              </p>
            </div>
            <Badge variant="nominal">1+1 Hot Redundancy</Badge>
          </div>

          <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Simulated Core Failure Switchover Latency Benchmark</span>
              <span className="font-mono text-emerald-400 font-bold">&lt; 25 ms Target (Measured 18 ms)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In the event of a total severed backbone fiber link or prime site controller disruption, all RF base stations instantly transition to Site Trunking Mode or failsoft conventional repeaters without dropping active encrypted P25 voice transmissions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  p25CoreSites.forEach((s) => triggerP25FailoverTest(s.id))
                  addToast({
                    title: 'System-Wide Failover Drill Executed',
                    message: 'All 3 core sites verified sub-second switchover capability',
                    type: 'success',
                  })
                }}
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Execute System-Wide Failover Drill
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: Infrastructure Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              P25 Infrastructure Operational Audit Ledger ({infraAuditLogs.length} Events)
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
                {infraAuditLogs.map((log) => (
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
export default P25InfrastructurePage
