import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Shield,
  Layers,
  Database,
  Terminal,
  Users,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  FileCode,
} from 'lucide-react'
import { MISSION_MODULES_REGISTRY, MissionModuleSpec } from '../../lib/moduleRegistry'
import { useVanguardStore } from '../../store/useVanguardStore'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'

export const MissionAppPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const { agencies, activeAgencyId, addToast } = useVanguardStore()
  const activeAgency = agencies.find((a) => a.id === activeAgencyId) || agencies[0]

  const moduleSpec: MissionModuleSpec | undefined = appId
    ? MISSION_MODULES_REGISTRY[appId]
    : undefined

  const [activeScreenIndex, setActiveScreenIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'screens' | 'entities' | 'api' | 'security'>('screens')

  if (!moduleSpec) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Mission Application Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unknown identifier: {appId}</p>
        <Link to="/command/executive" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Return to Command Center
          </Button>
        </Link>
      </div>
    )
  }

  const activeScreen = moduleSpec.screens[activeScreenIndex] || moduleSpec.screens[0]

  const handleSimulateAction = (actionName: string) => {
    addToast({
      title: `${moduleSpec.code} Operational Event`,
      message: `Triggered [${actionName}] under simulated ${activeAgency.code} authority`,
      type: 'info',
    })
  }

  return (
    <div className="space-y-5">
      {/* Module Title Banner */}
      <div className="bg-[#0B192C] text-white p-5 rounded-lg border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 font-mono font-bold text-[10px] rounded border border-cyan-700">
                MODULE {moduleSpec.number} // {moduleSpec.code}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded">
                {moduleSpec.phase}
              </span>
              <Badge classification={activeAgency.defaultClassification} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{moduleSpec.title}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {moduleSpec.purpose}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="teal"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={() => handleSimulateAction('Subsystem Heartbeat Validation')}
            >
              Simulate Subsystem Event
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => handleSimulateAction('OpenAPI Schema Diagnostic')}
            >
              View OpenAPI Contract
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('screens')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'screens'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Application Screens ({moduleSpec.screens.length})
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'entities'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Logical Database Entities ({moduleSpec.entities.length})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            API Endpoints Catalogue ({moduleSpec.endpoints.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & User Roles ({moduleSpec.userRoles.length})
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'screens' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left: Screen Inventory Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
              Screen Inventory
            </h3>
            <div className="space-y-1">
              {moduleSpec.screens.map((screen, idx) => (
                <button
                  key={screen.name}
                  onClick={() => setActiveScreenIndex(idx)}
                  className={`w-full text-left p-2.5 rounded text-xs transition-colors cursor-pointer border ${
                    activeScreenIndex === idx
                      ? 'bg-white border-cyan-600 text-slate-900 font-bold shadow-xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{screen.name}</span>
                    {activeScreenIndex === idx && <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 mt-4 space-y-1.5">
              <span className="font-bold text-slate-900 block">Federal Architecture Standard:</span>
              <p>
                Each screen adheres to the 7 Standard Screen Patterns defined in Section 8 of the
                Master Blueprint.
              </p>
            </div>
          </div>

          {/* Right: Active Screen High-Fidelity Simulation View */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="bg-slate-50">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    {activeScreen.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{activeScreen.description}</p>
                </div>
                <Badge variant="nominal" dot>
                  Interactive Wireframe Active
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                {/* Simulated Screen Controls & Operational Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Module Status
                    </span>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">READY / VERIFIED</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Enclave Routing
                    </span>
                    <p className="text-sm font-mono font-bold text-cyan-800 mt-0.5">
                      {activeAgency.code} // {activeAgency.defaultClassification}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Audit Assurance
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                      TAMPER-EVIDENT
                    </p>
                  </div>
                </div>

                {/* Simulated Operational Workspace Body */}
                <div className="p-5 bg-slate-50/70 border border-slate-200 rounded-md space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-700" />
                      <span className="text-xs font-bold text-slate-900">
                        {activeScreen.name} Operational Canvas
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSimulateAction(`${activeScreen.name} Refresh`)}
                      >
                        Refresh State
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleSimulateAction(`${activeScreen.name} Transaction`)}
                      >
                        Execute Action
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    This screen manages the <span className="font-semibold">{activeScreen.description}</span>.
                    All input parameters, telemetry fields, and workflow state transitions are wired to
                    the central VanguardShield event fabric and persist within the encrypted frontend store.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white border border-slate-200 rounded text-xs">
                      <span className="font-semibold text-slate-800 block mb-1">
                        Domain Data Entity Binding:
                      </span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] font-mono">
                        {moduleSpec.entities.slice(0, 4).map((ent) => (
                          <li key={ent}>{ent}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded text-xs">
                      <span className="font-semibold text-slate-800 block mb-1">
                        Authoritative User Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {moduleSpec.userRoles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <Card>
          <CardHeader>
            <CardTitle>Logical Database Entities for {moduleSpec.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 mb-4">
              In accordance with Section 4 of the Engineering Requirements Package, each entity retains
              standard federal audit attributes:{' '}
              <span className="font-mono text-cyan-800">
                id, agency_id, created_at, created_by, updated_at, record_version, data_label, retention_policy_id
              </span>
              .
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {moduleSpec.entities.map((entity) => (
                <div
                  key={entity}
                  className="p-3 bg-slate-50 border border-slate-200 rounded hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-700" />
                    <span className="text-xs font-mono font-bold text-slate-900">{entity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">UUID Primary Key • Mutable Schema</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Endpoints Tab */}
      {activeTab === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle>Proposed REST API Endpoint Catalogue (v1)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {moduleSpec.endpoints.map((ep, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-slate-800">/v1{ep.path}</span>
                  </div>
                  <span className="text-slate-600 text-[11px]">{ep.purpose}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Access Controls & Security Baseline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                  Role-Based Access Control (RBAC)
                </h4>
                <p className="text-slate-600 text-xs">
                  Authorized personnel granted access to operational endpoints:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {moduleSpec.userRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-white text-slate-800 border border-slate-300 rounded font-semibold text-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                  Attribute-Based Access Control (ABAC)
                </h4>
                <p className="text-slate-600 text-xs">
                  Contextual policy evaluation enforces strict tenant isolation, PIV/CAC assurance,
                  device posture, and network enclave clearance before dispatch or viewing.
                </p>
                <div className="font-mono text-[11px] text-cyan-800 pt-1">
                  Enforce: subject.agency_id == resource.agency_id AND subject.clearance &gt;= resource.label
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
