import fs from 'fs';
import path from 'path';

const sharedServicePageContent = `import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Users,
  Shield,
  Lock,
  Workflow,
  BellRing,
  Database,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  Eye,
  KeyRound,
  Server,
  Zap,
  Sliders,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  FileCode,
  Layers,
  ChevronRight,
  Terminal,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useVanguardStore } from '../../store/useVanguardStore'

export const SharedServicePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>()
  const store = useVanguardStore()
  const {
    agencies,
    activeAgencyId,
    personas,
    activePersonaId,
    tasks,
    alerts,
    auditLogs,
    updateTaskStatus,
    logAuditEvent,
    addToast,
    massNotifications,
    dispatchMassNotification,
  } = store

  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  // Shared Sub-Tabs for each service
  const currentService = serviceId || 'identity'
  const [activeTab, setActiveTab] = useState<string>('overview')

  // --- IDENTITY & PIV STATE ---
  const [certFilter, setCertFilter] = useState<'ALL' | 'VALID' | 'REVOKED' | 'EXPIRING'>('ALL')
  const [certSearch, setCertSearch] = useState('')
  const [testCertModalOpen, setTestCertModalOpen] = useState(false)
  const [testPivInput, setTestPivInput] = useState('PIV-9902-8812-441')
  const [testOcspResult, setTestOcspResult] = useState<{ status: string; fips: string; certChain: string } | null>(null)
  const [pamQuorumModalOpen, setPamQuorumModalOpen] = useState(false)
  const [pamPrivilegeReason, setPamPrivilegeReason] = useState('Emergency root certificate rotation')
  const [certRevocations, setCertRevocations] = useState<string[]>([])

  // --- ZERO TRUST & SECURITY POLICY STATE ---
  const [abacRules, setAbacRules] = useState([
    { id: 'abac-01', name: 'Deny Non-PIV SIPRNET Bridge Egress', effect: 'DENY', subject: 'clearance < SECRET', resource: 'enclave:SIPRNET', enabled: true },
    { id: 'abac-02', name: 'MFA Step-Up on Mass Notification Broadcast', effect: 'REQUIRE_MFA', subject: 'role != EMERGENCY_MANAGER', resource: 'action:MASS_BROADCAST', enabled: true },
    { id: 'abac-03', name: 'Quorum Clearance for PACS Lockdown Override', effect: 'QUORUM_APPROVAL', subject: 'all', resource: 'portal:LOCKDOWN_RELEASE', enabled: true },
    { id: 'abac-04', name: 'Cryptographic Redaction on BWC Video Export', effect: 'ENFORCE_REDACTION', subject: 'role == AUDITOR_PRIVACY', resource: 'dems:EVIDENCE_EXPORT', enabled: true },
    { id: 'abac-05', name: 'Cross-Agency Interop Mutual TLS 1.3 Strict', effect: 'REQUIRE_MTLS', subject: 'network == EXTERNAL_CAD', resource: 'bridge:CRITICAL_CONNECT', enabled: true },
  ])
  const [policyTesterSubject, setPolicyTesterSubject] = useState(activePersona.id)
  const [policyTesterResource, setPolicyTesterResource] = useState('enclave:SIPRNET')
  const [policyDecisionResult, setPolicyDecisionResult] = useState<{ decision: 'ALLOW' | 'DENY'; matchedRule: string; latencyMs: number } | null>(null)

  // --- INTEGRATION FABRIC & APIS STATE ---
  const [fabricEvents, setFabricEvents] = useState([
    { id: 'evt-8891', type: 'gov.dhs.vanguard.pacs.badge_scan', source: 'pacs-ctrl-east-01', schema: 'cloudevents-v1.0', status: 'ACKNOWLEDGED', latency: '4ms', timestamp: '10s ago' },
    { id: 'evt-8892', type: 'gov.dhs.vanguard.cad.incident_update', source: 'ng911-core-psap-1', schema: 'cloudevents-v1.0', status: 'DELIVERED', latency: '6ms', timestamp: '24s ago' },
    { id: 'evt-8893', type: 'gov.dhs.vanguard.rf.p25_emergency_sos', source: 'p25-repeater-site-4', schema: 'cloudevents-v1.0', status: 'ACKNOWLEDGED', latency: '2ms', timestamp: '48s ago' },
    { id: 'evt-8894', type: 'gov.dhs.vanguard.soc.threat_detected', source: 'cyber-sensor-core-09', schema: 'cloudevents-v1.0', status: 'ACKNOWLEDGED', latency: '5ms', timestamp: '1m ago' },
    { id: 'evt-8895', type: 'gov.dhs.vanguard.cap.mass_alert_issued', source: 'mass-notif-daemon', schema: 'cloudevents-v1.0', status: 'DEAD_LETTER', latency: '120ms', timestamp: '3m ago' },
  ])
  const [deadLetterCount, setDeadLetterCount] = useState(1)

  // --- NOTIFICATIONS STATE ---
  const [notifTargetGroup, setNotifTargetGroup] = useState('ALL_UNITS')
  const [notifChannel, setNotifChannel] = useState<'SMS' | 'TTS_VOICE' | 'DESKTOP_TAKEOVER' | 'ALL'>('ALL')
  const [notifBody, setNotifBody] = useState('TEST OPERATIONAL TRANSMISSION: Vanguard Shield Unified Dispatch Fabric Ping.')

  // --- DATA GOVERNANCE & LEGAL HOLD STATE ---
  const [legalHolds, setLegalHolds] = useState([
    { id: 'LH-2026-001', caseNumber: 'CR-2026-8812', title: 'White House Perimeter Breach Investigation', custodian: 'Marcus Vance', recordCount: 142, status: 'ACTIVE', holdScope: 'PACS, VMS, P25 Radio Audio' },
    { id: 'LH-2026-002', caseNumber: 'OIG-2026-0199', title: 'National Mall VIP Escort Telemetry Records', custodian: 'Sarah Lin', recordCount: 88, status: 'ACTIVE', holdScope: 'GPS Telemetry, Drone Feeds' },
    { id: 'LH-2026-003', caseNumber: 'FOIA-2026-9021', title: 'Quarterly Hazmat Environmental Sensor Logs', custodian: 'David Chen', recordCount: 310, status: 'PENDING_RELEASE', holdScope: 'CBRN Sentry Telemetry' },
  ])
  const [newHoldModalOpen, setNewHoldModalOpen] = useState(false)
  const [newHoldCaseNumber, setNewHoldCaseNumber] = useState('CR-2026-9401')
  const [newHoldTitle, setNewHoldTitle] = useState('')
  const [newHoldScope, setNewHoldScope] = useState('VMS Surveillance Feeds, BWC Video')

  // --- AUDIT LEDGER STATE ---
  const [auditSearchQuery, setAuditSearchQuery] = useState('')
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')

  // Service Metadata
  const serviceMeta: Record<string, {
    number: string
    title: string
    subtitle: string
    icon: React.ReactNode
    standards: string
    badge: string
    kpis: { label: string; value: string; detail: string; status?: string }[]
    tabs: { id: string; label: string; icon: React.ReactNode }[]
  }> = {
    identity: {
      number: 'SERVICE 01',
      title: 'Identity, PIV & Credential Assurance',
      subtitle: 'Authoritative FIPS 201 Personal Identity Verification, Mutual PKI & High-Assurance SSO',
      icon: <Users className="w-5 h-5" />,
      standards: 'FIPS 201-3 // NIST SP 800-63-3 (IAL3 / AAL3)',
      badge: 'PIV / CAC AAL3',
      kpis: [
        { label: 'Validated PIV Credentials', value: `${personas.length}`, detail: '100% Hardware PKI Token Enrolled', status: 'text-emerald-600' },
        { label: 'OCSP Responder Latency', value: '18 ms', detail: 'NIST CRL Sync Nominal (< 30ms)', status: 'text-blue-600' },
        { label: 'Active Smart Card Sessions', value: '42 Sessions', detail: 'Mutual TLS 1.3 Authenticated', status: 'text-slate-900' },
        { label: 'Revoked Certificate List', value: `${certRevocations.length} Revoked`, detail: 'Tamper-Evident Ledger Synced', status: certRevocations.length > 0 ? 'text-amber-600' : 'text-slate-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Credential Directory', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'ocsp', label: 'OCSP PKI Validator', icon: <KeyRound className="w-3.5 h-3.5" /> },
        { id: 'pam', label: 'PAM Privilege Quorum', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        { id: 'revocation', label: 'Revocation Ledger', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
      ],
    },
    'security-policy': {
      number: 'SERVICE 02',
      title: 'Zero Trust & Security Policy Engine',
      subtitle: 'NIST SP 800-207 Dynamic Policy Decision Point (PDP) & Policy Enforcement Point (PEP)',
      icon: <Lock className="w-5 h-5" />,
      standards: 'NIST SP 800-207 // FedRAMP High Baseline',
      badge: 'PDP / PEP Zero Trust',
      kpis: [
        { label: 'Active ABAC Policies', value: `${abacRules.filter(r => r.enabled).length} Active`, detail: 'Deny-by-default execution', status: 'text-emerald-600' },
        { label: 'PDP Decision Latency', value: '3.2 ms', detail: 'In-Memory Rust Micro-Engine', status: 'text-blue-600' },
        { label: 'Enclave Crossings Inspected', value: '1,842 /hr', detail: 'CUI & SIPRNET Boundary Checks', status: 'text-slate-900' },
        { label: 'Dynamic Threat Posture', value: 'DEFCON 4', detail: 'Nominal Peacetime Enforcement', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'ABAC Policy Rules', icon: <Lock className="w-3.5 h-3.5" /> },
        { id: 'evaluator', label: 'PDP Decision Tester', icon: <Terminal className="w-3.5 h-3.5" /> },
        { id: 'enclaves', label: 'Enclave Boundaries', icon: <Layers className="w-3.5 h-3.5" /> },
      ],
    },
    integrations: {
      number: 'SERVICE 03',
      title: 'Integration Fabric & API Gateways',
      subtitle: 'High-throughput CloudEvents bus, schema registry, and multi-agency CAD/P25 adapters',
      icon: <Workflow className="w-5 h-5" />,
      standards: 'OpenAPI 3.1 // CloudEvents v1.0 // RFC 9457',
      badge: 'CloudEvents v1.0',
      kpis: [
        { label: 'Event Bus Throughput', value: '4.8k msg/s', detail: 'Zero packet loss recorded', status: 'text-emerald-600' },
        { label: 'Dead-Letter Queue', value: `${deadLetterCount} Messages`, detail: 'Requires operator re-drive', status: deadLetterCount > 0 ? 'text-amber-600' : 'text-emerald-600' },
        { label: 'Connected Subsystem Adapters', value: '16 Active', detail: 'Full Mesh Mission Bridges', status: 'text-blue-600' },
        { label: 'Schema Validation Rate', value: '100.0%', detail: 'Strict JSON-Schema v2020-12', status: 'text-slate-900' },
      ],
      tabs: [
        { id: 'overview', label: 'Live Event Stream', icon: <Workflow className="w-3.5 h-3.5" /> },
        { id: 'adapters', label: 'Subsystem Gateways', icon: <Server className="w-3.5 h-3.5" /> },
        { id: 'deadletter', label: 'Dead-Letter Poison Queue', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      ],
    },
    workflows: {
      number: 'SERVICE 04',
      title: 'Workflow & Unified Approval Inbox',
      subtitle: 'Cross-module multi-tier operational approval orchestration and separation of duties',
      icon: <CheckCircle className="w-5 h-5" />,
      standards: 'NIST SP 800-53 AC-5 Separation of Duties',
      badge: 'Dual-Custody Quorum',
      kpis: [
        { label: 'Pending Approvals', value: `${tasks.filter(t => t.status === 'WAITING_APPROVAL').length} Pending`, detail: 'Awaiting Commander authorization', status: 'text-amber-600' },
        { label: 'Executed Decisions Today', value: `${tasks.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length} Decisions`, detail: 'Non-repudiation PKI signed', status: 'text-emerald-600' },
        { label: 'Average Approval Time', value: '4.5 min', detail: 'SLA Target < 15 min', status: 'text-blue-600' },
        { label: 'Escalation Alert State', value: 'NOMINAL', detail: '0 tasks approaching timeout', status: 'text-slate-900' },
      ],
      tabs: [
        { id: 'overview', label: 'Pending Approvals Queue', icon: <CheckCircle className="w-3.5 h-3.5" /> },
        { id: 'history', label: 'Decision Audit History', icon: <Clock className="w-3.5 h-3.5" /> },
        { id: 'delegations', label: 'Supervisor Delegations', icon: <Users className="w-3.5 h-3.5" /> },
      ],
    },
    notifications: {
      number: 'SERVICE 05',
      title: 'Unified Notification Center',
      subtitle: 'Multi-modal platform dispatch across In-App, Carrier SMS, Voice TTS, and Desktop Push',
      icon: <BellRing className="w-5 h-5" />,
      standards: 'CAP v1.2 (Common Alerting Protocol)',
      badge: 'Multi-Channel Push',
      kpis: [
        { label: 'Delivery Channels', value: '4 Nominal', detail: 'SMS, Voice, In-App, Push active', status: 'text-emerald-600' },
        { label: 'Dispatch Latency (P99)', value: '420 ms', detail: 'Carrier Direct Delivery SLA', status: 'text-blue-600' },
        { label: 'Broadcast History (24h)', value: `${massNotifications.length} Broadcasts`, detail: '100% Recipient Delivery Rate', status: 'text-slate-900' },
        { label: 'Active Carrier Routes', value: 'FirstNet + Verizon', detail: 'Wireless Priority Service (WPS)', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Notification Dispatcher', icon: <Send className="w-3.5 h-3.5" /> },
        { id: 'channels', label: 'Channel Status & Routes', icon: <Server className="w-3.5 h-3.5" /> },
        { id: 'history', label: 'Transmission Logs', icon: <Clock className="w-3.5 h-3.5" /> },
      ],
    },
    governance: {
      number: 'SERVICE 06',
      title: 'Data Governance & Legal Hold',
      subtitle: 'NARA Federal Records compliance, litigation hold preservation, and automated PII redaction',
      icon: <Database className="w-5 h-5" />,
      standards: 'NARA 36 CFR Part 1236 // Privacy Act 1974',
      badge: 'NARA Compliant',
      kpis: [
        { label: 'Active Legal Holds', value: `${legalHolds.filter(h => h.status === 'ACTIVE').length} Active`, detail: 'Automated disposition suspended', status: 'text-rose-600' },
        { label: 'Preserved Evidence Records', value: `${legalHolds.reduce((acc, h) => acc + h.recordCount, 0)} Records`, detail: 'Cryptographic WORM Locked', status: 'text-slate-900' },
        { label: 'Automated PII Redactions', value: '142 Passes', detail: 'Facial & License Plate Masking', status: 'text-blue-600' },
        { label: 'Retention Compliance', value: '100.0%', detail: 'Zero premature destruction events', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Legal Hold Registry', icon: <Database className="w-3.5 h-3.5" /> },
        { id: 'redaction', label: 'PII Redaction Engine', icon: <Eye className="w-3.5 h-3.5" /> },
        { id: 'retention', label: 'NARA Retention Schedules', icon: <FileText className="w-3.5 h-3.5" /> },
      ],
    },
    audit: {
      number: 'SERVICE 07',
      title: 'Tamper-Evident Audit Ledger',
      subtitle: 'Cryptographic WORM append-only security journal, SHA-256 hash chaining, and export',
      icon: <FileText className="w-5 h-5" />,
      standards: 'NIST SP 800-53 AU-3 / AU-10 // FIPS 140-3',
      badge: 'WORM Cryptographic Log',
      kpis: [
        { label: 'Authoritative Log Entries', value: `${auditLogs.length} Events`, detail: 'Continuous SHA-256 Hash Chained', status: 'text-slate-900' },
        { label: 'Cryptographic Integrity', value: 'VERIFIED', detail: 'Zero block tampering detected', status: 'text-emerald-600' },
        { label: 'Sync Clock Precision', value: 'NIST Atomic', detail: '< 1ms drift across cluster', status: 'text-blue-600' },
        { label: 'Forensic Audit Export', value: 'Ready', detail: 'Signed JSON-LD / PDF archive', status: 'text-emerald-600' },
      ],
      tabs: [
        { id: 'overview', label: 'Cryptographic Log Ledger', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'integrity', label: 'Hash Verification Proofs', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        { id: 'export', label: 'Inspector General Export', icon: <ExternalLink className="w-3.5 h-3.5" /> },
      ],
    },
  }

  const meta = serviceMeta[currentService] || serviceMeta.identity

  // Handlers
  const handleRunDiagnostic = () => {
    logAuditEvent({
      action: 'SERVICE_DIAGNOSTIC_RUN',
      actor: activePersona.name,
      target: meta.title,
      details: \`Comprehensive health check on \${meta.title} completed. 0 integrity faults detected.\`,
      severity: 'INFO',
    })
    addToast({
      title: \`\${meta.title} Diagnostic\`,
      message: 'Cryptographic baseline intact. All 16 federal integration adapters nominal.',
      type: 'success',
    })
  }

  const handleTestPivCard = () => {
    if (!testPivInput) return
    const matching = personas.find(p => p.pivCardId.toLowerCase() === testPivInput.toLowerCase())
    if (matching) {
      setTestOcspResult({
        status: 'GOOD (VALIDATED)',
        fips: 'FIPS 201-3 Compliant // RSA-4096 Hardware Key',
        certChain: \`CN=\${matching.name}, OU=\${matching.department}, O=Federal Government, C=US\`,
      })
    } else {
      setTestOcspResult({
        status: 'REVOKED / UNKNOWN',
        fips: 'Non-Conforming Credential // Access Denied',
        certChain: 'Serial not present in authoritative federal root store',
      })
    }
  }

  const handleRevokeCert = (pivId: string, name: string) => {
    setCertRevocations(prev => [...prev, pivId])
    logAuditEvent({
      action: 'PIV_CERTIFICATE_REVOCATION',
      actor: activePersona.name,
      target: pivId,
      details: \`Emergency PIV credential certificate revoked for \${name} (\${pivId}). OCSP broadcast dispatched.\`,
      severity: 'CRITICAL',
    })
    addToast({
      title: 'Credential Revoked',
      message: \`PIV credential \${pivId} revoked and blacklisted across all PACS & CAD enclaves.\`,
      type: 'warning',
    })
  }

  const handleToggleAbacRule = (id: string) => {
    setAbacRules(prev =>
      prev.map(r => {
        if (r.id === id) {
          const next = !r.enabled
          addToast({
            title: 'Policy State Mutated',
            message: \`ABAC Rule "\${r.name}" is now \${next ? 'ENFORCED' : 'DISABLED'}.\`,
            type: next ? 'info' : 'warning',
          })
          return { ...r, enabled: next }
        }
        return r
      })
    )
  }

  const handleEvaluatePolicy = () => {
    const matched = abacRules.find(r => r.enabled)
    setPolicyDecisionResult({
      decision: matched?.effect === 'DENY' ? 'DENY' : 'ALLOW',
      matchedRule: matched ? matched.name : 'Default Allow Fallback',
      latencyMs: 3.4,
    })
  }

  const handleReDriveDeadLetter = () => {
    setDeadLetterCount(0)
    setFabricEvents(prev =>
      prev.map(e => (e.status === 'DEAD_LETTER' ? { ...e, status: 'RE_DRIVE_SUCCESS' } : e))
    )
    logAuditEvent({
      action: 'DEAD_LETTER_QUEUE_REDRIVE',
      actor: activePersona.name,
      target: 'CloudEvents Fabric Bus',
      details: 'Operator re-drived poison message queue back into the primary transactional broker.',
      severity: 'INFO',
    })
    addToast({
      title: 'Queue Re-Drive Triggered',
      message: '1 poison event successfully validated against schema and re-ingested into event bus.',
      type: 'success',
    })
  }

  const handleDispatchNotification = () => {
    if (!notifBody) return
    dispatchMassNotification('VANGUARD-ALERT-SYSTEM', \`Unified Broadcast: \${notifBody.slice(0, 30)}...\`, [activeAgency.jurisdiction])
    addToast({
      title: 'Multi-Modal Broadcast Transmitted',
      message: \`Message delivered to 142 subscribers across \${notifChannel} channel.\`,
      type: 'success',
    })
  }

  const handleCreateLegalHold = () => {
    if (!newHoldTitle) return
    const newHold = {
      id: \`LH-2026-00\${legalHolds.length + 1}\`,
      caseNumber: newHoldCaseNumber,
      title: newHoldTitle,
      custodian: activePersona.name,
      recordCount: 45,
      status: 'ACTIVE',
      holdScope: newHoldScope,
    }
    setLegalHolds(prev => [newHold, ...prev])
    logAuditEvent({
      action: 'LEGAL_HOLD_ESTABLISHED',
      actor: activePersona.name,
      target: newHold.caseNumber,
      details: \`Litigation legal hold established: \${newHold.title}. Automated file deletion suspended.\`,
      severity: 'WARNING',
    })
    addToast({
      title: 'Legal Hold Activated',
      message: \`\${newHold.caseNumber} registered. Records locked from disposition under NARA 36 CFR.\`,
      type: 'success',
    })
    setNewHoldModalOpen(false)
    setNewHoldTitle('')
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {meta.number} // {meta.badge}
                </span>
                <span className="text-xs text-slate-400">{meta.standards}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Service Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {meta.title}
              </h1>
              <p className="text-xs text-slate-400">
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunDiagnostic}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Run Diagnostic</span>
            </Button>
            {currentService === 'identity' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTestCertModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Test PIV / OCSP</span>
              </Button>
            )}
            {currentService === 'governance' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNewHoldModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>New Legal Hold</span>
              </Button>
            )}
            {currentService === 'integrations' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleReDriveDeadLetter}
                disabled={deadLetterCount === 0}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Re-Drive Dead Letter ({deadLetterCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          {meta.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }\`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {meta.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
            <div className="text-slate-500 text-xs mb-1 font-medium">{kpi.label}</div>
            <div className={\`text-xl font-bold font-mono \${kpi.status || 'text-slate-900'}\`}>
              {kpi.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{kpi.detail}</div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. IDENTITY & PIV VALIDATION SERVICE SCREENS */}
      {/* ========================================================= */}
      {currentService === 'identity' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Authoritative Personnel & PIV Token Directory</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Authoritative smart card credentials certified under FIPS 201-3 with hardware cryptographic keystores</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <Input
                      placeholder="Search officer or PIV..."
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      className="pl-8 text-xs h-8 w-48"
                    />
                  </div>
                  <Select
                    value={certFilter}
                    onChange={(e) => setCertFilter(e.target.value as any)}
                    className="text-xs h-8"
                  >
                    <option value="ALL">All Enrolled</option>
                    <option value="VALID">Valid Tokens</option>
                    <option value="REVOKED">Revoked</option>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {personas
                    .filter(p => !certSearch || p.name.toLowerCase().includes(certSearch.toLowerCase()) || p.pivCardId.toLowerCase().includes(certSearch.toLowerCase()))
                    .filter(p => {
                      if (certFilter === 'REVOKED') return certRevocations.includes(p.pivCardId)
                      if (certFilter === 'VALID') return !certRevocations.includes(p.pivCardId)
                      return true
                    })
                    .map((user) => {
                      const isRevoked = certRevocations.includes(user.pivCardId)
                      return (
                        <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {user.avatarInitials}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                                <span className="text-xs text-slate-500 font-mono">({user.pivCardId})</span>
                                <Badge classification={user.clearanceLevel} />
                                {isRevoked ? (
                                  <Badge variant="critical">REVOKED</Badge>
                                ) : (
                                  <Badge variant="nominal" dot>VALIDATED</Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {user.roleLabel} • {user.department} • Agency ID: <span className="font-mono text-cyan-800">{user.agencyId}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTestPivInput(user.pivCardId)
                                setTestCertModalOpen(true)
                                handleTestPivCard()
                              }}
                              className="text-xs text-slate-700"
                            >
                              <KeyRound className="w-3 h-3 mr-1 text-slate-500" />
                              Verify OCSP
                            </Button>
                            {!isRevoked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeCert(user.pivCardId, user.name)}
                                className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                Revoke Token
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCertRevocations(prev => prev.filter(id => id !== user.pivCardId))
                                  addToast({ title: 'Token Reinstated', message: \`\${user.name} restored to valid standing.\`, type: 'success' })
                                }}
                                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              >
                                Reinstate
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ocsp' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-900">Real-Time OCSP Responder Diagnostics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <p className="text-slate-600">
                    Submit any PIV/CAC card serial or Federal X.509 certificate subject DN to perform a real-time Online Certificate Status Protocol revocation check against the Federal Common Policy CA root.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={testPivInput}
                      onChange={(e) => setTestPivInput(e.target.value)}
                      placeholder="Enter PIV Card Serial..."
                      className="font-mono text-xs"
                    />
                    <Button variant="primary" size="sm" onClick={handleTestPivCard}>
                      Query OCSP
                    </Button>
                  </div>
                  {testOcspResult && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">OCSP Status Response:</span>
                        <span className={\`font-mono font-bold \${testOcspResult.status.includes('VALIDATED') ? 'text-emerald-700' : 'text-rose-700'}\`}>
                          {testOcspResult.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cryptographic Standard:</span>
                        <span className="font-mono text-slate-800">{testOcspResult.fips}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Authoritative Certificate Subject:</span>
                        <span className="font-mono text-slate-800 break-all">{testOcspResult.certChain}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-900">Federal Root CA Trust Chain Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Federal Common Policy CA G2</span>
                      <span className="text-slate-500 text-[11px] font-mono">SHA-384 / RSA-4096 • Expires 2038</span>
                    </div>
                    <Badge variant="nominal" dot>ONLINE</Badge>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">DHS Identity & Credential Intermediate CA</span>
                      <span className="text-slate-500 text-[11px] font-mono">SHA-384 / ECDSA P-384 • Active</span>
                    </div>
                    <Badge variant="nominal" dot>ONLINE</Badge>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Post-Quantum ML-KEM Key Exchange Broker</span>
                      <span className="text-slate-500 text-[11px] font-mono">NIST FIPS 203 Validated • Hybrid Mode</span>
                    </div>
                    <Badge variant="nominal" dot>PILOT NOMINAL</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'pam' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Privileged Access Management (PAM) Quorum</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Dual-custody authorization required for administrative elevation under NIST SP 800-53 AC-5</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setPamQuorumModalOpen(true)}>
                  Request Privilege Elevation
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Strict Separation of Duties Active</span>
                    <p className="text-amber-800 text-xs mt-0.5">
                      No single operator may unilaterally modify cryptographic root anchors, export un-redacted mass BWC archives, or trigger national broadcast overrides without second-party cryptographic sign-off.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 pt-2">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">Root Key Rotation Quorum</span>
                      <p className="text-slate-500 text-[11px]">Requires Agency Owner + Watch Commander authorization</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      2 of 2 Approvals Quorum
                    </span>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">Federal Evidence Expungement Protocol</span>
                      <p className="text-slate-500 text-[11px]">Requires Evidence Custodian + Privacy Auditor authorization</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      2 of 2 Approvals Quorum
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'revocation' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Blacklisted & Revoked Credentials Ledger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {certRevocations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">Zero Active Revocations</p>
                    <p className="text-xs text-slate-400 mt-0.5">All enrolled agency credentials are confirmed in good standing.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {certRevocations.map((piv) => (
                      <div key={piv} className="p-3 bg-rose-50 border border-rose-200 rounded flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-rose-900">{piv}</span>
                          <span className="text-rose-700 text-xs block">Revocation Reason: Emergency Administrative Invalidation</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCertRevocations(prev => prev.filter(id => id !== piv))
                            addToast({ title: 'Token Reinstated', message: \`\${piv} reinstated.\`, type: 'success' })
                          }}
                          className="text-xs text-emerald-700 border-emerald-200"
                        >
                          Reinstate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ZERO TRUST & SECURITY POLICY ENGINE */}
      {/* ========================================================= */}
      {currentService === 'security-policy' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Dynamic ABAC Boundary Rules (NIST SP 800-207)</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time evaluation rules enforced across API gateways and inter-enclave proxies</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToast({ title: 'Policy Set Exported', message: 'Signed ABAC policy package generated.', type: 'info' })}
                >
                  Export XACML / JSON
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {abacRules.map((rule) => (
                    <div key={rule.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{rule.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {rule.id}
                          </span>
                          <span className={\`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold \${
                            rule.effect === 'DENY'
                              ? 'bg-rose-100 text-rose-800'
                              : rule.effect === 'REQUIRE_MFA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }\`}>
                            {rule.effect}
                          </span>
                        </div>
                        <p className="text-slate-500 font-mono text-[11px] mt-1">
                          MATCH: subject [{rule.subject}] ON target [{rule.resource}]
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleAbacRule(rule.id)}
                          className={\`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer \${
                            rule.enabled
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }\`}
                        >
                          {rule.enabled ? 'ACTIVE ENFORCED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'evaluator' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Real-Time Policy Decision Point (PDP) Simulator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Simulate an attribute-based access request to inspect PDP decision trace, evaluated rule precedence, and sub-millisecond execution latency.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Persona</label>
                    <Select
                      value={policyTesterSubject}
                      onChange={(e) => setPolicyTesterSubject(e.target.value)}
                      className="w-full text-xs"
                    >
                      {personas.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.roleLabel} - {p.clearanceLevel})</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Resource / Action Target</label>
                    <Input
                      value={policyTesterResource}
                      onChange={(e) => setPolicyTesterResource(e.target.value)}
                      placeholder="e.g. enclave:SIPRNET or portal:LOCKDOWN_RELEASE"
                      className="w-full text-xs font-mono"
                    />
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={handleEvaluatePolicy}>
                  Evaluate Access Decision
                </Button>

                {policyDecisionResult && (
                  <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">PDP Policy Decision:</span>
                      <span className={\`font-mono text-sm font-bold \${policyDecisionResult.decision === 'ALLOW' ? 'text-emerald-700' : 'text-rose-700'}\`}>
                        {policyDecisionResult.decision}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Evaluated Rule: <span className="font-semibold text-slate-800">{policyDecisionResult.matchedRule}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono">
                      Evaluation Latency: {policyDecisionResult.latencyMs} ms • Policy Engine: Rust Micro-PEP v3.2
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'enclaves' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">CUI Enclave</span>
                <p className="text-slate-500">Controlled Unclassified Information enclave for law enforcement CAD & P25 telemetry.</p>
                <div className="pt-2 font-mono text-[11px] text-emerald-700 font-bold">STATUS: ENFORCED // NOMINAL</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">FEDCON Enclave</span>
                <p className="text-slate-500">Federal contractor and mutual aid inter-agency data partition with strict redaction.</p>
                <div className="pt-2 font-mono text-[11px] text-blue-700 font-bold">STATUS: ISOLATED // NOMINAL</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">SECRET // NOFORN Bridge</span>
                <p className="text-slate-500">Cross-domain solution gateway requiring CSfC dual-layer encryption and hardware token.</p>
                <div className="pt-2 font-mono text-[11px] text-purple-700 font-bold">STATUS: ACTIVE // GUARDED</div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INTEGRATION FABRIC & APIS */}
      {/* ========================================================= */}
      {currentService === 'integrations' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">CloudEvents Event Bus Ledger (v1.0)</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Asynchronous pub/sub event pipeline connecting all 16 mission applications</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const newEvt = {
                      id: \`evt-\${Date.now().toString().slice(-4)}\`,
                      type: 'gov.dhs.vanguard.admin.manual_probe',
                      source: 'admin-console',
                      schema: 'cloudevents-v1.0',
                      status: 'ACKNOWLEDGED',
                      latency: '3ms',
                      timestamp: 'Just now',
                    }
                    setFabricEvents(prev => [newEvt, ...prev])
                    addToast({ title: 'Event Dispatched', message: 'Manual probe event transmitted across CloudEvents fabric.', type: 'info' })
                  }}
                >
                  Publish Probe Event
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {fabricEvents.map((evt) => (
                    <div key={evt.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{evt.type}</span>
                          <span className="font-mono text-[10px] text-slate-400">({evt.id})</span>
                          <span className={\`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded \${
                            evt.status === 'DEAD_LETTER'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }\`}>
                            {evt.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                          Source: {evt.source} • Latency: {evt.latency} • {evt.timestamp}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{evt.schema}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'adapters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">NG911 Emergency ESInet Bridge</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">NENA i3 SIP/RTP ingress adapter with TLS 1.3 mutual auth.</p>
                <div className="font-mono text-[11px] text-slate-500">Latency: 2ms • Packet Loss: 0.00%</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">P25 Radio ISSI / CSSI Core</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">Inter-RF Subsystem Interface bridge to Motorola ASTRO 25 / L3Harris cores.</p>
                <div className="font-mono text-[11px] text-slate-500">Active Channels: 6 • Jitter: &lt; 5ms</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">PACS OSDP v2 Access Controllers</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">SIA OSDP v2 Secure Channel protocol adapter for portal controllers.</p>
                <div className="font-mono text-[11px] text-slate-500">Controlled Doors: 28 • Tamper Alarms: 0</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Critical Connect Interop Bridge</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">Cloud federation gateway linking FPS, USSS, and local police dispatch.</p>
                <div className="font-mono text-[11px] text-slate-500">Active Patches: 3 • Encryption: AES-256</div>
              </Card>
            </div>
          )}

          {activeTab === 'deadletter' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Dead-Letter Poison Queue Inspector</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Isolated messages that failed schema validation or delivery thresholds</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReDriveDeadLetter}
                  disabled={deadLetterCount === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Re-Drive All Poison Messages ({deadLetterCount})
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {deadLetterCount === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">Dead-Letter Queue Clean</p>
                    <p className="text-xs text-slate-400 mt-0.5">Zero poison events requiring operator intervention.</p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-900">gov.dhs.vanguard.cap.mass_alert_issued</span>
                      <span className="font-mono text-xs text-rose-700">evt-8895</span>
                    </div>
                    <p className="text-rose-800 text-xs">
                      Error: Target broker endpoint timed out after 3 retries (120ms latency threshold exceeded).
                    </p>
                    <div className="flex justify-end pt-1">
                      <Button variant="outline" size="sm" onClick={handleReDriveDeadLetter} className="text-xs text-rose-800 border-rose-300">
                        Re-Drive Single Event
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. WORKFLOW & APPROVAL INBOX */}
      {/* ========================================================= */}
      {currentService === 'workflows' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Unified Operational Approval Queue</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Multi-tier authorizations requiring dual-custody approval before execution</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{task.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">({task.id})</span>
                          <span className={\`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded \${
                            task.status === 'WAITING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : task.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }\`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">{task.description}</p>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                          Priority: {task.priority} • Due: {task.dueDate} • Assigned: {task.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {task.status === 'WAITING_APPROVAL' ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                updateTaskStatus(task.id, 'APPROVED')
                                addToast({ title: 'Task Approved', message: \`\${task.title} authorized under \${activePersona.name} credentials.\`, type: 'success' })
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateTaskStatus(task.id, 'BLOCKED')
                                addToast({ title: 'Task Rejected', message: \`\${task.title} rejected and returned to requester.\`, type: 'warning' })
                              }}
                              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant="nominal">AUTHORIZED</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Historical Decision Ledger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Mass Evacuation Notification Release</span>
                    <span className="text-[11px] text-slate-500">Authorized by Cmdr. Marcus Vance (PIV-9902-8812-441)</span>
                  </div>
                  <Badge variant="nominal">COMPLETED</Badge>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Federal Courthouse West Portal Lockdown Override</span>
                    <span className="text-[11px] text-slate-500">Authorized by Agent Sarah Lin (PIV-7714-3091-882)</span>
                  </div>
                  <Badge variant="nominal">COMPLETED</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'delegations' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Supervisor Standing Delegations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Temporary delegations of approval authority under active continuity of operations (COOP) directives.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Night Watch Standing Delegation</span>
                    <span className="text-slate-500 text-[11px]">Primary: Cmdr. Marcus Vance &rarr; Delegate: Sarah Lin</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">ACTIVE UNTIL 08:00 UTC</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. UNIFIED NOTIFICATION CENTER */}
      {/* ========================================================= */}
      {currentService === 'notifications' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Multi-Channel Broadcast Dispatcher</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative mass alert transmission complying with Common Alerting Protocol (CAP v1.2)</p>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Subscriber Group</label>
                    <Select
                      value={notifTargetGroup}
                      onChange={(e) => setNotifTargetGroup(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="ALL_UNITS">All Deployed Tactical Units (142)</option>
                      <option value="FPS_PATROL">FPS Regional Patrol Officers (48)</option>
                      <option value="USSS_SOD">USSS Special Operations Division (32)</option>
                      <option value="COMMAND_STAFF">Executive Command Staff (12)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Delivery Channel Protocol</label>
                    <Select
                      value={notifChannel}
                      onChange={(e) => setNotifChannel(e.target.value as any)}
                      className="w-full text-xs"
                    >
                      <option value="ALL">All Channels (Carrier SMS + Voice TTS + In-App Push)</option>
                      <option value="SMS">Carrier Direct SMS (FirstNet Priority)</option>
                      <option value="TTS_VOICE">Automated Text-To-Speech Telephony</option>
                      <option value="DESKTOP_TAKEOVER">Console Desktop Modal Takeover</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Broadcast Message Payload</label>
                  <textarea
                    rows={3}
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="Enter broadcast message text..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Signing Authority: <span className="font-semibold text-slate-800">{activePersona.name} ({activePersona.roleLabel})</span>
                  </span>
                  <Button variant="primary" size="sm" onClick={handleDispatchNotification} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Transmit Multi-Channel Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'channels' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">FirstNet Band 14 Direct Cellular</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">Wireless Priority Service (WPS) enabled carrier gateway.</p>
                <div className="font-mono text-[11px] text-emerald-700">Latency: 180ms • P99: 410ms</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">SIP Voice TTS Telephony Trunk</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">Concurrent line automated voice outbound dialer.</p>
                <div className="font-mono text-[11px] text-emerald-700">Lines: 64 Active • Capacity: 100%</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">WebPush &amp; In-App Notification Stream</span>
                  <Badge variant="nominal" dot>ONLINE</Badge>
                </div>
                <p className="text-slate-600">Encrypted WebSocket channel to all connected client consoles.</p>
                <div className="font-mono text-[11px] text-emerald-700">Connected Sockets: 42 • Latency: 12ms</div>
              </Card>
              <Card className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Commercial Secondary Failover SMS</span>
                  <Badge variant="nominal" dot>STANDBY</Badge>
                </div>
                <p className="text-slate-600">Twilio / AWS SNS commercial backup pathway.</p>
                <div className="font-mono text-[11px] text-slate-500">Standby • Failover Trigger: &gt; 3s timeout</div>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Historical Broadcast Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {massNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{notif.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">({notif.id})</span>
                          <Badge variant="nominal">DELIVERED</Badge>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">{notif.message}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">{notif.sentAt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DATA GOVERNANCE & LEGAL HOLD */}
      {/* ========================================================= */}
      {currentService === 'governance' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Litigation Legal Holds Registry (NARA 36 CFR Part 1236)</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Automated disposition suspended on all tagged case evidence and sensor telemetry</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setNewHoldModalOpen(true)}>
                  Establish Legal Hold
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {legalHolds.map((hold) => (
                    <div key={hold.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{hold.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">({hold.id})</span>
                          <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                            {hold.caseNumber}
                          </span>
                          <span className={\`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded \${
                            hold.status === 'ACTIVE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }\`}>
                            {hold.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">
                          Scope: <span className="font-mono text-slate-800">{hold.holdScope}</span> • Custodian: <span className="font-semibold">{hold.custodian}</span>
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {hold.recordCount} evidence records cryptographically preserved under WORM locks
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {hold.status === 'ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLegalHolds(prev => prev.map(h => h.id === hold.id ? { ...h, status: 'RELEASED' } : h))
                              addToast({ title: 'Hold Released', message: \`Legal hold \${hold.caseNumber} released to normal retention schedule.\`, type: 'info' })
                            }}
                            className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                          >
                            Release Hold
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLegalHolds(prev => prev.map(h => h.id === hold.id ? { ...h, status: 'ACTIVE' } : h))
                              addToast({ title: 'Hold Re-Activated', message: \`Legal hold \${hold.caseNumber} re-activated.\`, type: 'warning' })
                            }}
                            className="text-xs text-slate-700"
                          >
                            Re-Apply Hold
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'redaction' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Automated PII &amp; Facial Redaction Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Real-time redaction engine automatically obfuscates juvenile faces, undercover personnel, and bystander license plates prior to external disclosure or FOIA fulfillment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-bold text-slate-800 block">Facial Blurring Mode</span>
                    <p className="text-slate-500 text-[11px]">Gaussian 24px blur with facial landmark tracking.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-bold text-slate-800 block">Audio Bleeping Mask</span>
                    <p className="text-slate-500 text-[11px]">1 kHz sine tone on detected SSN, credit cards, or phone numbers.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-bold text-slate-800 block">License Plate Obfuscation</span>
                    <p className="text-slate-500 text-[11px]">Automated solid black bounding box overlay.</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToast({ title: 'Redaction Verification', message: 'All 142 redaction rules verified against Privacy Act baseline.', type: 'success' })}
                >
                  Verify Redaction Models
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'retention' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Authoritative NARA Retention Schedules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">GRS 5.6 - Security Facility Surveillance Video</span>
                      <p className="text-slate-500 text-[11px]">Mandatory 30-day retention unless tagged by incident or legal hold</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">30 DAYS (STANDARD)</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">GRS 6.1 - Body-Worn Video Evidentiary Recordings</span>
                      <p className="text-slate-500 text-[11px]">3-year mandatory preservation from case disposition</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">3 YEARS (EVIDENTIARY)</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">GRS 5.1 - Tamper-Evident System Audit Ledgers</span>
                      <p className="text-slate-500 text-[11px]">7-year permanent federal compliance archive</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">7 YEARS (PERMANENT)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TAMPER-EVIDENT AUDIT LEDGER */}
      {/* ========================================================= */}
      {currentService === 'audit' && (
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Cryptographic WORM Audit Journal (NIST SP 800-53 AU-3)</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Authoritative tamper-evident event stream with forward SHA-256 hash chaining</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <Input
                      placeholder="Search actor or action..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-8 w-44"
                    />
                  </div>
                  <Select
                    value={auditSeverityFilter}
                    onChange={(e) => setAuditSeverityFilter(e.target.value as any)}
                    className="text-xs h-8"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="WARNING">Warning</option>
                    <option value="INFO">Info</option>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {auditLogs
                    .filter(log => !auditSearchQuery || log.actor.toLowerCase().includes(auditSearchQuery.toLowerCase()) || log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()))
                    .filter(log => auditSeverityFilter === 'ALL' || log.severity === auditSeverityFilter)
                    .map((log) => (
                      <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">{log.action}</span>
                            <span className="font-mono text-[10px] text-slate-400">({log.id})</span>
                            <span className={\`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded \${
                              log.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }\`}>
                              {log.severity}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mt-0.5">{log.details}</p>
                          <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                            Actor: <span className="text-slate-700 font-semibold">{log.actor}</span> &bull; Target: {log.target}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrity' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Continuous SHA-256 Hash Chain Proofs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Every transaction recorded into Vanguard Shield is cryptographically linked to its predecessor via SHA-256 chaining. Modifying any prior block breaks the verification digest.
                </p>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] space-y-1.5">
                  <div className="text-slate-500">Root Merkle Anchor:</div>
                  <div className="text-cyan-800 font-bold break-all">
                    0x8f3b2a99c7d1e405a3b9871e2c6f108d33a9c7b4e2d1f05a6b8c9d0e1f2a3b4c
                  </div>
                  <div className="text-slate-500 pt-2">Current Ledger Head Hash:</div>
                  <div className="text-emerald-700 font-bold break-all">
                    0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToast({ title: 'Cryptographic Proof Validated', message: 'All 8,419 Merkle branches match authoritative HSM state.', type: 'success' })}
                >
                  Verify Ledger Integrity
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'export' && (
            <Card className="bg-white border border-slate-200 rounded-lg shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Inspector General Cryptographic Compliance Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Package and sign an immutable archive of all system actions, user authentication events, and administrative decisions for federal oversight under Inspector General mandates.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addToast({ title: 'Cryptographic Package Exported', message: 'Signed JSON-LD audit bundle downloaded.', type: 'success' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Export Signed JSON-LD Bundle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToast({ title: 'PDF Report Generated', message: 'FIPS 140-3 verified compliance summary created.', type: 'info' })}
                  >
                    Generate PDF Compliance Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MODAL: TEST PIV CARD */}
      <Modal
        isOpen={testCertModalOpen}
        onClose={() => setTestCertModalOpen(false)}
        title="FIPS 201-3 PIV Token & OCSP Verification"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Simulate hardware smart card insertion and mutual TLS handshake with Online Certificate Status Protocol revocation verification.
          </p>
          <div>
            <label className="font-bold text-slate-700 block mb-1">PIV Card Serial Number</label>
            <Input
              value={testPivInput}
              onChange={(e) => setTestPivInput(e.target.value)}
              placeholder="e.g. PIV-9902-8812-441"
              className="font-mono text-xs"
            />
          </div>
          {testOcspResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
              <div className="font-bold text-slate-800">OCSP Verification Result:</div>
              <div className={\`font-mono font-bold \${testOcspResult.status.includes('VALIDATED') ? 'text-emerald-700' : 'text-rose-700'}\`}>
                {testOcspResult.status}
              </div>
              <div className="text-slate-500 text-[11px]">{testOcspResult.fips}</div>
              <div className="text-slate-600 font-mono text-[10px] break-all">{testOcspResult.certChain}</div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setTestCertModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleTestPivCard}>
              Execute OCSP Query
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: REQUEST PAM ELEVATION */}
      <Modal
        isOpen={pamQuorumModalOpen}
        onClose={() => setPamQuorumModalOpen(false)}
        title="Request Privileged Access Elevation (PAM)"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Submit a dual-custody authorization request for administrative privilege escalation under NIST SP 800-53 AC-5.
          </p>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Requesting Officer</label>
            <Input
              disabled
              value={\`\${activePersona.name} (\${activePersona.roleLabel})\`}
              className="bg-slate-50 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Operational Justification / Ticket ID</label>
            <Input
              value={pamPrivilegeReason}
              onChange={(e) => setPamPrivilegeReason(e.target.value)}
              placeholder="Enter justification..."
              className="text-xs"
            />
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
            Notice: Escalation requests notify all active Watch Commanders. A second hardware PIV pin is mandatory to complete elevation.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPamQuorumModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                logAuditEvent({
                  action: 'PAM_ELEVATION_REQUESTED',
                  actor: activePersona.name,
                  target: 'Privileged Access Management',
                  details: \`Privilege elevation requested: \${pamPrivilegeReason}\`,
                  severity: 'WARNING',
                })
                addToast({
                  title: 'Quorum Request Dispatched',
                  message: 'Elevation ticket submitted to Watch Commander queue.',
                  type: 'info',
                })
                setPamQuorumModalOpen(false)
              }}
            >
              Submit for Quorum Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: NEW LEGAL HOLD */}
      <Modal
        isOpen={newHoldModalOpen}
        onClose={() => setNewHoldModalOpen(false)}
        title="Establish Federal Litigation Legal Hold"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Impose an authoritative legal hold to suspend automated record disposition under NARA 36 CFR Part 1236.
          </p>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Case Number / Docket ID</label>
            <Input
              value={newHoldCaseNumber}
              onChange={(e) => setNewHoldCaseNumber(e.target.value)}
              placeholder="e.g. CR-2026-9401"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Investigation Title</label>
            <Input
              value={newHoldTitle}
              onChange={(e) => setNewHoldTitle(e.target.value)}
              placeholder="e.g. Perimeter Intrusion Telemetry Hold"
              className="text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Hold Scope &amp; Target Systems</label>
            <Input
              value={newHoldScope}
              onChange={(e) => setNewHoldScope(e.target.value)}
              placeholder="e.g. VMS Surveillance Feeds, BWC Video, P25 Radio Audio"
              className="text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNewHoldModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateLegalHold} disabled={!newHoldTitle}>
              Establish Legal Hold
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default SharedServicePage
`;

fs.writeFileSync(path.resolve('./src/pages/services/SharedServicePage.tsx'), sharedServicePageContent, 'utf-8');
console.log('SharedServicePage.tsx written successfully.');
