import React from 'react'
import { ShieldCheck, HardDrive, RefreshCw, Cpu, Activity } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'

export const StatusBar: React.FC = () => {
  const { agencies, activeAgencyId, auditLogs, resetToFactoryDefaults } = useVanguardStore()
  const activeAgency = agencies.find((a) => a.id === activeAgencyId)

  return (
    <footer className="h-6 bg-[#070F1E] border-t border-slate-800 text-[10px] text-slate-400 px-4 flex items-center justify-between select-none z-30 font-mono">
      {/* Left: System Integrity & Cryptography Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span className="font-semibold">SECURE-ONLINE</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>ENCLAVE: {activeAgency?.code || 'FED-DHS'}</span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-slate-500">
          <span>CRYPTO: FIPS 140-3 // AES-GCM-256</span>
        </div>
      </div>

      {/* Center: Live latency & audit stream count */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-1 text-slate-400">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>BUS LATENCY: 14ms</span>
        </div>
        <div className="text-slate-500">
          <span>AUDIT EVENTS: {auditLogs.length} LOGGED</span>
        </div>
      </div>

      {/* Right: Storage Engine & Reset Demo Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-slate-400">
          <HardDrive className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">STATE: LOCAL-PERSISTED</span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all demonstration data to default federal seed baseline?')) {
              resetToFactoryDefaults()
            }
          }}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors"
          title="Restore factory seed records"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>RESET DEMO DATA</span>
        </button>
      </div>
    </footer>
  )
}
