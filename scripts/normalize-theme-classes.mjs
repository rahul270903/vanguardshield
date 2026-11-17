import fs from 'fs';

const files = [
  'UnifiedCommPage.tsx',
  'MassNotificationPage.tsx',
  'P25FleetPage.tsx',
  'VRSMBWCPage.tsx',
  'P25InfrastructurePage.tsx',
  'MobileEndpointMDMPage.tsx',
  'CSfCTrustedIntegrationPage.tsx',
  'DeviceOperationsPage.tsx',
  'CybersecuritySOCPage.tsx',
  'CriticalConnectPage.tsx'
];

files.forEach(f => {
  const p = 'src/pages/apps/' + f;
  let content = fs.readFileSync(p, 'utf8');

  content = content.replaceAll('bg-card/70', 'bg-white');
  content = content.replaceAll('bg-card/60', 'bg-white');
  content = content.replaceAll('bg-card/50', 'bg-white');
  content = content.replaceAll('bg-card/40', 'bg-white');
  content = content.replaceAll('bg-card/30', 'bg-white');
  content = content.replaceAll('bg-card', 'bg-white');

  content = content.replaceAll('border-border/80', 'border-slate-200');
  content = content.replaceAll('border-border/60', 'border-slate-200');
  content = content.replaceAll('border-border/40', 'border-slate-200');
  content = content.replaceAll('border-border', 'border-slate-200');

  content = content.replaceAll('text-foreground', 'text-slate-900');
  content = content.replaceAll('text-muted-foreground', 'text-slate-500');

  // Also replace any rounded-xl on cards to rounded-lg to match modules 1-3
  content = content.replaceAll('rounded-xl', 'rounded-lg');

  fs.writeFileSync(p, content, 'utf8');
  console.log(`Normalized theme classes in ${f}`);
});
