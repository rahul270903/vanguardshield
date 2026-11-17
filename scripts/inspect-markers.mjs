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
  const content = fs.readFileSync('src/pages/apps/' + f, 'utf8');
  const lines = content.split('\n');
  let retLine = -1;
  let firstTabLine = -1;
  lines.forEach((l, idx) => {
    if (retLine === -1 && l.includes('return (')) {
      retLine = idx + 1;
    }
    if (retLine !== -1 && firstTabLine === -1 && l.includes('activeTab ===') && l.includes('{')) {
      firstTabLine = idx + 1;
    }
  });
  console.log(`${f}: return at line ${retLine}, first tab panel at line ${firstTabLine}`);
});
