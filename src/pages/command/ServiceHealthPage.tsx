import React, { useState } from 'react'
import { Activity, ShieldCheck, Server, Cpu, Database, CheckCircle2, RefreshCw, Zap, AlertTriangle } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable, Column } from '../../components/ui/DataTable'
import { ServiceHealthItem } from '../../types/command'
import { formatRelativeTime } from '../../lib/utils'

export const ServiceHealthPage: React.FC = () => {
  const { serviceHealth, simulateFailoverTest, addToast } = useVanguardStore()
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null)

  const handleTestProbe = (id: string, name: string) => {
    setTestingServiceId(id)
    setTimeout(() => {
      simulateFailoverTest(id)
      setTestingServiceId(null)
    }, 600)
  }

  const columns: Column<ServiceHealthItem>[] = [
    {
      key: 'serviceName',
      header: 'Subsystem / Service',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.serviceName}</div>
          <div className="text-[11px] text-slate-500">{row.subsystem}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Operational Status',
      sortable: true,
      render: (row) => <Badge status={row.status} dot pulse={row.status !== 'NOMINAL'} />,
    },
    {
      key: 'latencyMs',
      header: 'Bus Latency',
      sortable: true,
      render: (row) => (
        <span
          className={`font-mono text-xs font-semibold ${
            row.latencyMs > 100 ? 'text-amber-600' : 'text-emerald-700'
          }`}
        >
          {row.latencyMs} ms
        </span>
      ),
    },
    {
      key: 'availabilityPct',
      header: 'SLA Availability',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {row.availabilityPct.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Diagnostics Details',
      render: (row) => <span className="text-[11px] text-slate-600">{row.details}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          isLoading={testingServiceId === row.id}
          leftIcon={<Zap className="w-3 h-3 text-cyan-600" />}
          onClick={() => handleTestProbe(row.id, row.serviceName)}
        >
          Probe Node
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Service Health & Subsystem Console
          </h1>
          <p className="text-xs text-slate-500">
            Observability, event bus latency, microservice uptime, and cryptographic telemetry
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => {
            addToast({
              title: 'Health Sweep Executed',
              message: 'Polled all 16 mission application gateways: all clusters nominal',
              type: 'info',
            })
          }}
        >
          Global Health Sweep
        </Button>
      </div>

      {/* 6-Layer Architecture Health Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { layer: '1. Experience', status: 'NOMINAL', latency: '12ms' },
          { layer: '2. Mission Apps', status: 'NOMINAL', latency: '18ms' },
          { layer: '3. Shared Services', status: 'NOMINAL', latency: '14ms' },
          { layer: '4. Event Fabric', status: 'NOMINAL', latency: '8ms' },
          { layer: '5. Data Intelligence', status: 'NOMINAL', latency: '22ms' },
          { layer: '6. Edge & Infra', status: 'NOMINAL', latency: '19ms' },
        ].map((layer, idx) => (
          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-md shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">
              {layer.layer}
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-bold text-emerald-700">{layer.status}</span>
              <span className="text-[10px] font-mono text-slate-400">{layer.latency}</span>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={serviceHealth}
        keyField="id"
        pageSize={10}
        searchPlaceholder="Filter services by name, subsystem, status..."
      />
    </div>
  )
}
