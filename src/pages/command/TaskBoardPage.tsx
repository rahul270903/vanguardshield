import React, { useState } from 'react'
import { CheckSquare, Clock, UserCheck, Shield, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { DataTable, Column } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { MissionTask } from '../../types/command'
import { formatRelativeTime } from '../../lib/utils'

export const TaskBoardPage: React.FC = () => {
  const { tasks, personas, activePersonaId, resolveTask, addToast, logAuditEvent } = useVanguardStore()
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  const [approvalModalTask, setApprovalModalTask] = useState<MissionTask | null>(null)
  const [rationale, setRationale] = useState('')
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL')
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false)

  // New task form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    assignedTo: 'Special Agent Alex Carter',
    priority: 'HIGH' as MissionTask['priority'],
    approverRole: 'WATCH_COMMANDER',
  })

  const handleApprove = () => {
    if (!approvalModalTask) return
    resolveTask(approvalModalTask.id, activePersona?.name)
    logAuditEvent({
      agencyId: activePersona.agencyId,
      actor: activePersona.name,
      actorRole: activePersona.role,
      action: 'TASK_FORMAL_SIGN_OFF',
      targetEntity: 'MissionTask',
      targetId: approvalModalTask.id,
      outcome: 'SUCCESS',
      purpose: `PIV electronic signature approval: ${rationale || 'Authorized under standard operational guidelines'}`,
    })
    setApprovalModalTask(null)
    setRationale('')
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskForm.title.trim()) return

    const newTask: MissionTask = {
      id: 'task-' + Math.floor(200 + Math.random() * 800),
      taskCode: 'TSK-' + Math.floor(1000 + Math.random() * 9000),
      title: newTaskForm.title,
      assignedTo: newTaskForm.assignedTo,
      dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      priority: newTaskForm.priority,
      status: 'WAITING_APPROVAL',
      approverRole: newTaskForm.approverRole,
    }

    // Add to store tasks
    useVanguardStore.setState((state) => ({
      tasks: [newTask, ...state.tasks],
    }))

    addToast({
      title: 'Mission Task Created',
      message: `${newTask.taskCode} dispatched for supervisor authorization`,
      type: 'info',
    })
    setNewTaskModalOpen(false)
    setNewTaskForm({
      title: '',
      assignedTo: 'Special Agent Alex Carter',
      priority: 'HIGH',
      approverRole: 'WATCH_COMMANDER',
    })
  }

  const filteredTasks =
    taskStatusFilter === 'ALL' ? tasks : tasks.filter((t) => t.status === taskStatusFilter)

  const columns: Column<MissionTask>[] = [
    {
      key: 'taskCode',
      header: 'Task ID',
      sortable: true,
      className: 'w-28 font-mono font-bold text-cyan-800',
    },
    {
      key: 'title',
      header: 'Task Action Title',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900">{row.title}</span>,
    },
    {
      key: 'assignedTo',
      header: 'Assignee',
      sortable: true,
      render: (row) => <span className="text-slate-700 font-medium">{row.assignedTo}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (row) => <Badge severity={row.priority} />,
    },
    {
      key: 'status',
      header: 'Workflow State',
      sortable: true,
      render: (row) => {
        const styles: Record<string, string> = {
          PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
          IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-300',
          WAITING_APPROVAL: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
          COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
              styles[row.status] || 'bg-slate-100'
            }`}
          >
            {row.status.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      key: 'approverRole',
      header: 'Required Authority',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          {row.approverRole || 'Any Supervisor'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'WAITING_APPROVAL' ? (
          <Button
            size="sm"
            variant="teal"
            onClick={() => {
              setApprovalModalTask(row)
              setRationale('')
            }}
          >
            Review & Sign
          </Button>
        ) : row.status === 'COMPLETED' ? (
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Signed by {row.approvedBy}
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveTask(row.id, activePersona?.name)}
          >
            Mark Done
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Mission Tasks & Approval Queue
          </h1>
          <p className="text-xs text-slate-500">
            Separation of duties, dual-custody authorization gates, and operational work execution (NIST SP 800-53 AC-5)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {['ALL', 'WAITING_APPROVAL', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setTaskStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  taskStatusFilter === st
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="teal"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setNewTaskModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTasks}
        keyField="id"
        pageSize={8}
        searchPlaceholder="Filter tasks by code, assignee, status..."
      />

      {/* Formal Approval Modal with PIV Signature */}
      <Modal
        isOpen={Boolean(approvalModalTask)}
        onClose={() => setApprovalModalTask(null)}
        title={`Sign-Off Authorization: ${approvalModalTask?.taskCode}`}
        subtitle={approvalModalTask?.title}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setApprovalModalTask(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setApprovalModalTask(null)}>
              Reject
            </Button>
            <Button variant="teal" size="sm" onClick={handleApprove}>
              Electronically Sign (PIV Token)
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
            <span className="font-bold block">Life Safety / High-Impact Command Authorization Gate</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Executing this sign-off requires valid supervisor credentials and will append a
              tamper-evident entry to the permanent audit ledger.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-700">Authorizing Officer:</span>
            <p className="font-semibold text-slate-900">
              {activePersona?.name} ({activePersona?.roleLabel})
            </p>
            <p className="font-mono text-[11px] text-slate-500">PIV Card ID: {activePersona?.pivCardId}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Decision Justification / Reason Rationale (Mandatory)
            </label>
            <textarea
              className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="State mission basis, policy justification, and risk assessment findings..."
            />
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        title="Disseminate New Mission Task"
        subtitle="Assign work order with approval requirements"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleCreateTask}>
              Submit Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <Input
            label="Task Title / Objective"
            placeholder="e.g. Conduct Secondary Sweep of Sector 4 Server Vault"
            value={newTaskForm.title}
            onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Operator"
              value={newTaskForm.assignedTo}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
              options={[
                { value: 'Special Agent Alex Carter', label: 'Special Agent Alex Carter' },
                { value: 'Officer Reed (FPS-Patrol-402)', label: 'Officer Reed (FPS-Patrol-402)' },
                { value: 'Elena Rostova (SOC)', label: 'Elena Rostova (SOC)' },
                { value: 'David Holloway (FSO)', label: 'David Holloway (FSO)' },
              ]}
            />

            <Select
              label="Task Priority"
              value={newTaskForm.priority}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, priority: e.target.value as MissionTask['priority'] })
              }
              options={[
                { value: 'CRITICAL', label: 'Critical / Immediate' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Routine' },
              ]}
            />
          </div>

          <Select
            label="Required Approver Authority"
            value={newTaskForm.approverRole}
            onChange={(e) => setNewTaskForm({ ...newTaskForm, approverRole: e.target.value })}
            options={[
              { value: 'WATCH_COMMANDER', label: 'Watch Commander' },
              { value: 'FACILITY_SECURITY_OFFICER', label: 'Facility Security Officer' },
              { value: 'EVIDENCE_CUSTODIAN', label: 'Evidence Custodian' },
            ]}
          />
        </form>
      </Modal>
    </div>
  )
}
