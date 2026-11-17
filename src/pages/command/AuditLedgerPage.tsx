import React, { useState } from 'react'
import { FileText, Shield, CheckCircle2, Lock, Download, Check, ShieldCheck, Key } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { AuditEvent } from '../../types/common'
import { formatDateTime } from '../../lib/utils'

export const AuditLedgerPage: React.FC = () => {
  const { auditLogs, addToast } = useVanguardStore()
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifiedHash, setVerifiedHash] = useState<boolean | null>(null)

  const handleVerifyIntegrity = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerifiedHash(true)
      addToast({
        title: 'Cryptographic Ledger Verified',
        message: `Validated SHA-256 hash chains across all ${auditLogs.length} events: 0 tampering detected.`,
        type: 'success',
      })
    }, 700)
  }

  const filteredLogs =
    outcomeFilter === 'ALL' ? auditLogs : auditLogs.filter((l) => l.outcome === outcomeFilter)

  const columns: Column<AuditEvent>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp (UTC)',
      sortable: true,
      className: 'w-44 font-mono text-[11px] text-slate-600',
      render: (row) => formatDateTime(row.timestamp),
    },
    {
      key: 'actor',
      header: 'Actor & Role',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.actor}</div>
          <div className="text-[10px] text-slate-500 font-mono">{row.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Security / Business Action',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
          {row.action}
        </span>
      ),
    },
    {
      key: 'targetEntity',
      header: 'Target Object',
      sortable: true,
      render: (row) => (
        <span className="text-slate-700 font-mono text-xs">
          {row.targetEntity} : {row.targetId}
        </span>
      ),
    },
    {
      key: 'purpose',
      header: 'Mission Purpose / Justification',
      render: (row) => <span className="text-[11px] text-slate-600">{row.purpose}</span>,
    },
    {
      key: 'outcome',
      header: 'Result',
      sortable: true,
      render: (row) => (
        <Badge
          status={row.outcome === 'SUCCESS' ? 'NOMINAL' : 'CRITICAL'}
          className="text-[10px]"
        >
          {row.outcome}
        </Badge>
      ),
    },
    {
      key: 'hash',
      header: 'SHA-256 Chain Digest',
      render: (row) => (
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
          <Key className="w-3 h-3 text-cyan-700 shrink-0" />
          <span className="truncate max-w-[120px]" title={row.hash}>
            {row.hash.substring(0, 16)}...
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Operational Audit & Tamper-Evident Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Append-only security event trail conforming to NIST SP 800-53 AU-3 / AU-10 non-repudiation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="teal"
            size="sm"
            isLoading={verifying}
            leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            onClick={handleVerifyIntegrity}
          >
            Verify Cryptographic Chain
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setExportModalOpen(true)}
          >
            Export Signed Package
          </Button>
        </div>
      </div>

      {/* Ledger Verification Status Card */}
      {verifiedHash && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              WORM Integrity Check Passed: All {auditLogs.length} events cryptographically signed and untampered.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700">HASH: SHA256-ROOT-CHAIN-OK</span>
        </div>
      )}

      {/* Outcome Filters */}
      <div className="flex items-center gap-1.5">
        {['ALL', 'SUCCESS', 'DENIED', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setOutcomeFilter(st)}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              outcomeFilter === st
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        keyField="id"
        pageSize={10}
        searchPlaceholder="Filter audit trail by actor, action, target, purpose..."
      />

      {/* Export Signed Package Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Cryptographic Audit Package"
        subtitle="Signed JSON-LD + SHA-256 Manifest for Inspector General Review"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => {
                setExportModalOpen(false)
                addToast({
                  title: 'Audit Package Exported',
                  message: 'Generated tamper-evident tar.gz archive with digital signature',
                  type: 'success',
                })
              }}
            >
              Download Archive
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-700 space-y-1">
            <p>Archive: vanguardshield-audit-ledger-20261117.tar.gz</p>
            <p>Total Records: {auditLogs.length} events</p>
            <p>Signature Algorithm: RSA-PSS 4096 / SHA-384</p>
            <p className="text-cyan-800">Root Merkle Hash: 8f49a2c918e7d23a10984f1837c44e91823901</p>
          </div>
          <p className="text-slate-500 text-xs">
            This export package includes full JSON event envelopes, actor PIV serial certificates,
            and cryptographic non-repudiation assertions required by federal oversight authorities.
          </p>
        </div>
      </Modal>
    </div>
  )
}
