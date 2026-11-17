import React, { useState } from 'react'
import { BellRing, CheckCircle, AlertTriangle, ShieldAlert, Play, Shield, Terminal } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { OperationalAlert } from '../../types/command'
import { formatRelativeTime } from '../../lib/utils'

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, executePlaybook, personas, activePersonaId } = useVanguardStore()
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  const [selectedAlertForPlaybook, setSelectedAlertForPlaybook] = useState<OperationalAlert | null>(null)
  const [playbookRationale, setPlaybookRationale] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')

  const filteredAlerts =
    sourceFilter === 'ALL' ? alerts : alerts.filter((a) => a.sourceDomain === sourceFilter)

  const handleExecutePlaybook = () => {
    if (!selectedAlertForPlaybook || !selectedAlertForPlaybook.recommendedPlaybook) return
    executePlaybook(
      selectedAlertForPlaybook.id,
      selectedAlertForPlaybook.recommendedPlaybook,
      playbookRationale || 'Tactical containment playbook executed by authorized supervisor'
    )
    setSelectedAlertForPlaybook(null)
    setPlaybookRationale('')
  }

  const columns: Column<OperationalAlert>[] = [
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (row) => <Badge severity={row.severity} dot pulse={!row.acknowledged} />,
    },
    {
      key: 'title',
      header: 'Alert Title & Description',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-[11px] text-slate-500 max-w-lg">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'sourceDomain',
      header: 'Source Domain',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded border border-slate-200">
          {row.sourceDomain}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location / Sensor',
      sortable: true,
      render: (row) => <span className="text-slate-700 font-medium">{row.location}</span>,
    },
    {
      key: 'recommendedPlaybook',
      header: 'Recommended Playbook',
      render: (row) =>
        row.recommendedPlaybook ? (
          <span className="font-mono text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
            {row.recommendedPlaybook}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'timestamp',
      header: 'Triggered',
      sortable: true,
      render: (row) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {formatRelativeTime(row.timestamp)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.acknowledged ? (
          <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
          </span>
        ) : (
          <span className="text-red-600 text-[11px] font-bold uppercase animate-pulse">
            Unacknowledged
          </span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {!row.acknowledged && (
            <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(row.id)}>
              Ack
            </Button>
          )}
          {row.recommendedPlaybook && (
            <Button
              size="sm"
              variant="teal"
              leftIcon={<Play className="w-3 h-3" />}
              onClick={() => {
                setSelectedAlertForPlaybook(row)
                setPlaybookRationale('')
              }}
            >
              Playbook
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Operational Alerts & Anomaly Triage
          </h1>
          <p className="text-xs text-slate-500">
            Correlated physical security, C-UAS, radio core, and SOC anomaly detection triggers with automated playbooks
          </p>
        </div>

        {/* Source Domain Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'PACS', 'VMS', 'C_UAS', 'SOC', 'P25'].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                sourceFilter === src
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAlerts}
        keyField="id"
        pageSize={8}
        searchPlaceholder="Filter alerts by title, sensor, source domain..."
      />

      {/* Playbook Execution Modal */}
      <Modal
        isOpen={Boolean(selectedAlertForPlaybook)}
        onClose={() => setSelectedAlertForPlaybook(null)}
        title={`Execute Response Playbook`}
        subtitle={selectedAlertForPlaybook?.recommendedPlaybook || 'Tactical Action'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedAlertForPlaybook(null)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleExecutePlaybook}>
              Authorize & Run Playbook
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900">
            <span className="font-bold block">Tactical Intervention Trigger</span>
            <p className="text-[11px] text-red-800 mt-0.5">
              Target Alert: {selectedAlertForPlaybook?.title} ({selectedAlertForPlaybook?.location})
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-700">Authorizing Officer:</span>
            <p className="font-semibold text-slate-900">
              {activePersona.name} ({activePersona.roleLabel})
            </p>
            <p className="font-mono text-[11px] text-slate-500">PIV ID: {activePersona.pivCardId}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Operational Justification (Audited)
            </label>
            <textarea
              className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
              rows={3}
              value={playbookRationale}
              onChange={(e) => setPlaybookRationale(e.target.value)}
              placeholder="State reason for executing containment playbook and intended outcome..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
