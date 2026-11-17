import React, { useState } from 'react'
import {
  PlusCircle,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Clock,
  PhoneCall,
  Video,
  KeyRound,
  Radio,
  FileCheck2,
  Play,
  Pause,
  Send,
  UserCheck,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { IncidentRecord } from '../../types/command'
import { formatDateTime, formatRelativeTime } from '../../lib/utils'

export const IncidentManagementPage: React.FC = () => {
  const {
    incidents,
    callSessions,
    cameras,
    accessEvents,
    evidenceRecords,
    radios,
    personas,
    activePersonaId,
    activeAgencyId,
    agencies,
    updateIncidentStatus,
    assignUnitToIncident,
    addIncident,
    addToast,
    logAuditEvent,
  } = useVanguardStore()

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]
  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]

  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'video' | 'pacs' | 'evidence' | 'timeline'>('overview')
  const [dispatchUnitModalOpen, setDispatchUnitModalOpen] = useState(false)
  const [unitSelection, setUnitSelection] = useState('UNIT-Echo-2')
  const [aarModalOpen, setAarModalOpen] = useState(false)
  const [aarNarrative, setAarNarrative] = useState('')
  const [audioPlaying, setAudioPlaying] = useState(false)

  const filteredIncidents =
    statusFilter === 'ALL' ? incidents : incidents.filter((i) => i.status === statusFilter)

  const handleAssignUnit = () => {
    if (!selectedIncident) return
    assignUnitToIncident(selectedIncident.id, unitSelection)
    setSelectedIncident({
      ...selectedIncident,
      assignedUnits: [...selectedIncident.assignedUnits, unitSelection],
    })
    setDispatchUnitModalOpen(false)
  }

  const handleCloseIncident = () => {
    if (!selectedIncident) return
    updateIncidentStatus(selectedIncident.id, 'CLOSED')
    logAuditEvent({
      agencyId: activeAgency.id,
      actor: activePersona.name,
      actorRole: activePersona.role,
      action: 'INCIDENT_CLOSED_AAR',
      targetEntity: 'IncidentRecord',
      targetId: selectedIncident.id,
      outcome: 'SUCCESS',
      purpose: `After-Action Review filed: ${aarNarrative || 'Standard operational closure with full evidentiary sign-off.'}`,
    })
    addToast({
      title: 'Incident Closed & AAR Logged',
      message: `${selectedIncident.trackingNumber} archived to permanent federal records`,
      type: 'success',
    })
    setAarModalOpen(false)
    setSelectedIncident(null)
  }

  const columns: Column<IncidentRecord>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      sortable: true,
      className: 'w-32 font-mono font-bold text-cyan-800',
    },
    {
      key: 'title',
      header: 'Title & Location',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-[11px] text-slate-500">{row.location.address} • {row.location.zone}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (row) => (
        <Badge
          severity={
            row.priority === 'P1_CRITICAL'
              ? 'CRITICAL'
              : row.priority === 'P2_HIGH'
              ? 'HIGH'
              : row.priority === 'P3_MEDIUM'
              ? 'MEDIUM'
              : 'LOW'
          }
        >
          {row.priority.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'CAD Status',
      sortable: true,
      render: (row) => {
        const styles: Record<string, string> = {
          NEW: 'bg-red-50 text-red-700 border-red-200',
          TRIAGED: 'bg-blue-50 text-blue-700 border-blue-200',
          DISPATCHED: 'bg-amber-50 text-amber-700 border-amber-200',
          ON_SCENE: 'bg-purple-50 text-purple-700 border-purple-200',
          CONTAINED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              styles[row.status] || 'bg-slate-100'
            }`}
          >
            {row.status.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      key: 'commander',
      header: 'Watch Commander',
      sortable: true,
      render: (row) => <span className="text-slate-700 font-medium">{row.commander}</span>,
    },
    {
      key: 'assignedUnits',
      header: 'Assigned Units',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.assignedUnits.map((u) => (
            <span key={u} className="px-1.5 py-0.2 bg-blue-50 text-blue-800 rounded text-[10px] font-mono border border-blue-200 font-semibold">
              {u}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIncident(row)
          }}
        >
          View Dossier
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Incident & Emergency Management (CAD)
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end incident coordination, unit recommendation, situational telemetry, and after-action review
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'NEW', 'DISPATCHED', 'ON_SCENE', 'CONTAINED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredIncidents}
        keyField="id"
        pageSize={8}
        onRowClick={(row) => setSelectedIncident(row)}
      />

      {/* Detail Slide-Over Dossier */}
      <Drawer
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.trackingNumber || 'Incident Dossier'}
        subtitle={selectedIncident?.title}
        width="2xl"
        footer={
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="teal"
                onClick={() => setDispatchUnitModalOpen(true)}
              >
                Dispatch Additional Unit
              </Button>
              {selectedIncident?.status !== 'CLOSED' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setAarModalOpen(true)}
                >
                  Close & File AAR
                </Button>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSelectedIncident(null)}>
              Dismiss
            </Button>
          </div>
        }
      >
        {selectedIncident && (
          <div className="space-y-4 text-xs">
            {/* Status & Priority Row */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge severity={selectedIncident.priority === 'P1_CRITICAL' ? 'CRITICAL' : 'HIGH'}>
                  {selectedIncident.priority}
                </Badge>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-slate-800">Status: {selectedIncident.status}</span>
              </div>
              <Badge classification={selectedIncident.classification} />
            </div>

            {/* Dossier Tabs */}
            <div className="flex border-b border-slate-200 gap-2 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  activeTab === 'overview' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  activeTab === 'calls' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" /> NG911 Call
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  activeTab === 'video' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video Feeds
              </button>
              <button
                onClick={() => setActiveTab('pacs')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  activeTab === 'pacs' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> PACS Access
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  activeTab === 'evidence' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Evidence
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Operational Location
                  </h4>
                  <p className="font-semibold text-slate-800">{selectedIncident.location.address}</p>
                  <p className="text-slate-500">{selectedIncident.location.zone}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Command Narrative
                  </h4>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed text-slate-800">
                    {selectedIncident.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    CAD Lifecycle Status Progression
                  </h4>
                  <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 rounded border border-slate-200 flex-wrap">
                    {(['NEW', 'TRIAGED', 'DISPATCHED', 'ON_SCENE', 'CONTAINED', 'CLOSED'] as const).map(
                      (step) => (
                        <button
                          key={step}
                          onClick={() => {
                            updateIncidentStatus(selectedIncident.id, step)
                            setSelectedIncident({ ...selectedIncident, status: step })
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            selectedIncident.status === step
                              ? 'bg-[#0B192C] text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {step}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Assigned Responders
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIncident.assignedUnits.map((u) => (
                      <span
                        key={u}
                        className="px-2 py-1 bg-blue-50 text-blue-800 rounded font-mono font-bold border border-blue-200"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: NG911 Call */}
            {activeTab === 'calls' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Session #CALL-911-8821</span>
                    <Badge variant="nominal">E911 Voice Connected</Badge>
                  </div>
                  <p className="text-slate-600 font-mono">Caller: +1 (202) 555-0199 • Operator: Sarah Jenkins</p>
                  <p className="text-slate-600">Location Confidence: 96% (ESInet Geodetic Dispatch Validated)</p>
                </div>

                {/* Simulated Audio Playback Waveform */}
                <div className="p-3 bg-[#0B192C] text-white rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-300">AUTHORIZED PLAYBACK LOG (FIPS-140)</span>
                    <span className="text-[10px] font-mono text-slate-400">01:42 / 02:22</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAudioPlaying(!audioPlaying)}
                      className="p-2 bg-cyan-700 hover:bg-cyan-600 rounded-full text-white cursor-pointer"
                    >
                      {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    {/* Simulated Waveform Bars */}
                    <div className="flex-1 flex items-center gap-1 h-8">
                      {[12, 28, 45, 18, 62, 80, 44, 30, 70, 95, 60, 40, 20, 50, 75, 30, 15, 65, 85, 40].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-full transition-all ${
                            audioPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Video Feeds */}
            {activeTab === 'video' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">CAM-402-OPT: Sector 4 Vault Outer Optical PTZ</span>
                    <span className="text-slate-500 text-[11px]">3840x2160 4K 60fps • Building B, Floor 1</span>
                  </div>
                  <Badge variant="nominal" dot>Live Active</Badge>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">CAM-405-FIX: Loading Dock Egress Gate</span>
                    <span className="text-slate-500 text-[11px]">1920x1080 30fps • Vehicle Gate</span>
                  </div>
                  <Badge variant="nominal" dot>Live Active</Badge>
                </div>
              </div>
            )}

            {/* Tab: PACS Access */}
            {activeTab === 'pacs' && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <span className="font-bold text-red-900 block">PACS Reader Alarm: RDR-4B-EXT</span>
                  <p className="text-red-700 text-xs mt-0.5">Door 4B Server Vault Outer — Forced Open Alarm without PIV read</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Hardware Tamper Switch Signal Validated</p>
                </div>
              </div>
            )}

            {/* Tab: Evidence */}
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="font-bold text-slate-900 block">EVD-2026-9041: Corridor 4B Body-Worn Camera Footage</span>
                  <p className="text-slate-600 text-xs mt-0.5">Custodian: Morgan Bennett • Retention: Federal Litigation Hold (7 Yr)</p>
                  <p className="text-[10px] text-cyan-800 font-mono mt-1">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal: Dispatch Additional Unit */}
      <Modal
        isOpen={dispatchUnitModalOpen}
        onClose={() => setDispatchUnitModalOpen(false)}
        title="Assign Additional Unit"
        subtitle="Dispatch eligible responder to incident scene"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDispatchUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleAssignUnit}>
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <Select
            label="Available Tactical Responders"
            value={unitSelection}
            onChange={(e) => setUnitSelection(e.target.value)}
            options={[
              { value: 'UNIT-Echo-2', label: 'UNIT-Echo-2 (Field Tactical Team B) - Available' },
              { value: 'FPS-Patrol-408', label: 'FPS-Patrol-408 (Officer Miller) - 3 mins away' },
              { value: 'K9-Security-Bravo', label: 'K9-Security-Bravo (Canine Unit) - On Standby' },
            ]}
          />
        </div>
      </Modal>

      {/* Modal: Close Incident & File AAR */}
      <Modal
        isOpen={aarModalOpen}
        onClose={() => setAarModalOpen(false)}
        title="Close Incident & File After-Action Report (AAR)"
        subtitle="Mandatory federal incident closure documentation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAarModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleCloseIncident}>
              Sign & Close Incident
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block mb-0.5">Closing Officer Credentials</span>
            <p className="text-slate-600 font-semibold">{activePersona.name} ({activePersona.roleLabel})</p>
            <p className="font-mono text-[11px] text-slate-400">PIV ID: {activePersona.pivCardId}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              After-Action Review Findings & Resolution Summary
            </label>
            <textarea
              className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
              rows={4}
              value={aarNarrative}
              onChange={(e) => setAarNarrative(e.target.value)}
              placeholder="State tactical outcome, containment verification, evidence chain status, and lessons learned..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
