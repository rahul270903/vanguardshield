import React, { useState } from 'react'
import {
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Fingerprint,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { ClassificationBanner } from '../../components/layout/ClassificationBanner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { UserPersona, AgencyTenant } from '../../types/tenant'

export const LoginPage: React.FC = () => {
  const { agencies, personas, login } = useVanguardStore()

  const [authMethod, setAuthMethod] = useState<'PIV_CAC' | 'PASSWORD_MFA'>('PIV_CAC')
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0]?.id || '')
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(agencies[0]?.id || '')
  const [pin, setPin] = useState('881244')
  const [authenticating, setAuthenticating] = useState(false)
  const [ocspProgress, setOcspProgress] = useState<string | null>(null)

  const selectedPersona: UserPersona = personas.find((p: UserPersona) => p.id === selectedPersonaId) || personas[0]
  const selectedAgency: AgencyTenant = agencies.find((a: AgencyTenant) => a.id === selectedAgencyId) || agencies[0]

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAuthenticating(true)
    setOcspProgress('Initializing mutual TLS 1.3 handshake with FIPS 140-3 HSM root...')

    setTimeout(() => {
      setOcspProgress('Validating PIV X.509 certificate chain against Federal Common Policy CA...')
    }, 450)

    setTimeout(() => {
      setOcspProgress('OCSP Revocation Status: GOOD (0 deviations). Establishing authenticated session...')
    }, 900)

    setTimeout(() => {
      setAuthenticating(false)
      setOcspProgress(null)
      login(selectedPersona.id, selectedAgency.id)
    }, 1300)
  }

  const handleQuickLoginAs = (personaId: string, agencyId: string) => {
    setSelectedPersonaId(personaId)
    setSelectedAgencyId(agencyId)
    setAuthenticating(true)
    const targetPersona = personas.find((p: UserPersona) => p.id === personaId)
    setOcspProgress(`Fast-authenticating ${targetPersona?.name || 'Officer'}...`)
    setTimeout(() => {
      setAuthenticating(false)
      setOcspProgress(null)
      login(personaId, agencyId)
    }, 600)
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-950 text-slate-100 select-none overflow-x-hidden">
      {/* Top Federal Classification Marking Banner */}
      <ClassificationBanner position="top" />

      {/* Main Authentication Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Official Federal Security System Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>UNITED STATES DEPARTMENT OF HOMELAND SECURITY</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-bold">UFSOS v1.0</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                  VANGUARDSHIELD
                </h1>
                <p className="text-xs text-slate-400">
                  Unified Federal Security Operating System // Multi-Domain Mission Suite
                </p>
              </div>
            </div>
          </div>

          {/* Security & Access Warning Box */}
          <div className="p-3.5 rounded-lg bg-slate-900/90 border border-amber-600/40 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                *** U.S. GOVERNMENT SYSTEM MANDATORY NOTICE &amp; CONSENT ***
              </span>
              You are accessing a United States Government (USG) Information System. Use of this system
              constitutes consent to monitoring, recording, and auditing under FIPS 201-3, NIST SP 800-53,
              and 18 U.S.C. § 1030. Unauthorized or improper access is strictly prohibited and subject to criminal prosecution.
            </div>
          </div>

          {/* Core Login Layout: Dual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Official Authentication Card (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="bg-slate-900/95 border border-slate-800 shadow-2xl rounded-xl">
                <CardHeader className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-cyan-400" />
                        <span>PIV / CAC Federal Gateway Authentication</span>
                      </CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Hardware cryptographic token verification with real-time OCSP status check
                      </p>
                    </div>
                    <Badge classification="SECRET" />
                  </div>

                  {/* Auth Method Tabs */}
                  <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('PIV_CAC')}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        authMethod === 'PIV_CAC'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>FIPS 201 PIV / CAC Smartcard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('PASSWORD_MFA')}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        authMethod === 'PASSWORD_MFA'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Username &amp; Hardware MFA</span>
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Select Operational Persona */}
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Select Authoritative Persona (Simulated PIV Card)
                      </label>
                      <Select
                        value={selectedPersonaId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const pId = e.target.value
                          setSelectedPersonaId(pId)
                          const p = personas.find((x: UserPersona) => x.id === pId)
                          if (p && p.agencyId) setSelectedAgencyId(p.agencyId)
                        }}
                        className="w-full bg-slate-950 border-slate-700 text-white text-xs h-9"
                      >
                        {personas.map((p: UserPersona) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.roleLabel} ({p.pivCardId}) // {p.clearanceLevel}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Select Agency Tenant Partition */}
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Target Federal Agency Tenant Enclave
                      </label>
                      <Select
                        value={selectedAgencyId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAgencyId(e.target.value)}
                        className="w-full bg-slate-950 border-slate-700 text-white text-xs h-9"
                      >
                        {agencies.map((a: AgencyTenant) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.code}) — {a.jurisdiction}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Smart Card PIN or MFA Token Input */}
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        {authMethod === 'PIV_CAC' ? 'PIV Smartcard 6-Digit PIN' : 'Password & Authenticator Token'}
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={pin}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
                          placeholder="••••••"
                          className="w-full bg-slate-950 border-slate-700 text-white font-mono tracking-widest text-sm pl-3 pr-10"
                        />
                        <div className="absolute right-3 top-2.5 text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PIN OK</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Credential Preview Chip */}
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {selectedPersona.avatarInitials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{selectedPersona.name}</span>
                            <span className="font-mono text-cyan-400 text-[10px]">({selectedPersona.pivCardId})</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">
                            {selectedPersona.roleLabel} • {selectedPersona.department}
                          </p>
                        </div>
                      </div>
                      <Badge classification={selectedPersona.clearanceLevel} />
                    </div>

                    {/* Progress / Status display during authentication */}
                    {ocspProgress && (
                      <div className="p-3 bg-blue-950/60 border border-blue-700/60 rounded text-[11px] font-mono text-cyan-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          <span className="font-bold">Cryptographic Handshake:</span>
                        </div>
                        <p className="text-slate-300 pl-5">{ocspProgress}</p>
                      </div>
                    )}

                    {/* Submit Login Action */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={authenticating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-11 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      {authenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Authenticating with Federal Root PKI...</span>
                        </>
                      ) : (
                        <>
                          <span>Authenticate &amp; Enter Command Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Fast Role Simulator & Federal Baselines (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Quick Persona Launchpad */}
              <Card className="bg-slate-900/95 border border-slate-800 shadow-xl rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>One-Click Role Demonstration</span>
                    <span className="text-[10px] text-cyan-400 font-mono">FIPS 201-3</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {personas.slice(0, 4).map((p: UserPersona) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLoginAs(p.id, p.agencyId)}
                      disabled={authenticating}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-950/80 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700/60 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] transition-colors">
                          {p.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.roleLabel} • <span className="font-mono text-cyan-400">{p.pivCardId}</span>
                          </div>
                        </div>
                      </div>
                      <Badge classification={p.clearanceLevel} />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Security Compliance Pillars */}
              <Card className="bg-slate-900/95 border border-slate-800 shadow-xl rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Security Posture Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">FIPS 140-3 Cryptographic Engine</span>
                      <span className="text-[10px] text-slate-400 font-mono">HSM Keystores // ML-KEM Ready</span>
                    </div>
                    <Badge variant="nominal" dot>ENFORCED</Badge>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">NIST SP 800-207 Zero Trust</span>
                      <span className="text-[10px] text-slate-400 font-mono">Continuous ABAC Context Checking</span>
                    </div>
                    <Badge variant="nominal" dot>ACTIVE</Badge>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">FedRAMP High Continuous Monitoring</span>
                      <span className="text-[10px] text-slate-400 font-mono">421 Authoritative Controls Passed</span>
                    </div>
                    <Badge variant="nominal" dot>99.98% SLA</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Federal Classification Marking Banner */}
      <ClassificationBanner position="bottom" />
    </div>
  )
}

export default LoginPage
