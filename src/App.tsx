import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ExecutiveDashboardPage } from './pages/command/ExecutiveDashboardPage'
import { COPMapPage } from './pages/command/COPMapPage'
import { IncidentManagementPage } from './pages/command/IncidentManagementPage'
import { AlertsPage } from './pages/command/AlertsPage'
import { ServiceHealthPage } from './pages/command/ServiceHealthPage'
import { TaskBoardPage } from './pages/command/TaskBoardPage'
import { AuditLedgerPage } from './pages/command/AuditLedgerPage'
import { NG911Page } from './pages/apps/NG911Page'
import { VMSPage } from './pages/apps/VMSPage'
import { PACSPage } from './pages/apps/PACSPage'
import SituationalIntelPage from './pages/apps/SituationalIntelPage'
import MANETPage from './pages/apps/MANETPage'
import DEMSPage from './pages/apps/DEMSPage'
import UnifiedCommPage from './pages/apps/UnifiedCommPage'
import MassNotificationPage from './pages/apps/MassNotificationPage'
import P25FleetPage from './pages/apps/P25FleetPage'
import VRSMBWCPage from './pages/apps/VRSMBWCPage'
import P25InfrastructurePage from './pages/apps/P25InfrastructurePage'
import MobileEndpointMDMPage from './pages/apps/MobileEndpointMDMPage'
import CSfCTrustedIntegrationPage from './pages/apps/CSfCTrustedIntegrationPage'
import DeviceOperationsPage from './pages/apps/DeviceOperationsPage'
import CybersecuritySOCPage from './pages/apps/CybersecuritySOCPage'
import CriticalConnectPage from './pages/apps/CriticalConnectPage'
import { MissionAppPage } from './pages/apps/MissionAppPage'
import { SharedServicePage } from './pages/services/SharedServicePage'
import { AdminPage } from './pages/admin/AdminPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Default Landing: Executive Mission Dashboard */}
          <Route index element={<ExecutiveDashboardPage />} />

          {/* Section I: Command Center */}
          <Route path="command/executive" element={<ExecutiveDashboardPage />} />
          <Route path="command/cop" element={<COPMapPage />} />
          <Route path="command/incidents" element={<IncidentManagementPage />} />
          <Route path="command/alerts" element={<AlertsPage />} />
          <Route path="command/health" element={<ServiceHealthPage />} />
          <Route path="command/tasks" element={<TaskBoardPage />} />
          <Route path="command/audit" element={<AuditLedgerPage />} />

          {/* Section II: 16 Mission Applications */}
          <Route path="apps/ng911" element={<NG911Page />} />
          <Route path="apps/vms" element={<VMSPage />} />
          <Route path="apps/pacs" element={<PACSPage />} />
          <Route path="apps/situational-intel" element={<SituationalIntelPage />} />
          <Route path="apps/manet" element={<MANETPage />} />
          <Route path="apps/dems" element={<DEMSPage />} />
          <Route path="apps/unified-comm" element={<UnifiedCommPage />} />
          <Route path="apps/mass-notification" element={<MassNotificationPage />} />
          <Route path="apps/p25-fleet" element={<P25FleetPage />} />
          <Route path="apps/vrsm-bwc" element={<VRSMBWCPage />} />
          <Route path="apps/vrsm-bodyworn" element={<VRSMBWCPage />} />
          <Route path="apps/p25-infrastructure" element={<P25InfrastructurePage />} />
          <Route path="apps/mobile-endpoint" element={<MobileEndpointMDMPage />} />
          <Route path="apps/csfc-integration" element={<CSfCTrustedIntegrationPage />} />
          <Route path="apps/device-operations" element={<DeviceOperationsPage />} />
          <Route path="apps/cybersecurity-soc" element={<CybersecuritySOCPage />} />
          <Route path="apps/critical-connect" element={<CriticalConnectPage />} />
          <Route path="apps/:appId" element={<MissionAppPage />} />

          {/* Section III: Shared Platform Services */}
          <Route path="services/:serviceId" element={<SharedServicePage />} />

          {/* Section IV: System Administration */}
          <Route path="admin/:adminSection" element={<AdminPage />} />

          {/* Catch-all redirect to Executive Dashboard */}
          <Route path="*" element={<Navigate to="/command/executive" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
