import React from 'react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { ClassificationLevel } from '../../types/common'

export interface ClassificationBannerProps {
  position?: 'top' | 'bottom'
}

export const ClassificationBanner: React.FC<ClassificationBannerProps> = ({ position = 'top' }) => {
  const { classificationLevel, setClassificationLevel } = useVanguardStore()

  const config: Record<
    ClassificationLevel,
    { label: string; bg: string; text: string; subtext: string }
  > = {
    UNCLASSIFIED: {
      label: 'UNCLASSIFIED // FOR OFFICIAL USE ONLY',
      bg: 'bg-emerald-800',
      text: 'text-emerald-100',
      subtext: 'FED-TIER-1',
    },
    CUI: {
      label: 'CONTROLLED UNCLASSIFIED INFORMATION // FEDCON // NOFORN',
      bg: 'bg-purple-900',
      text: 'text-purple-100',
      subtext: 'NIST SP 800-171',
    },
    CONFIDENTIAL: {
      label: 'CONFIDENTIAL // REL TO USA, FVEY',
      bg: 'bg-sky-900',
      text: 'text-sky-100',
      subtext: 'ENCLAVE-BLUE',
    },
    SECRET: {
      label: 'SECRET // NOFORN // SPECIAL ACCESS REQUIRED',
      bg: 'bg-red-900',
      text: 'text-red-100',
      subtext: 'SIPRNET-BRIDGE',
    },
    'TOP SECRET': {
      label: 'TOP SECRET // SCI // TK // G // HCS',
      bg: 'bg-amber-900',
      text: 'text-amber-100',
      subtext: 'JWICS-MIRROR',
    },
  }

  const current = config[classificationLevel] || config.CUI

  return (
    <div
      className={`${current.bg} ${current.text} px-4 py-0.5 text-[11px] font-bold tracking-widest uppercase flex items-center justify-between select-none shadow-xs z-50`}
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
        <span>{current.label}</span>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-medium opacity-90">
        <span className="hidden sm:inline-block tracking-normal font-mono">{current.subtext}</span>
        {position === 'top' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] lowercase text-white/70">enclave:</span>
            <select
              value={classificationLevel}
              onChange={(e) => setClassificationLevel(e.target.value as ClassificationLevel)}
              className="bg-black/30 border border-white/20 text-white rounded px-1.5 py-0.5 text-[10px] uppercase font-bold focus:outline-none cursor-pointer"
            >
              <option value="UNCLASSIFIED" className="bg-slate-900">Unclassified</option>
              <option value="CUI" className="bg-slate-900">CUI</option>
              <option value="SECRET" className="bg-slate-900">Secret</option>
              <option value="TOP SECRET" className="bg-slate-900">Top Secret</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
