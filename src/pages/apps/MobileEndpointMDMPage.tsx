import React, { useState } from 'react'
import {
  Smartphone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Radio,
  Wifi,
  Battery,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Zap,
  Layers,
  FileText,
  Sliders,
  Compass,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MobileEUDDevice } from '../../types/modules'

export type MDMTab = 'roster' | 'atak' | 'stig' | 'mam' | 'wipe' | 'audit'

export const MobileEndpointMDMPage: React.FC = () => {
  const {
    mobileEUDs,
    atakPlugins,
    auditLogs,
    remoteWipeEUD,
    deployATAKProfile,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<MDMTab>('roster')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('eud-01')
  const [searchQuery, setSearchQuery] = useState('')
  const [wipeReason, setWipeReason] = useState('Officer reported lost device outside federal facility perimeter')

  const mdmAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('EUD_') || a.targetEntity === 'MobileEUDDevice'
  )

  const selectedDevice = mobileEUDs.find((d) => d.id === selectedDeviceId) || mobileEUDs[0]

  const filteredEUDs = mobileEUDs.filter((d) => {
    return (
      d.deviceTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.userAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalEUDs = mobileEUDs.length
  const atakConnected = mobileEUDs.filter((d) => d.atakInstalled).length
  const compliantCount = mobileEUDs.filter((d) => d.securityPosture === 'COMPLIANT').length
  const avgStig = Math.round(
    mobileEUDs.reduce((acc, d) => acc + d.stigCompliancePct, 0) / (totalEUDs || 1)
  )

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 12 // MDM-EUD
                </span>
                <span className="text-xs text-slate-400">DoD DISA STIG / Samsung Knox DualDAR</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Knox DualDAR Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Secure Mobile &amp; MDM (ATAK / EUD)
              </h1>
              <p className="text-xs text-slate-400">
                Tactical End User Devices (EUD) • Android Team Awareness Kit (ATAK) • Remote Zeroization &amp; Cryptographic Inhibit
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
                  title: 'Fleet Health Polled',
                  message: 'All 4 enrolled tactical EUDs responded with nominal Knox integrity attestations',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Fleet</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActiveTab('wipe')
              }}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Zeroize Console</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>EUD Fleet Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {mobileEUDs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('atak')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'atak'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ATAK Mission Profiles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {atakPlugins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stig')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stig'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DISA STIG Posture</span>
          </button>

          <button
            onClick={() => setActiveTab('mam')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'mam'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>MAM &amp; DualDAR Container</span>
          </button>

          <button
            onClick={() => setActiveTab('wipe')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wipe'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Remote Inhibit &amp; Zeroize</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mobile Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Devices</span>
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{totalEUDs} Units</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tactical Handhelds &amp; Tablets</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>ATAK Connected</span>
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{atakConnected} Nodes</div>
          <div className="text-[10px] text-slate-500 mt-0.5">COP Vector Broadcast Enabled</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>DISA STIG Benchmark</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600 font-mono">{avgStig}% Avg</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DoD Mobility SRG Benchmark</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Posture Pass Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {compliantCount} <span className="text-xs font-normal text-slate-500">/ {totalEUDs} Pass</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">DualDAR Hardware Encryption</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Knox Attestation</span>
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">HARDWARE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Root of Trust Validated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inhibit Posture</span>
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">ARMED</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Over-The-Air Zeroize Ready</div>
        </div>
      </div>


{/* Screen 1: EUD Fleet Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search device tag, user, agency, or hardware model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            {filteredEUDs.map((dev) => {
              const isSelected = dev.id === selectedDeviceId
              const isCompliant = dev.securityPosture === 'COMPLIANT'
              const isWiped = dev.securityPosture === 'WIPED'

              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-blue-500/80 ring-1 ring-blue-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{dev.deviceTag}</span>
                        <Badge variant="outline">{dev.userAgency}</Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{dev.model}</h4>
                      <p className="text-[11px] text-slate-500">{dev.assignedUser}</p>
                    </div>

                    <Badge variant={isCompliant ? 'nominal' : isWiped ? 'critical' : 'warning'}>
                      {dev.securityPosture}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/50 border border-slate-200/50">
                      <span className="text-[10px] text-slate-500 block">STIG Score</span>
                      <span className="text-emerald-400 font-bold">{dev.stigCompliancePct}%</span>
                    </div>

                    <div className="p-2 rounded bg-background/50 border border-slate-200/50">
                      <span className="text-[10px] text-slate-500 block">Battery / Free Space</span>
                      <span className="text-blue-400 font-bold">{dev.batteryPct}% • {dev.storageFreeGb}GB</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>MAM Profile:</span>
                      <span className="text-slate-900">{dev.enrolledMAMProfile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crypto Keystore:</span>
                      <span className={dev.cryptoContainerStatus === 'UNLOCKED_FIPS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {dev.cryptoContainerStatus}
                      </span>
                    </div>
                    {dev.atakCallsign && (
                      <div className="flex justify-between">
                        <span>ATAK Callsign:</span>
                        <span className="text-purple-400 font-bold">{dev.atakCallsign}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        deployATAKProfile(dev.id, 'FEDERAL_TACTICAL_HIGH')
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Deploy Profile
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDeviceId(dev.id)
                        setActiveTab('wipe')
                      }}
                    >
                      Zeroize
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: ATAK Mission Profiles & Plugins */}
      {activeTab === 'atak' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              DISA-Approved ATAK Enterprise Plugins & Mission Packages
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographically signed ATAK APK plugin manifests pushed over FirstNet / MANET channels to field devices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {atakPlugins.map((plug) => (
                <div key={plug.id} className="p-3.5 rounded-lg bg-background/60 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{plug.pluginName}</span>
                    <Badge variant="nominal">{plug.approvedStatus}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                    <span>Category: {plug.category}</span>
                    <span>Version: {plug.version}</span>
                  </div>
                  <div className="text-xs font-mono text-purple-400">
                    {plug.activeDeployments} Active Tactical Devices
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      addToast({
                        title: `Plugin Pushed: ${plug.pluginName}`,
                        message: `OTA delta package staged for ${plug.activeDeployments} EUD targets`,
                        type: 'success',
                      })
                    }}
                  >
                    Push Over-The-Air Update
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: DISA STIG & Zero Trust Posture */}
      {activeTab === 'stig' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">DoD Mobile Device Fundamentals STIG Enforcement</h4>
              <p className="text-xs text-slate-500">Continuous zero trust verification of OS kernels, bootloaders, and encryption profiles</p>
            </div>
            <Badge variant="nominal">NIST SP 800-124 Rev 2</Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">STIG V-226841: Biometric + PIN Multi-Factor Lock</span>
                <p className="text-[10px] text-slate-500">Requires FIPS-certified biometric match or 8+ digit alphanumeric PIN</p>
              </div>
              <Badge variant="nominal">PASS (100%)</Badge>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">STIG V-226855: Hardware Root of Trust / Knox Attestation</span>
                <p className="text-[10px] text-slate-500">Cryptographic hardware measurement against factory fuse blown state</p>
              </div>
              <Badge variant="nominal">PASS (100%)</Badge>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">STIG V-226890: USB Data Port Lockdown in Field</span>
                <p className="text-[10px] text-slate-500">Disables USB data transfer pins when device is locked to prevent juice-jacking</p>
              </div>
              <Badge variant="nominal">ENFORCED</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: MAM & DualDAR Containerization */}
      {activeTab === 'mam' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Samsung Knox DualDAR Dual-Layer Encryption Engine
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data-at-Rest (DAR) encryption combines outer hardware FIPS 140-3 storage encryption with an inner software cryptographic container. Even if the device OS is compromised or extracted via JTAG hardware probing, classified work profile databases remain mathematically encrypted.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-background/60 border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900">Layer 1: Inner Container (DualDAR)</span>
              <p className="text-[11px] text-slate-500">AES-256-GCM cipher with ephemeral runtime keys purged upon screen lock.</p>
              <div className="text-[10px] text-emerald-400 font-mono">STATUS: ACTIVE & ENCRYPTED</div>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-900">Layer 2: Outer Storage Hardware</span>
              <p className="text-[11px] text-slate-500">UFS 4.0 onboard crypto engine with hardware PUF key generation.</p>
              <div className="text-[10px] text-emerald-400 font-mono">STATUS: FIPS 140-3 LEVEL 2 VERIFIED</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: Remote Inhibit & Zeroize Console */}
      {activeTab === 'wipe' && (
        <div className="p-5 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Federal Emergency Zeroization & Remote Cryptographic Kill Console
              </h4>
              <p className="text-xs text-slate-500">
                Dispatches instantaneous cryptographic erase command to Knox keystores to permanently brick compromised devices.
              </p>
            </div>
            <Badge variant="critical">DESTRUCTIVE ACTION</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Target Device Tag</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
              >
                {mobileEUDs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deviceTag} — {d.assignedUser} ({d.userAgency}) [{d.securityPosture}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-900 block mb-1">Mandatory Justification for Zeroization</label>
              <textarea
                rows={3}
                value={wipeReason}
                onChange={(e) => setWipeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
              />
            </div>

            <Button
              variant="destructive"
              onClick={() => {
                remoteWipeEUD(selectedDeviceId, wipeReason)
              }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Confirm & Dispatch Zeroization Signal
            </Button>
          </div>
        </div>
      )}

      {/* Screen 6: Mobile Compliance Audit Log */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              MDM Operational & Security Audit Log ({mdmAuditLogs.length} Events)
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
                {mdmAuditLogs.map((log) => (
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
export default MobileEndpointMDMPage
