import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck2,
  FolderLock,
  Eye,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Download,
  Share2,
  FileText,
  Video,
  Mic,
  HardDrive,
  Camera,
  Car,
  KeyRound,
  Trash2,
  Layers,
  Award,
  Sparkles,
  Info,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import {
  EvidenceRecord,
  CustodyEvent,
  EvidenceDerivative,
  DisclosureGrant,
  RetentionPolicy,
} from '../../types/modules'

type TabType =
  | 'workspace'
  | 'intake'
  | 'redaction'
  | 'disclosure'
  | 'retention-hold'
  | 'custody-ledger'

export default function DEMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace')
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('evd-9041')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [holdFilter, setHoldFilter] = useState<string>('ALL')

  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false)
  const [newEvdNumber, setNewEvdNumber] = useState(`EVD-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  const [newEvdTitle, setNewEvdTitle] = useState('')
  const [newEvdCategory, setNewEvdCategory] = useState<EvidenceRecord['category']>('BODY_WORN_VIDEO')
  const [newEvdSourceDevice, setNewEvdSourceDevice] = useState('VRSM-BW-441')
  const [newEvdCustodian, setNewEvdCustodian] = useState('Morgan Bennett')
  const [newEvdCaseId, setNewEvdCaseId] = useState('inc-8812')
  const [newEvdRetention, setNewEvdRetention] = useState('FEDERAL_LITIGATION_HOLD_7YR')
  const [newEvdClassification, setNewEvdClassification] = useState<EvidenceRecord['classification']>('CUI')
  const [newEvdLegalHold, setNewEvdLegalHold] = useState(true)

  const [isLegalHoldModalOpen, setIsLegalHoldModalOpen] = useState(false)
  const [holdTargetEvidence, setHoldTargetEvidence] = useState<EvidenceRecord | null>(null)
  const [holdReason, setHoldReason] = useState('Preservation requested under 18 U.S.C. § 1519')

  const [isNewDerivativeModalOpen, setIsNewDerivativeModalOpen] = useState(false)
  const [derivativeTitle, setDerivativeTitle] = useState('')
  const [derivativeRedactionType, setDerivativeRedactionType] = useState<EvidenceDerivative['redactionType']>('FACE_BLUR')
  const [derivativeNotes, setDerivativeNotes] = useState('')

  const [isDisclosureModalOpen, setIsDisclosureModalOpen] = useState(false)
  const [disclosureCaseNumber, setDisclosureCaseNumber] = useState('USAO-2026-CR-0418')
  const [disclosureAgency, setDisclosureAgency] = useState('U.S. Attorney’s Office for the District of Columbia')
  const [disclosureRecipient, setDisclosureRecipient] = useState('AUSA Katherine Miller')
  const [disclosurePurpose, setDisclosurePurpose] = useState('Federal Rule of Criminal Procedure 16 Mandatory Discovery')
  const [disclosureWatermark, setDisclosureWatermark] = useState('RESTRICTED USAO-NCR DISCOVERY - DO NOT RE-DISCLOSE')

  const [isCustodyReportModalOpen, setIsCustodyReportModalOpen] = useState(false)

  // Store bindings
  const {
    evidenceRecords,
    custodyEvents,
    evidenceDerivatives,
    disclosureGrants,
    retentionPolicies,
    incidents,
    ingestEvidenceItem,
    toggleLegalHold,
    verifyEvidenceHash,
    createEvidenceDerivative,
    approveDerivative,
    grantDisclosure,
    revokeDisclosure,
    addToast,
    logAuditEvent,
    activeAgencyId,
  } = useVanguardStore()

  // Selected Evidence Item
  const selectedEvidence = useMemo(() => {
    return evidenceRecords.find(e => e.id === selectedEvidenceId) || evidenceRecords[0] || null
  }, [evidenceRecords, selectedEvidenceId])

  // Filtered Evidence Records
  const filteredEvidence = useMemo(() => {
    return evidenceRecords.filter(item => {
      const matchesSearch =
        item.evidenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceDeviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
      const matchesHold =
        holdFilter === 'ALL' ||
        (holdFilter === 'HOLD_ACTIVE' && item.legalHold) ||
        (holdFilter === 'HOLD_NONE' && !item.legalHold)
      return matchesSearch && matchesCategory && matchesHold
    })
  }, [evidenceRecords, searchQuery, categoryFilter, holdFilter])

  // Custody events for selected evidence
  const selectedEvidenceCustody = useMemo(() => {
    if (!selectedEvidence) return []
    return custodyEvents.filter(c => c.evidenceId === selectedEvidence.id)
  }, [custodyEvents, selectedEvidence])

  // Handlers
  const handleIngestEvidence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvdTitle.trim()) return

    ingestEvidenceItem({
      evidenceNumber: newEvdNumber,
      title: newEvdTitle,
      category: newEvdCategory,
      sourceDeviceId: newEvdSourceDevice,
      custodian: newEvdCustodian,
      retentionSchedule: newEvdRetention,
      legalHold: newEvdLegalHold,
      classification: newEvdClassification,
      caseId: newEvdCaseId,
      fileSizeBytes: 1850000000,
      durationSec: 1200,
    })

    setIsIntakeModalOpen(false)
    setNewEvdTitle('')
    setNewEvdNumber(`EVD-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  const handleConfirmLegalHold = (e: React.FormEvent) => {
    e.preventDefault()
    if (!holdTargetEvidence) return
    toggleLegalHold(holdTargetEvidence.id, holdReason)
    setIsLegalHoldModalOpen(false)
    setHoldTargetEvidence(null)
  }

  const handleCreateDerivative = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvidence || !derivativeTitle.trim()) return

    createEvidenceDerivative({
      originalEvidenceId: selectedEvidence.id,
      evidenceNumber: selectedEvidence.evidenceNumber,
      derivativeTitle,
      redactionType: derivativeRedactionType,
      appliedBy: 'Morgan Bennett',
      reviewNotes: derivativeNotes,
    })

    setIsNewDerivativeModalOpen(false)
    setDerivativeTitle('')
    setDerivativeNotes('')
  }

  const handleGrantDisclosure = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvidence) return

    grantDisclosure({
      evidenceId: selectedEvidence.id,
      evidenceNumber: selectedEvidence.evidenceNumber,
      caseNumber: disclosureCaseNumber,
      recipientAgency: disclosureAgency,
      recipientName: disclosureRecipient,
      purpose: disclosurePurpose,
      watermarkText: disclosureWatermark,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    setIsDisclosureModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 06 // DEMS
                </span>
                <span className="text-xs text-slate-400">CJIS 5.4 / NARA GRS 4.2 / SHA-256</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SHA-256 Seal Valid
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Digital Evidence Management System (DEMS)
              </h1>
              <p className="text-xs text-slate-400">
                Verifiable chain of custody, cryptographic SHA-256 integrity validation, derivative redactions, statutory retention holds, and legal discovery disclosure.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (selectedEvidence) verifyEvidenceHash(selectedEvidence.id)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Active Hash</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsCustodyReportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Custody Certificate</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsIntakeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Evidence</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Evidence Repository &amp; Workspace</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {evidenceRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'intake'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Evidence Intake &amp; Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('redaction')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'redaction'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Review &amp; Redaction Studio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/60">
              {evidenceDerivatives.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('disclosure')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'disclosure'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Disclosure &amp; Discovery Portal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
              {disclosureGrants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('retention-hold')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'retention-hold'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Retention Schedules &amp; Legal Holds</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {retentionPolicies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custody-ledger')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'custody-ledger'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Verifiable Chain-of-Custody</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-indigo-300 border border-blue-700/50">
              {custodyEvents.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Evidence Records</span>
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {evidenceRecords.length}{' '}
            <span className="text-xs font-semibold text-emerald-600 font-sans">Ingested</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% SHA-256 Sealed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Legal Holds</span>
            <FolderLock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            {evidenceRecords.filter(e => e.legalHold).length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Active</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Purge Protected</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Redaction Copies</span>
            <Layers className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {evidenceDerivatives.length}{' '}
            <span className="text-xs font-semibold text-teal-600 font-sans">Derivatives</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Originals Immutable</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Disclosures</span>
            <Share2 className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            {disclosureGrants.filter(d => d.accessStatus === 'ACTIVE').length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Grants</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Forensic Watermarking</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Custody Ledger</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 font-mono">
            {custodyEvents.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Events</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Tamper-Evident Ledger</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Retention Policies</span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {retentionPolicies.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Enforced</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">NARA GRS Compliant</div>
        </div>
      </div>


      {/* TAB 1: EVIDENCE REPOSITORY & WORKSPACE */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Evidence Table Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filter Bar */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search evidence by number, title, device, or case..."
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="BODY_WORN_VIDEO">Body-Worn Video</option>
                      <option value="FACILITY_CCTV">Facility CCTV</option>
                      <option value="DISPATCH_AUDIO">Dispatch Audio</option>
                      <option value="DIGITAL_FORENSICS">Digital Forensics</option>
                      <option value="VEHICLE_DASHCAM">Vehicle Dashcam</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Legal Hold:</span>
                    <select
                      value={holdFilter}
                      onChange={e => setHoldFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ALL">All Items</option>
                      <option value="HOLD_ACTIVE">Hold Active</option>
                      <option value="HOLD_NONE">No Hold</option>
                    </select>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('ALL')
                    setHoldFilter('ALL')
                  }}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </CardContent>
            </Card>

            {/* Evidence Records List Table */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="py-3 px-4">Evidence # &amp; Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Source Device</th>
                      <th className="py-3 px-4">Custodian</th>
                      <th className="py-3 px-4">Legal Hold</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {filteredEvidence.map(item => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedEvidenceId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedEvidenceId === item.id
                            ? 'bg-blue-950/40 text-white'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {item.evidenceNumber}
                            {item.legalHold && (
                              <FolderLock className="w-3.5 h-3.5 text-amber-400 inline shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] font-sans text-slate-500 truncate max-w-xs">
                            {item.title}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-teal-300 text-[10px]">
                            {item.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-sans">{item.sourceDeviceId}</td>
                        <td className="py-3 px-4 text-slate-600 font-sans">{item.custodian}</td>
                        <td className="py-3 px-4">
                          {item.legalHold ? (
                            <Badge variant="warning">HOLD ACTIVE</Badge>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Routine</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              item.status === 'REDACTED'
                                ? 'nominal'
                                : item.status === 'DISCLOSED'
                                ? 'info'
                                : item.status === 'UNDER_REVIEW'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {item.status || 'INGESTED'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedEvidenceId(item.id)
                              verifyEvidenceHash(item.id)
                            }}
                          >
                            Verify
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Panel: Selected Evidence Inspector */}
          <div className="space-y-4">
            {selectedEvidence && (
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-blue-400" />
                        {selectedEvidence.evidenceNumber}
                      </CardTitle>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Case: {selectedEvidence.caseId}
                      </div>
                    </div>
                    <Badge variant={selectedEvidence.classification === 'SECRET' ? 'critical' : 'classification'}>
                      {selectedEvidence.classification}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Simulated Media Player Preview */}
                  <div className="w-full h-36 bg-black rounded-lg border border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600/80 rounded text-[9px] font-mono text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ORIGINAL MASTER
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-500">
                      {selectedEvidence.durationSec ? `${Math.floor(selectedEvidence.durationSec / 60)}m ${selectedEvidence.durationSec % 60}s` : 'PCAP/FILE'}
                    </div>

                    <div className="w-12 h-12 rounded-full bg-blue-600/80 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Eye className="w-6 h-6" />
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      <span className="truncate max-w-[140px]">{selectedEvidence.title}</span>
                      <span className="text-teal-300">
                        {selectedEvidence.fileSizeBytes ? `${(selectedEvidence.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '18.5 MB'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Attributes */}
                  <div className="space-y-2 text-xs">
                    <div className="py-1 border-b border-slate-100">
                      <span className="text-slate-500 block mb-0.5">SHA-256 Cryptographic Seal:</span>
                      <div className="font-mono text-[10px] text-emerald-400 break-all bg-slate-50 p-1.5 rounded border border-slate-200">
                        {selectedEvidence.sha256Hash}
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Source Device:</span>
                      <span className="font-mono text-white">{selectedEvidence.sourceDeviceId}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Current Custodian:</span>
                      <span className="font-mono text-white">{selectedEvidence.custodian}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Retention Schedule:</span>
                      <span className="font-mono text-teal-300">{selectedEvidence.retentionSchedule}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Legal Hold State:</span>
                      <span className={`font-mono font-bold ${selectedEvidence.legalHold ? 'text-amber-400' : 'text-slate-500'}`}>
                        {selectedEvidence.legalHold ? 'ACTIVE LITIGATION HOLD' : 'NONE'}
                      </span>
                    </div>
                  </div>

                  {/* Inspector Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => verifyEvidenceHash(selectedEvidence.id)}
                    >
                      <Shield className="w-3.5 h-3.5 mr-1" />
                      Verify Hash Integrity
                    </Button>

                    <Button
                      size="sm"
                      variant={selectedEvidence.legalHold ? 'destructive' : 'outline'}
                      className="w-full text-xs"
                      onClick={() => {
                        setHoldTargetEvidence(selectedEvidence)
                        setIsLegalHoldModalOpen(true)
                      }}
                    >
                      <FolderLock className="w-3.5 h-3.5 mr-1" />
                      {selectedEvidence.legalHold ? 'Release Legal Hold' : 'Enforce Legal Hold'}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setIsNewDerivativeModalOpen(true)}
                      >
                        <Layers className="w-3.5 h-3.5 mr-1" />
                        Redact Copy
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/30"
                        onClick={() => setIsDisclosureModalOpen(true)}
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        Disclose
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Evidence Custody Stream */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Chain of Custody Events</span>
                  <span className="text-[10px] text-teal-400 font-mono">
                    {selectedEvidenceCustody.length} Logged
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 max-h-[220px] overflow-y-auto">
                {selectedEvidenceCustody.map(evt => (
                  <div
                    key={evt.id}
                    className="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="text-teal-300 font-bold">{evt.action}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[11px] text-white font-sans">{evt.notes}</div>
                    <div className="text-[10px] text-slate-500 font-sans italic">{evt.actorName} ({evt.actorAgency})</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE INTAKE & INGESTION */}
      {activeTab === 'intake' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Digital Evidence Ingestion Console
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct cryptographic ingest from Body-Worn Video (VRSM), facility CCTV, dashcam, dispatch audio, or forensic computer extractions.
                  </p>
                </div>
                <Badge variant="nominal">IMMUTABLE INTAKE</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleIngestEvidence} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Evidence Number (Auto-Generated)
                    </label>
                    <Input
                      type="text"
                      value={newEvdNumber}
                      onChange={e => setNewEvdNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Correlated CAD Incident / Case ID
                    </label>
                    <Select
                      value={newEvdCaseId}
                      onChange={e => setNewEvdCaseId(e.target.value)}
                    >
                      {incidents.map(inc => (
                        <option key={inc.id} value={inc.id}>
                          {inc.trackingNumber} - {inc.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Evidence Item Title &amp; Description
                  </label>
                  <Input
                    type="text"
                    value={newEvdTitle}
                    onChange={e => setNewEvdTitle(e.target.value)}
                    placeholder="e.g. North Gate Vehicle Egress Pursuit Body-Worn Video"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Category</label>
                    <Select
                      value={newEvdCategory}
                      onChange={e => setNewEvdCategory(e.target.value as any)}
                    >
                      <option value="BODY_WORN_VIDEO">Body-Worn Video</option>
                      <option value="FACILITY_CCTV">Facility CCTV</option>
                      <option value="DISPATCH_AUDIO">Dispatch Audio</option>
                      <option value="DIGITAL_FORENSICS">Digital Forensics / PCAP</option>
                      <option value="VEHICLE_DASHCAM">Vehicle Dashcam</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Source Device Identifier</label>
                    <Input
                      type="text"
                      value={newEvdSourceDevice}
                      onChange={e => setNewEvdSourceDevice(e.target.value)}
                      placeholder="e.g. VRSM-BW-441"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Primary Custodian PIV</label>
                    <Input
                      type="text"
                      value={newEvdCustodian}
                      onChange={e => setNewEvdCustodian(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Retention Schedule</label>
                    <Select
                      value={newEvdRetention}
                      onChange={e => setNewEvdRetention(e.target.value)}
                    >
                      <option value="FEDERAL_LITIGATION_HOLD_7YR">Federal Litigation Hold (7 Years)</option>
                      <option value="SECURITY_INCIDENT_3YR">Major Security Incident (3 Years)</option>
                      <option value="ROUTINE_DISPATCH_3YR">Routine Dispatch Telemetry (3 Years)</option>
                      <option value="CYBER_FORENSICS_10YR">Cyber Forensics (10 Years)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Classification Enclave</label>
                    <Select
                      value={newEvdClassification}
                      onChange={e => setNewEvdClassification(e.target.value as any)}
                    >
                      <option value="CUI">CUI // FEDCON</option>
                      <option value="UNCLASSIFIED">UNCLASSIFIED // FOUO</option>
                      <option value="SECRET">SECRET // NOFORN</option>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 font-mono">
                  <strong>CRYPTOGRAPHIC ASSURANCE:</strong> Upon submission, VanguardShield will compute a SHA-256 hash seal, register an intake event in the immutable custody ledger, and lock the original binary against alteration.
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('workspace')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Complete Ingestion &amp; Seal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: REVIEW & REDACTION STUDIO */}
      {activeTab === 'redaction' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Review &amp; Redaction Studio</h2>
              <p className="text-xs text-slate-500">
                Working copy derivative generation for public records, FOIA, and criminal discovery. Originals remain strictly immutable.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewDerivativeModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Redaction Derivative
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceDerivatives.map(drv => (
              <Card key={drv.id} className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-white">{drv.derivativeTitle}</CardTitle>
                      <div className="text-[11px] font-mono text-slate-500">
                        Derived from: {drv.evidenceNumber}
                      </div>
                    </div>
                    <Badge variant={drv.status === 'APPROVED' ? 'nominal' : 'warning'}>
                      {drv.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Redaction Technique</span>
                      <span className="font-mono text-teal-300">{drv.redactionType}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Applied By</span>
                      <span className="font-mono text-white">{drv.appliedBy}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Reviewed By</span>
                      <span className="font-mono text-blue-300">{drv.reviewedBy || 'Pending Review'}</span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Created At</span>
                      <span className="font-mono text-slate-600">
                        {new Date(drv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Derivative SHA-256:</span>
                    <div className="font-mono text-[10px] text-emerald-400 break-all bg-slate-50 p-1.5 rounded border border-slate-200">
                      {drv.derivativeSha256}
                    </div>
                  </div>

                  {drv.reviewNotes && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-white block mb-0.5">Reviewer Notes:</span>
                      {drv.reviewNotes}
                    </div>
                  )}

                  {drv.status === 'PENDING_APPROVAL' && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 text-xs"
                        onClick={() => approveDerivative(drv.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve Derivative
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCLOSURE & DISCOVERY PORTAL */}
      {activeTab === 'disclosure' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Legal Discovery &amp; Interagency Disclosure Portal</h2>
              <p className="text-xs text-slate-500">
                Authorized electronic disclosure packages for prosecutors, defense counsel, and oversight inspectors with dynamic forensic watermarking.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsDisclosureModalOpen(true)}
              className="text-xs"
            >
              <Share2 className="w-3.5 h-3.5 mr-1" />
              Issue Disclosure Grant
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disclosureGrants.map(grant => (
              <Card key={grant.id} className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-white">{grant.caseNumber}</CardTitle>
                      <div className="text-[11px] font-mono text-slate-500">
                        Evidence: {grant.evidenceNumber}
                      </div>
                    </div>
                    <Badge variant={grant.accessStatus === 'ACTIVE' ? 'nominal' : 'critical'}>
                      {grant.accessStatus}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Recipient Agency:</span>
                      <span className="font-mono text-white text-right">{grant.recipientAgency}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Authorized Recipient:</span>
                      <span className="font-mono text-teal-300">{grant.recipientName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Statutory Purpose:</span>
                      <span className="font-mono text-slate-600 text-right">{grant.purpose}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Access Expiration:</span>
                      <span className="font-mono text-amber-300">
                        {new Date(grant.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="py-1">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Forensic Watermark:</span>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] text-cyan-300">
                        "{grant.watermarkText}"
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    {grant.accessStatus === 'ACTIVE' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs"
                        onClick={() => revokeDisclosure(grant.id)}
                      >
                        Revoke Discovery Access
                      </Button>
                    ) : (
                      <div className="text-xs text-slate-400 font-mono text-center w-full">
                        Access Terminated &amp; Revoked
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RETENTION SCHEDULES & LEGAL HOLDS */}
      {activeTab === 'retention-hold' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">NARA Compliant Statutory Retention Schedules</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enforced federal lifecycle policies preventing premature destruction while automating defensible disposition.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retentionPolicies.map(pol => (
                <Card key={pol.id} className="bg-white border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-white">{pol.name}</CardTitle>
                      <Badge variant="nominal">{pol.retentionYears} YEARS</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Statutory Authority:</span>
                      <span className="font-mono text-teal-300 text-right">{pol.statutoryBasis}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Active Retained Evidence:</span>
                      <span className="font-mono text-white">{pol.activeEvidenceCount} Records</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Auto-Purge Post Expiration:</span>
                      <span className={`font-mono ${pol.autoPurgeEnabled ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {pol.autoPurgeEnabled ? 'ENABLED (WITH REVIEW)' : 'DISABLED (MANUAL SIGNOFF)'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-1">Active Litigation Holds (18 U.S.C. § 1519)</h2>
            <p className="text-xs text-slate-500 mb-4">
              Evidence locked under mandatory legal holds is exempt from all automated purging schedules until explicit judicial sign-off.
            </p>

            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono">
                    <tr>
                      <th className="py-3 px-4">Evidence #</th>
                      <th className="py-3 px-4">Case Association</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Custodian</th>
                      <th className="py-3 px-4">Hold Status</th>
                      <th className="py-3 px-4 text-right font-sans">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {evidenceRecords
                      .filter(e => e.legalHold)
                      .map(e => (
                        <tr key={e.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-white">{e.evidenceNumber}</td>
                          <td className="py-3 px-4 text-teal-300">{e.caseId}</td>
                          <td className="py-3 px-4 text-slate-600 font-sans">{e.title}</td>
                          <td className="py-3 px-4 text-white font-sans">{e.custodian}</td>
                          <td className="py-3 px-4">
                            <Badge variant="warning">PURGE LOCKED</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs font-sans"
                              onClick={() => {
                                setHoldTargetEvidence(e)
                                setIsLegalHoldModalOpen(true)
                              }}
                            >
                              Release Hold
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 6: VERIFIABLE CHAIN-OF-CUSTODY LEDGER */}
      {activeTab === 'custody-ledger' && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Federal Tamper-Evident Chain of Custody Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Every custodial access, hash verification, derivative generation, and disclosure transaction is cryptographically sealed under NIST SP 800-171.
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsCustodyReportModalOpen(true)}
                className="text-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Generate Audit Certificate
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Evidence #</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor &amp; Agency</th>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Cryptographic Seal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {custodyEvents.map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{evt.evidenceNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                          {evt.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-sans">
                        <div>{evt.actorName}</div>
                        <div className="text-[10px] text-slate-400">{evt.actorAgency}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans max-w-sm">{evt.notes}</td>
                      <td className="py-3 px-4 text-emerald-400 text-[10px] truncate max-w-[120px]">
                        {evt.sha256Seal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: Ingest Evidence Item */}
      <Modal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        title="Ingest Digital Evidence Item"
        maxWidth="lg"
      >
        <form onSubmit={handleIngestEvidence} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Evidence #</label>
              <Input
                type="text"
                value={newEvdNumber}
                onChange={e => setNewEvdNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Correlated Incident / Case</label>
              <Select
                value={newEvdCaseId}
                onChange={e => setNewEvdCaseId(e.target.value)}
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    {inc.trackingNumber} - {inc.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Evidence Title</label>
            <Input
              type="text"
              value={newEvdTitle}
              onChange={e => setNewEvdTitle(e.target.value)}
              placeholder="e.g. Corridor 4B Intrusion VRSM Footage"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Category</label>
              <Select
                value={newEvdCategory}
                onChange={e => setNewEvdCategory(e.target.value as any)}
              >
                <option value="BODY_WORN_VIDEO">Body-Worn Video</option>
                <option value="FACILITY_CCTV">Facility CCTV</option>
                <option value="DISPATCH_AUDIO">Dispatch Audio</option>
                <option value="DIGITAL_FORENSICS">Digital Forensics / PCAP</option>
                <option value="VEHICLE_DASHCAM">Vehicle Dashcam</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Source Device ID</label>
              <Input
                type="text"
                value={newEvdSourceDevice}
                onChange={e => setNewEvdSourceDevice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Custodian PIV</label>
              <Input
                type="text"
                value={newEvdCustodian}
                onChange={e => setNewEvdCustodian(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Retention Schedule</label>
              <Select
                value={newEvdRetention}
                onChange={e => setNewEvdRetention(e.target.value)}
              >
                <option value="FEDERAL_LITIGATION_HOLD_7YR">Federal Litigation Hold (7Y)</option>
                <option value="SECURITY_INCIDENT_3YR">Major Security Incident (3Y)</option>
                <option value="ROUTINE_DISPATCH_3YR">Routine Telemetry (3Y)</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsIntakeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Ingest &amp; Calculate Hash
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Legal Hold Toggle */}
      <Modal
        isOpen={isLegalHoldModalOpen}
        onClose={() => setIsLegalHoldModalOpen(false)}
        title={`Legal Hold Modification: ${holdTargetEvidence?.evidenceNumber || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmLegalHold} className="space-y-4">
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded text-xs text-amber-200">
            Modifying a preservation legal hold alters statutory purge protection under 18 U.S.C. § 1519. This transaction is permanently logged.
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Mandatory Justification / Order #</label>
            <Input
              type="text"
              value={holdReason}
              onChange={e => setHoldReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLegalHoldModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" size="sm">
              Confirm Hold Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Create Redaction Derivative */}
      <Modal
        isOpen={isNewDerivativeModalOpen}
        onClose={() => setIsNewDerivativeModalOpen(false)}
        title={`Create Redacted Working Copy: ${selectedEvidence?.evidenceNumber || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateDerivative} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Derivative Title</label>
            <Input
              type="text"
              value={derivativeTitle}
              onChange={e => setDerivativeTitle(e.target.value)}
              placeholder="e.g. Face-Redacted Public Disclosure Copy"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Redaction Technique</label>
            <Select
              value={derivativeRedactionType}
              onChange={e => setDerivativeRedactionType(e.target.value as any)}
            >
              <option value="FACE_BLUR">Face Blur (Non-Target Pedestrians)</option>
              <option value="AUDIO_MUTE">Audio Mute (PII / SSN / Addresses)</option>
              <option value="PII_MASK">PII Screen Masking</option>
              <option value="FULL_COMPOSITE">Full Composite (Face + Audio + PII)</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Reviewer Justification Notes</label>
            <Input
              type="text"
              value={derivativeNotes}
              onChange={e => setDerivativeNotes(e.target.value)}
              placeholder="e.g. Redacting juvenile faces pursuant to federal court order"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewDerivativeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Generate Derivative Copy
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Issue Disclosure Grant */}
      <Modal
        isOpen={isDisclosureModalOpen}
        onClose={() => setIsDisclosureModalOpen(false)}
        title={`Grant Legal Discovery Disclosure: ${selectedEvidence?.evidenceNumber || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleGrantDisclosure} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Court Case / Discovery Number</label>
            <Input
              type="text"
              value={disclosureCaseNumber}
              onChange={e => setDisclosureCaseNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Recipient Agency</label>
            <Input
              type="text"
              value={disclosureAgency}
              onChange={e => setDisclosureAgency(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Authorized Recipient Name</label>
            <Input
              type="text"
              value={disclosureRecipient}
              onChange={e => setDisclosureRecipient(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Forensic Watermark Text</label>
            <Input
              type="text"
              value={disclosureWatermark}
              onChange={e => setDisclosureWatermark(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDisclosureModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Authorize Disclosure Grant
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Custody Certificate Preview */}
      <Modal
        isOpen={isCustodyReportModalOpen}
        onClose={() => setIsCustodyReportModalOpen(false)}
        title="Federal Chain of Custody Audit Certificate"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-300 rounded-lg space-y-3 font-mono text-xs">
            <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-teal-400">
              <span className="font-bold">UNITED STATES GOVERNMENT // CHAIN OF CUSTODY CERTIFICATE</span>
              <span>NIST SP 800-171 VALIDATED</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-white">
              <div>Evidence Item: <span className="text-teal-300">{selectedEvidence?.evidenceNumber}</span></div>
              <div>Case Association: <span className="text-blue-300">{selectedEvidence?.caseId}</span></div>
              <div>Master Custodian: <span className="text-white">{selectedEvidence?.custodian}</span></div>
              <div>Classification: <span className="text-amber-300">{selectedEvidence?.classification}</span></div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Cryptographic Master Hash (SHA-256):</span>
              <div className="p-2 bg-white rounded border border-slate-200 text-emerald-400 break-all text-[11px]">
                {selectedEvidence?.sha256Hash}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <span className="text-slate-500 block mb-1">Recorded Custodial Transactions ({selectedEvidenceCustody.length}):</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedEvidenceCustody.map((c, i) => (
                  <div key={c.id} className="text-[11px] text-slate-600 border-l-2 border-teal-500 pl-2">
                    <span className="text-white font-bold">{i + 1}. [{c.action}]</span> {new Date(c.timestamp).toLocaleString()} — {c.notes} ({c.actorName})
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
              Generated by VanguardShield Unified Federal Security Operating System (UFSOS). Electronic evidence custody certified pursuant to Federal Rule of Evidence 902(13) &amp; 902(14).
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCustodyReportModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Custody Certificate Exported',
                  message: 'Cryptographic PDF audit certificate generated for court production',
                  type: 'success',
                })
                setIsCustodyReportModalOpen(false)
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Signed Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
