import fs from 'fs';

// 1. Fix CSfCTrustedIntegrationPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/CSfCTrustedIntegrationPage.tsx', 'utf8');
  file = file.replace(
    '{csfcGateways.filter((g) => g.pqcEnabled).length}',
    '{csfcGateways.filter((g) => g.postQuantumAlgorithm.includes("ML-KEM")).length}'
  );
  fs.writeFileSync('src/pages/apps/CSfCTrustedIntegrationPage.tsx', file, 'utf8');
  console.log('Fixed CSfCTrustedIntegrationPage');
}

// 2. Fix P25FleetPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/P25FleetPage.tsx', 'utf8');
  file = file.replace(
    '{inhibitedRadiosCount > 0 && (',
    '{stunnedCount > 0 && ('
  );
  file = file.replace(
    '<div className="text-xl font-bold text-slate-900 font-mono">{subscriberRadios.length}</div>',
    '<div className="text-xl font-bold text-slate-900 font-mono">{radios.length}</div>'
  );
  fs.writeFileSync('src/pages/apps/P25FleetPage.tsx', file, 'utf8');
  console.log('Fixed P25FleetPage');
}

// 3. Fix VRSMBWCPage.tsx
{
  let file = fs.readFileSync('src/pages/apps/VRSMBWCPage.tsx', 'utf8');
  file = file.replace(
    '{bwcDockingStations.filter((d) => d.status === "DOCK_OFFLOADING").length}',
    '{bwcDockingStations.filter((d) => d.offloadStatus === "OFFLOADING_ACTIVE").length}'
  );
  fs.writeFileSync('src/pages/apps/VRSMBWCPage.tsx', file, 'utf8');
  console.log('Fixed VRSMBWCPage');
}
