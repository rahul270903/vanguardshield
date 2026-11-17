import React, { useState } from 'react'
import {
  Wrench,
  BatteryCharging,
  Battery,
  Radio,
  Camera,
  Server,
  Activity,
  ShieldCheck,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Sliders,
  Settings,
  Zap,
  HardDrive,
  Cpu,
} from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DepotWorkOrder } from '../../types/modules'

export type DepotTab = 'inventory' | 'battery' | 'firmware' | 'orders' | 'calibration' | 'audit'

export const DeviceOperationsPage: React.FC = () => {
  const {
    depotAssets,
    depotWorkOrders,
    auditLogs,
    createDepotWorkOrder,
    addToast,
  } = useVanguardStore()

  const [activeTab, setActiveTab] = useState<DepotTab>('inventory')
  const [selectedAssetId, setSelectedAssetId] = useState<string>('depot-01')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Work Order State
  const [targetAssetTag, setTargetAssetTag] = useState('AST-P25-8812')
  const [workType, setWorkType] = useState<DepotWorkOrder['workType']>('BATTERY_REPLACEMENT')
  const [orderNotes, setOrderNotes] = useState('IMPRES battery reconditioning profile scheduled; internal resistance check.')

  const depotAuditLogs = auditLogs.filter(
    (a) => a.action.startsWith('DEPOT_') || a.targetEntity === 'DepotWorkOrder'
  )

  const selectedAsset = depotAssets.find((a) => a.id === selectedAssetId) || depotAssets[0]

  const filteredAssets = depotAssets.filter((a) => {
    return (
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.agencyOwner.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalAssets = depotAssets.length
  const activeCount = depotAssets.filter((a) => a.lifecycleStage === 'ACTIVE_DEPLOYED').length
  const maintenanceCount = depotAssets.filter((a) => a.lifecycleStage === 'DEPOT_MAINTENANCE' || a.lifecycleStage === 'CALIBRATION').length
  const avgBattery = Math.round(
    depotAssets.reduce((acc, a) => acc + a.batteryHealthPct, 0) / (totalAssets || 1)
  )

  return (
    <div className="space-y-6">
      {/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  Mission App 14 // DEPOT-OPS
                </span>
                <span className="text-xs text-slate-400">NIST SP 800-88 / MIL-STD-810H</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Depot Bench Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Managed Device Operations &amp; Depot
              </h1>
              <p className="text-xs text-slate-400">
                Depot Maintenance &amp; Calibration Bench • Battery Health Telemetry • Staged OTA Firmware Campaigns • RMA Tracking
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addToast({
                  title: 'Depot Fleet Telemetry Polled',
                  message: 'All 4 asset categories synchronized with logistics barcoding database',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Depot</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab('orders')
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>New Work Order</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Depot Inventory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {depotAssets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('battery')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'battery'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Battery Health Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'firmware'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>OTA Firmware Campaigns</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Maintenance &amp; RMA Orders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {depotWorkOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calibration'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>RF Calibration Bench</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sanitization Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Depot Assets</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{totalAssets} Units</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total Managed Hardware</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Deployed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {activeCount} <span className="text-xs font-normal text-slate-500">/ {totalAssets}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Field Operational</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Depot Bench / RMA</span>
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">{maintenanceCount} Units</div>
          <div className="text-[10px] text-slate-500 mt-0.5">In Calibration or Repair</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Fleet Battery Health</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{avgBattery}% Avg</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Li-Ion Telemetry Nominal</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Sanitization Standard</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">SP 800-88</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cryptographic Purge Certified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Open Work Orders</span>
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{depotWorkOrders.length}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Turnaround &lt; 48 Hours</div>
        </div>
      </div>


{/* Screen 1: Depot Asset Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search asset tag, serial number, model, or agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
              }}
            >
              Clear Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => {
              const isSelected = asset.id === selectedAssetId
              const isDeployed = asset.lifecycleStage === 'ACTIVE_DEPLOYED'

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-amber-500/80 ring-1 ring-amber-500/30 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{asset.assetTag}</span>
                        <Badge variant="outline">{asset.agencyOwner}</Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{asset.model}</h4>
                      <p className="text-[11px] text-slate-500">SN: {asset.serialNumber} • {asset.manufacturer}</p>
                    </div>

                    <Badge variant={isDeployed ? 'nominal' : 'warning'}>
                      {asset.lifecycleStage.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="p-2 rounded bg-background/50 border border-slate-200/50 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-900">{asset.depotLocation}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">Battery Health</span>
                      <span className={asset.batteryHealthPct > 80 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {asset.batteryHealthPct}% ({asset.batteryChargeCycles} Cycles)
                      </span>
                    </div>

                    <div className="p-2 rounded bg-background/30 border border-slate-200/30">
                      <span className="text-[10px] text-slate-500 block">Firmware</span>
                      <span className="text-blue-400 font-bold">{asset.firmwareVersion}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTargetAssetTag(asset.assetTag)
                        setWorkType('RF_ALIGNMENT')
                        setActiveTab('orders')
                      }}
                    >
                      <Wrench className="w-3 h-3 mr-1" /> Service Asset
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToast({
                          title: `Asset Barcode Scanned: ${asset.assetTag}`,
                          message: `Next mandatory service due: ${asset.nextServiceDueDate}`,
                          type: 'info',
                        })
                      }}
                    >
                      Scan Barcode
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen 2: Battery Health & Cycles */}
      {activeTab === 'battery' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              IMPRES 2 Smart Battery Health & Degradation Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Automated reconditioning cycles calculate internal cell degradation to prevent mid-mission tactical radio power dropouts.
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Asset Tag</th>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Battery Health %</th>
                    <th className="px-3 py-2">Charge Cycles</th>
                    <th className="px-3 py-2">Conditioning State</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {depotAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-900">{asset.assetTag}</td>
                      <td className="px-3 py-2 font-sans text-slate-900">{asset.model}</td>
                      <td className="px-3 py-2">
                        <span className={`font-bold ${asset.batteryHealthPct > 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {asset.batteryHealthPct}%
                        </span>
                      </td>
                      <td className="px-3 py-2">{asset.batteryChargeCycles} Cycles</td>
                      <td className="px-3 py-2">
                        <Badge variant={asset.batteryHealthPct > 80 ? 'nominal' : 'critical'}>
                          {asset.batteryHealthPct > 80 ? 'OPTIMAL' : 'DEGRADED - REPLACE'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => {
                            createDepotWorkOrder(asset.assetTag, 'BATTERY_REPLACEMENT', 'IMPRES reconditioning failure; cell replacement authorized.')
                          }}
                        >
                          Queue Battery Swap
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: OTA Firmware Campaigns */}
      {activeTab === 'firmware' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Staged Over-The-Air (OTA) Firmware Dispatch</h4>
              <p className="text-xs text-slate-500">Delta binary packages cryptographically verified via FIPS 140-3 SHA-256 before flash</p>
            </div>
            <Badge variant="nominal">Zero Packet Loss OTA</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-900">APX 8000XE P25 Fleet Campaign: R31.02.00</span>
              <p className="text-xs text-slate-500">
                Enhances TIA-102 Phase 2 TDMA vocoder clarity in high-noise firearm discharge environments.
              </p>
              <div className="flex justify-between text-xs font-mono text-purple-400">
                <span>Progress: 100% (All 142 units flashed)</span>
                <span>STATUS: COMPLETE</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/60 border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-900">Axon Body 4 BWC Sensor Campaign: v2.14.0</span>
              <p className="text-xs text-slate-500">
                Improves Bluetooth 5.2 Low Energy holster unholster sensor response time from 350ms to 85ms.
              </p>
              <div className="flex justify-between text-xs font-mono text-emerald-400">
                <span>Progress: 88% (42/48 cameras docked)</span>
                <span>STATUS: IN PROGRESS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Work Orders & Repair Queue */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* New Work Order Form */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Create Logistics Work Order</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Target Asset Tag</label>
                <select
                  value={targetAssetTag}
                  onChange={(e) => setTargetAssetTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200 font-mono"
                >
                  {depotAssets.map((a) => (
                    <option key={a.id} value={a.assetTag}>
                      {a.assetTag} — {a.model} ({a.agencyOwner})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Service Work Type</label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as DepotWorkOrder['workType'])}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
                >
                  <option value="BATTERY_REPLACEMENT">Battery Replacement & Conditioning</option>
                  <option value="RF_ALIGNMENT">RF Alignment & Spectrum Test</option>
                  <option value="FIRMWARE_FLASH">Firmware Flash & Security Baseline</option>
                  <option value="ANTENNA_REPAIR">Antenna / RF Connector Repair</option>
                  <option value="ANNUAL_CERTIFICATION">Annual Depot Certification</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1">Technician Notes</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-slate-200"
                />
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                createDepotWorkOrder(targetAssetTag, workType, orderNotes)
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Work Order
            </Button>
          </div>

          {/* Orders Table */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Depot Work Orders Ledger ({depotWorkOrders.length})
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Order #</th>
                    <th className="px-3 py-2">Asset Tag</th>
                    <th className="px-3 py-2">Work Type</th>
                    <th className="px-3 py-2">Technician</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {depotWorkOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="px-3 py-2 text-purple-400">{order.assetTag}</td>
                      <td className="px-3 py-2 font-sans">{order.workType.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-2 font-sans text-slate-900">{order.technicianName}</td>
                      <td className="px-3 py-2">
                        <Badge variant={order.priority === 'EXPEDITED' ? 'warning' : 'outline'}>
                          {order.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={order.status === 'QA_PASSED' ? 'nominal' : 'info'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(order.openedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: RF Calibration Bench */}
      {activeTab === 'calibration' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Aeroflex 3920B / Viavi Radio Test Set Bench</h4>
              <p className="text-xs text-slate-500">Automated TIA-102 modulation fidelity, sensitivity, and transmitter power output alignment</p>
            </div>
            <Badge variant="nominal">NIST Traceable Standards</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-900">700/800 MHz Power Output</span>
              <div className="font-mono text-emerald-400 text-lg font-bold">3.00 W (34.77 dBm)</div>
              <p className="text-[10px] text-slate-500">Tolerance: +/- 0.5 dBm compliant</p>
            </div>

            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-900">Modulation Fidelity (Phase 2)</span>
              <div className="font-mono text-emerald-400 text-lg font-bold">1.4% H-CPM Error</div>
              <p className="text-[10px] text-slate-500">Spec limit: &lt; 5.0% maximum error</p>
            </div>

            <div className="p-3.5 rounded-lg bg-background/50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-900">Receiver 12 dB SINAD Sensitivity</span>
              <div className="font-mono text-emerald-400 text-lg font-bold">-119.5 dBm</div>
              <p className="text-[10px] text-slate-500">Spec limit: &lt; -116.0 dBm minimum</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: Depot Operations Audit Log */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Depot Logistics & Maintenance Audit Ledger ({depotAuditLogs.length} Events)
            </h4>
            <Badge variant="outline">FIPS 140-3 Compliant</Badge>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Purpose / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {depotAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 text-slate-900 font-sans font-medium">{log.actor}</td>
                    <td className="px-3 py-2 text-slate-500">{log.actorRole}</td>
                    <td className="px-3 py-2 text-purple-400 font-bold">{log.action}</td>
                    <td className="px-3 py-2 text-slate-900">{log.targetId}</td>
                    <td className="px-3 py-2">
                      <Badge variant={log.outcome === 'SUCCESS' ? 'nominal' : 'critical'}>
                        {log.outcome}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-sans max-w-sm truncate" title={log.purpose}>
                      {log.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export default DeviceOperationsPage
