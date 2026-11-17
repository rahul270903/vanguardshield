import fs from 'fs';

// 1. Fix CSfCTrustedIntegrationPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/CSfCTrustedIntegrationPage.tsx', 'utf8');
  if (!file.includes('Network,')) {
    file = file.replace('Share2,', 'Share2,\n  Network,');
  }
  file = file.replace('{totalThroughputGbps.toFixed(1)} Gbps', '{totalThroughput} Mbps');
  file = file.replace('{pqcReadyCount} Gateways', '{csfcGateways.filter((g) => g.pqcEnabled).length} Gateways');
  fs.writeFileSync('src/pages/apps/CSfCTrustedIntegrationPage.tsx', file, 'utf8');
  console.log('Fixed CSfCTrustedIntegrationPage.tsx');
}

// 2. Fix CriticalConnectPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/CriticalConnectPage.tsx', 'utf8');
  if (!file.includes('Server,')) {
    file = file.replace('Zap,', 'Zap,\n  Server,');
  }
  file = file.replace('{interopBridges.length}', '{criticalConnectBridges.length}');
  file = file.replace('{activeSessions} Live', '{activeTalkers} Live');
  file = file.replace('{uniqueAgencies} Fed / Local', '4 Fed / Local');
  fs.writeFileSync('src/pages/apps/CriticalConnectPage.tsx', file, 'utf8');
  console.log('Fixed CriticalConnectPage.tsx');
}

// 3. Fix DeviceOperationsPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/DeviceOperationsPage.tsx', 'utf8');
  if (!file.includes('HardDrive,')) {
    file = file.replace('Zap,', 'Zap,\n  HardDrive,\n  Cpu,');
  }
  fs.writeFileSync('src/pages/apps/DeviceOperationsPage.tsx', file, 'utf8');
  console.log('Fixed DeviceOperationsPage.tsx');
}

// 4. Fix MassNotificationPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/MassNotificationPage.tsx', 'utf8');
  file = file.replace('{activeChannelsCount} <span className="text-xs font-normal text-slate-500">/ {notificationChannels.length}</span>', '{deliveryChannels.filter((c) => c.status === "ONLINE").length} <span className="text-xs font-normal text-slate-500">/ {deliveryChannels.length}</span>');
  file = file.replace('{notificationZones.length}', '4 Zones');
  fs.writeFileSync('src/pages/apps/MassNotificationPage.tsx', file, 'utf8');
  console.log('Fixed MassNotificationPage.tsx');
}

// 5. Fix P25FleetPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/P25FleetPage.tsx', 'utf8');
  file = file.replace('{subscriberRadios.length}', '{radios.length}');
  file = file.replace('{activeRadiosCount} <span className="text-xs font-normal text-slate-500">/ {subscriberRadios.length}</span>', '{onlineCount} <span className="text-xs font-normal text-slate-500">/ {radios.length}</span>');
  file = file.replace('{inhibitedRadiosCount} Stunned', '{stunnedCount} Stunned');
  file = file.replace('{inhibitedRadiosCount}', '{stunnedCount}');
  file = file.replace('{p25Repeaters.length}', '{p25RepeaterSites.length}');
  file = file.replace('{p25Repeaters.filter((r) => r.status === \'ONLINE\').length} <span className="text-xs font-normal text-slate-500">/ {p25Repeaters.length}</span>', '{operationalSitesCount} <span className="text-xs font-normal text-slate-500">/ {p25RepeaterSites.length}</span>');
  fs.writeFileSync('src/pages/apps/P25FleetPage.tsx', file, 'utf8');
  console.log('Fixed P25FleetPage.tsx');
}

// 6. Fix VRSMBWCPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/VRSMBWCPage.tsx', 'utf8');
  if (!file.includes('MapPin,')) {
    file = file.replace('Share2,', 'Share2,\n  MapPin,');
  }
  file = file.replaceAll('vrsmDevices.length', 'bwcDevices.length');
  file = file.replaceAll('vrsmTriggers.length', 'bwcTriggers.length');
  file = file.replaceAll('{dockedCount}', '{bwcDockingStations.filter((d) => d.status === "DOCK_OFFLOADING").length}');
  fs.writeFileSync('src/pages/apps/VRSMBWCPage.tsx', file, 'utf8');
  console.log('Fixed VRSMBWCPage.tsx');
}
