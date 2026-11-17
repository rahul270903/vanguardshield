import React, { useState } from 'react'
import {
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Server,
  Share2,
  Network,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export type CSfCTab = 'tunnels' | 'packages' | 'pqc' | 'blackred' | 'rekey' | 'audit'

export const CSfCTrustedIntegrationPage: React.FC = () => {
  const {
    csfcGateways,
    csfcPackages,
    auditLogs,
    rotateCSfCKeys,
    toggleCSfCTunnel,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<CSfCTab>('tunnels')
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('csfc-01')

  const csfcAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('CSFC_') || a.targetEntity === 'CSfCTunnelGateway'
  )

  const selectedGateway = csfcGateways.find((g) => g.id === selectedGatewayId) || csfcGateways[0]

  const totalGateways = csfcGateways.length
  const establishedTunnels = csfcGateways.filter(
    (g) => g.outerTunnelStatus === 'ESTABLISHED' && g.innerTunnelStatus === 'ESTABLISHED'
  ).length
  const totalThroughput = csfcGateways.reduce((acc, g) => acc + g.packetThroughputMbps, 0)
  const avgCompliance = Math.round(
    csfcPackages.reduce((acc, p) => acc + p.complianceScorePct, 0) / (csfcPackages.length || 1)
  )

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Mission App 13 // CSFC-TRUST
                </span>
                <span className="text-xs text-slate-400">NSA Capability Package v2.5 / CNSA 2.0 PQC</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Dual-Tunnel Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                CSfC Trusted Integration
              </h1>
              <p className="text-xs text-slate-400">
                Commercial Solutions for Classified • Dual-Tunnel IPsec / MACsec Architecture • Kyber ML-KEM-768 Cryptographic Mesh
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
                  title: 'CSfC Mesh Telemetry Polled',
                  message: 'All 3 dual-tunnel gateways verified nominal with active IKEv2 Suite B SA negotiations',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Gateways</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                rotateCSfCKeys(selectedGatewayId)
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Rotate Keys</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tunnels')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tunnels'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dual-Tunnel Mesh</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
              {csfcGateways.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'packages'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>NSA Capability Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('pqc')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pqc'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Post-Quantum Crypto (ML-KEM)</span>
          </button>

          <button
            onClick={() => setActiveTab('blackred')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'blackred'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Black/Red Network Isolation</span>
          </button>

          <button
            onClick={() => setActiveTab('rekey')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rekey'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Dynamic Rekey Orchestration</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSfC Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Dual-Tunnel Mesh</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {establishedTunnels} <span className="text-xs font-normal text-slate-500">/ {totalGateways} Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Inner + Outer IPsec Layered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CNSA 2.0 PQC Ready</span>
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">{csfcGateways.filter((g) => g.postQuantumAlgorithm.includes("ML-KEM")).length} Gateways</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Kyber ML-KEM-768 Hybrid</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Throughput Sealed</span>
            <Network className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {totalThroughput} Mbps
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hardware MACsec Wire-Speed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Next Scheduled Rekey</span>
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">03h 42m</div>
          <div className="text-[10px] text-slate-500 mt-0.5">IKEv2 Automated Key Rotation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>NSA Capability Package</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">CP v2.5 PASS</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dual-Independent Vendor Stacks</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Red/Black Air Gap</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">ISOLATED</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Galvanic Hardware Separation</div>
        </div>
      </div>


{/* Screen 1: Dual-Tunnel Gateways */}
      {activeTab === 'tunnels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {csfcGateways.map((gw) => {
              const isSelected = gw.id === selectedGatewayId
              const isOuterOk = gw.outerTunnelStatus === 'ESTABLISHED'
              const isInnerOk = gw.innerTunnelStatus === 'ESTABLISHED'

              return (
                <div
                  key={gw.id}
                  onClick={() => setSelectedGatewayId(gw.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-cyan-500/80 ring-1 ring-cyan-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{gw.gatewayName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{gw.facility}</p>
                    </div>
                    <Badge variant="outline">{gw.classificationDomain.replace(/_/g, ' ')}</Badge>
                  </div>

                  {/* Dual Tunnel Indicator */}
                  <div className="space-y-2 p-2.5 rounded-lg bg-background/50 border border-slate-200/50 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Outer Tunnel ({gw.outerGatewayVendor}):</span>
                      <Badge variant={isOuterOk ? 'nominal' : 'critical'}>{gw.outerTunnelStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Inner Tunnel ({gw.innerGatewayVendor}):</span>
                      <Badge variant={isInnerOk ? 'nominal' : 'warning'}>{gw.innerTunnelStatus}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">PQC Algorithm</span>
                      <span className="text-purple-400 font-bold">{gw.postQuantumAlgorithm}</span>
                    </div>

                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">Throughput</span>
                      <span className="text-emerald-400 font-bold">{gw.packetThroughputMbps} Mbps</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        rotateCSfCKeys(gw.id)
                      }}
                    >
                      <KeyRound className="w-3 h-3 mr-1" /> Rotate PQC Keys
                    </Button>

                    <Button
                      variant={isOuterOk ? 'outline' : 'secondary'}
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCSfCTunnel(gw.id)
                      }}
                    >
                      {isOuterOk ? 'Drop Tunnel' : 'Bring Up'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: NSA Capability Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              National Security Agency (NSA) CSfC Capability Package Registrations
            </h3>
            <p className="text-xs text-slate-500">
              Pre-engineered architectural configurations certified for transmission of classified federal data over public/untrusted commercial networks without Type 1 crypto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {csfcPackages.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{pkg.packageName}</h4>
                      <span className="text-[10px] text-purple-400 font-mono">{pkg.version}</span>
                    </div>
                    <Badge variant={pkg.status === 'CERTIFIED' ? 'nominal' : 'warning'}>{pkg.status}</Badge>
                  </div>

                  <div className="p-2.5 rounded bg-white border border-slate-200 text-xs font-mono space-y-1">
                    <div className="text-[10px] text-slate-500">NIST Benchmark</div>
                    <div className="text-slate-900">{pkg.nistStandard}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Compliance Score</span>
                      <span className="font-mono font-bold text-emerald-400">{pkg.complianceScorePct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pkg.complianceScorePct}%` }} />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      addToast({
                        title: `NSA Audit Package Exported: ${pkg.packageName}`,
                        message: `Certified compliance evidence dossier generated with NIST cross-references`,
                        type: 'success',
                      })
                    }}
                  >
                    Export Audit Dossier
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Post-Quantum CNSA 2.0 Engine */}
      {activeTab === 'pqc' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)</h4>
              <p className="text-xs text-slate-500">Protection against quantum decryption threats (Harvest Now, Decrypt Later)</p>
            </div>
            <Badge variant="nominal">NIST FIPS 203 / 204 Ready</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-900">ML-KEM-768 (Kyber Lattice Key Encapsulation)</span>
              <p className="text-xs text-slate-500">
                Replaces classical ECDH (Curve25519 / P-384) key exchanges for all outer and inner IPsec IKEv2 tunnels.
              </p>
              <div className="font-mono text-purple-400 text-xs font-bold">1184-byte public keys • 768-bit security level</div>
            </div>

            <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-900">ML-DSA-65 (Dilithium State-Free Digital Signatures)</span>
              <p className="text-xs text-slate-500">
                Authenticates mutual PIV gateway certificates against quantum Shor's algorithm factoring attacks.
              </p>
              <div className="font-mono text-emerald-400 text-xs font-bold">Category 3 Quantum Strength • FIPS 204 Validated</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Black / Red Boundary Isolation */}
      {activeTab === 'blackred' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            Physical & Cryptographic Red/Black Boundary Separation
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ensures that unencrypted classified payload data (Red Network) is physically and logically isolated from ciphertext transmission channels (Black Network). Air-gap optical data diodes and TEMPEST-shielded enclosures prevent acoustic, thermal, or EM side-channel exfiltration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 space-y-1">
              <span className="font-bold text-xs text-red-400">Red Network Domain (Classified Plaintext)</span>
              <p className="text-[11px] text-slate-500">Internal SCIF server fabric, DEMS evidentiary storage, and dispatch terminals.</p>
              <div className="text-[10px] text-red-300 font-mono">ISOLATION: 100% TEMPEST SHIELDED</div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 space-y-1">
              <span className="font-bold text-xs text-neutral-300">Black Network Domain (Public Ciphertext)</span>
              <p className="text-[11px] text-slate-500">Commercial ISP fiber, FirstNet LTE towers, and unclassified microwave hops.</p>
              <div className="text-[10px] text-emerald-400 font-mono">STATUS: DUAL-LAYER AES-256 ENCRYPTED</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: Rekey & Zeroization Console */}
      {activeTab === 'rekey' && (
        <div className="p-5 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Cryptographic Rekeying & Emergency Tunnel Zeroization</h4>
              <p className="text-xs text-slate-500">Instantaneous rotation or destruction of active CSfC session keys across all participating enclaves</p>
            </div>
            <Badge variant="nominal">FIPS 140-3 Key Vault</Badge>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-900 block">Target CSfC Enclave</label>
            <select
              value={selectedGatewayId}
              onChange={(e) => setSelectedGatewayId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
            >
              {csfcGateways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gatewayName} — {g.facility} [{g.classificationDomain}]
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  rotateCSfCKeys(selectedGatewayId)
                }}
              >
                <KeyRound className="w-4 h-4 mr-1.5" />
                Force Immediate Post-Quantum Rekey
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  toggleCSfCTunnel(selectedGatewayId)
                }}
              >
                Zeroize Session Keys & Drop Tunnel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: CSfC Custody Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              CSfC Cryptographic Operations Audit Ledger ({csfcAuditLogs.length} Events)
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
                {csfcAuditLogs.map((log) => (
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
export default CSfCTrustedIntegrationPage
