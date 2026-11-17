import fs from 'fs';

function updateFileHeaderAndKPI(filename, startMarker, endMarker, replacementCode) {
  let content = fs.readFileSync('src/pages/apps/' + filename, 'utf8');
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`Markers not found for ${filename}:`, { startIdx, endIdx, startMarker, endMarker });
    return false;
  }

  const updatedContent = content.slice(0, startIdx) + replacementCode + content.slice(endIdx);
  fs.writeFileSync('src/pages/apps/' + filename, updatedContent, 'utf8');
  console.log(`Successfully upgraded ${filename}`);
  return true;
}

// MODULE 09: P25FleetPage.tsx
export function upgradeModule09() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <RadioTower className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 09 // P25-FLEET
                </span>
                <span className="text-xs text-slate-400">TIA-102 Phase 2 / OTAR AES-256</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  P25 Core Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                P25 Smart Radio Fleet Management
              </h1>
              <p className="text-xs text-slate-400">
                APCO Project 25 Phase 2 TDMA Fleetmap • Over-The-Air Rekeying (OTAR) • Emergency Inhibit/Stun/Zeroize • Simulcast Tower Telemetry
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProvisionTgModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Provision Talkgroup</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Subscriber Radio</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'fleet'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Subscriber Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {subscriberRadios.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('talkgroups')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'talkgroups'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>P25 Talkgroups &amp; Trunking</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {p25Talkgroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('otar')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'otar'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>OTAR Key Management (KMF)</span>
          </button>

          <button
            onClick={() => setActiveTab('inhibit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'inhibit'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Emergency Stun &amp; Inhibit</span>
            {inhibitedRadiosCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {inhibitedRadiosCount} Stunned
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('repeaters')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'repeaters'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <RadioTower className="w-3.5 h-3.5" />
            <span>Simulcast Towers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {p25Repeaters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'telemetry'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radio Telemetry &amp; GPS</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Subscribers</span>
            <Radio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{subscriberRadios.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">P25 Phase 2 Radios</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Online &amp; Affiliated</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {activeRadiosCount} <span className="text-xs font-normal text-slate-500">/ {subscriberRadios.length}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Simulcast Locked</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Trunked Talkgroups</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{p25Talkgroups.length}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">NCR Federal Talkgroups</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>OTAR Rekey Status</span>
            <KeyRound className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700 font-mono">CURRENT</div>
          <div className="text-[10px] text-slate-500 mt-0.5">AES-256 Key Epoch Synced</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inhibited / Stunned</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{inhibitedRadiosCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Emergency Posture</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Tower Sites Nominal</span>
            <RadioTower className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {p25Repeaters.filter((r) => r.status === 'ONLINE').length} <span className="text-xs font-normal text-slate-500">/ {p25Repeaters.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulcast Sub-system</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'P25FleetPage.tsx',
    '{/* Top Breadcrumb & Title Bar */}',
    '{/* ===================================================================== */}\n      {/* SCREEN 1: FLEET SUBSCRIBER ROSTER                                     */}',
    replacement
  );
}

// MODULE 10: VRSMBWCPage.tsx
export function upgradeModule10() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 10 // VRSM-BWC
                </span>
                <span className="text-xs text-slate-400">CJIS v5.9 / Axon &amp; WatchGuard / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  VRSM Fleet Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Vehicle &amp; Body-Worn Sensor Video (VRSM-BWC)
              </h1>
              <p className="text-xs text-slate-400">
                Axon Body 4 &amp; WatchGuard V300 Telemetry • Automated Holster &amp; Crash Sensors • Gigabit Docking Offload • DEMS Ingestion
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
                  title: 'Fleet Health Ping Dispatched',
                  message: 'All transceivers and body-worn sensors responded nominal via LTE/FirstNet',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Ping Fleet</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab('triggers')
                addToast({
                  title: 'Sensor Integration Mode',
                  message: 'Select device to simulate holster-draw or crash accelerometer sensor trip',
                  type: 'info',
                })
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Trigger</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'fleet'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Sensor &amp; BWC Fleet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {vrsmDevices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('streaming')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'streaming'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Video Streams</span>
            {activeRecordingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {activeRecordingCount} Rec
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('triggers')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'triggers'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automated Triggers</span>
          </button>

          <button
            onClick={() => setActiveTab('docking')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'docking'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Gigabit Docking Stations</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Evidence &amp; Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CJIS &amp; Policy Compliance</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Sensors</span>
            <Camera className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{vrsmDevices.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Axon Body 4 &amp; V300</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Recording Active</span>
            <Video className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono">{activeRecordingCount}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Encrypted Livestream
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Triggers (24h)</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{vrsmTriggers.length}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Holster / Crash Automated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Docked Offloading</span>
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{dockedCount}</div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Gigabit DEMS Pipeline</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CJIS Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">100% PASS</div>
          <div className="text-[10px] text-slate-500 mt-0.5">FIPS 140-3 Cryptographic</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Offload Ingested</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">248.5 GB</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DEMS SHA-256 Validated</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'VRSMBWCPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: BWC & In-Car Fleet Operations Hub */}',
    replacement
  );
}

// MODULE 13: CSfCTrustedIntegrationPage.tsx
export function upgradeModule13() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Mission App 13 // CSFC-TRUST
                </span>
                <span className="text-xs text-slate-400">NSA Capability Package v2.5 / CNSA 2.0 PQC</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Dual-Tunnel Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                CSfC Trusted Integration
              </h1>
              <p className="text-xs text-slate-400">
                Commercial Solutions for Classified • Dual-Tunnel IPsec / MACsec Architecture • Kyber ML-KEM-768 Cryptographic Mesh
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
                  title: 'CSfC Mesh Telemetry Polled',
                  message: 'All 3 dual-tunnel gateways verified nominal with active IKEv2 Suite B SA negotiations',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Gateways</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                rotateCSfCKeys(selectedGatewayId)
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Rotate Keys</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tunnels')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'tunnels'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dual-Tunnel Mesh</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
              {csfcGateways.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'packages'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>NSA Capability Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('pqc')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'pqc'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Post-Quantum Crypto (ML-KEM)</span>
          </button>

          <button
            onClick={() => setActiveTab('blackred')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'blackred'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Black/Red Network Isolation</span>
          </button>

          <button
            onClick={() => setActiveTab('rekey')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'rekey'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Dynamic Rekey Orchestration</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSfC Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Dual-Tunnel Mesh</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {establishedTunnels} <span className="text-xs font-normal text-slate-500">/ {totalGateways} Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Inner + Outer IPsec Layered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CNSA 2.0 PQC Ready</span>
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">{pqcReadyCount} Gateways</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Kyber ML-KEM-768 Hybrid</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Throughput Sealed</span>
            <Network className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {totalThroughputGbps.toFixed(1)} Gbps
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hardware MACsec Wire-Speed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Next Scheduled Rekey</span>
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">03h 42m</div>
          <div className="text-[10px] text-slate-500 mt-0.5">IKEv2 Automated Key Rotation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>NSA Capability Package</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">CP v2.5 PASS</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dual-Independent Vendor Stacks</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Red/Black Air Gap</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">ISOLATED</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Galvanic Hardware Separation</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'CSfCTrustedIntegrationPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: Dual-Tunnel Gateways */}',
    replacement
  );
}

// MODULE 14: DeviceOperationsPage.tsx
export function upgradeModule14() {
  const replacement = `{/* Top Application Bar */}
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
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Depot Inventory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {depotAssets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('battery')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'battery'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Battery Health Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'firmware'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>OTA Firmware Campaigns</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Maintenance &amp; RMA Orders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {depotWorkOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'calibration'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>RF Calibration Bench</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
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
\n\n`;

  return updateFileHeaderAndKPI(
    'DeviceOperationsPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: Depot Asset Inventory */}',
    replacement
  );
}

// MODULE 15: CybersecuritySOCPage.tsx
export function upgradeModule15() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-900/60 text-rose-300 border border-rose-700/50">
                  Mission App 15 // CYBER-SOC
                </span>
                <span className="text-xs text-slate-400">FedRAMP High SIEM / NIST SP 800-53 r5</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SOC SIEM Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Cybersecurity SOC &amp; Cyber-Physical Defense
              </h1>
              <p className="text-xs text-slate-400">
                Unified IT/OT/RF Threat Monitoring • Automated Containment Playbooks • Cyber-Physical Building Automation Sensors
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
                  title: 'SOC Threat Feeds Polled',
                  message: 'All SIEM, OT Modbus sensors, and WAF rate limiters verified nominal',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Threat Grid</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActiveTab('containment')
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Containment Center</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('threats')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'threats'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SIEM Threat Console</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
              {cyberThreats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'sensors'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>OT / Cyber-Physical Sensors</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
              {cyberPhysicalSensors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mitre')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'mitre'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>MITRE ATT&amp;CK Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('containment')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'containment'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Automated Containment</span>
          </button>

          <button
            onClick={() => setActiveTab('vulns')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'vulns'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CVE &amp; Patch Governance</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SOC Incident Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Threats</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono">{totalThreats} Events</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Correlated by FedRAMP SIEM</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Critical Severity</span>
            <Zap className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-600 font-mono">{criticalThreats} Priority 1</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5">Immediate Triage Armed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Contained / Mitigated</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {containedCount} <span className="text-xs font-normal text-slate-500">/ {totalThreats}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Automated SOAR Execution</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Cyber-Physical Sensors</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">
            {normalSensors} <span className="text-xs font-normal text-slate-500">/ {cyberPhysicalSensors.length} Normal</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">BACnet / Modbus Grid Sentry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Zero Trust Architecture</span>
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">NIST 800-207</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Continuous Micro-Segmentation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>SOC Readiness Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">NOMINAL</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">24/7 Watch Desk Armed</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'CybersecuritySOCPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: SIEM Threat Console */}',
    replacement
  );
}

// MODULE 16: CriticalConnectPage.tsx
export function upgradeModule16() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Mission App 16 // INTEROP-BRIDGE
                </span>
                <span className="text-xs text-slate-400">TIA-102 ISSI / CSSI / 3GPP MCX FirstNet</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Cloud Interop Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Critical Connect Interoperability Gateway
              </h1>
              <p className="text-xs text-slate-400">
                Cloud-to-Cloud Inter-Agency PTT Routing • P25 to FirstNet Broadband Bridges • Cross-Agency Dynamic Encryption
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
                  title: 'Interop Gateways Polled',
                  message: 'All 3 cloud ISSI/CSSI cross-domain session border controllers verified active',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Gateways</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTab('create')
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Patch</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bridges')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'bridges'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interop Patch Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
              {interopBridges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Talkgroup Translation Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('issi')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'issi'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>P25 ISSI / CSSI Trunks</span>
          </button>

          <button
            onClick={() => setActiveTab('broadband')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'broadband'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>FirstNet / Broadband Push-To-Talk</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Cross-Agency Patch</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Interop Bridge Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inter-Agency Bridges</span>
            <Network className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {activeBridges} <span className="text-xs font-normal text-slate-500">/ {totalBridges} Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ISSI / CSSI Cloud Patches</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active PTT Sessions</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{activeSessions} Live</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">FirstNet + P25 Cross-Call</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Participating Agencies</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">
            {uniqueAgencies} Fed / Local
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">USSS, FBI, MPD, Park Police</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Network Latency</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">18ms Avg</div>
          <div className="text-[10px] text-slate-500 mt-0.5">SLA Target &lt; 50ms (3GPP MCX)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Cross-Encryption Gateway</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">AES-256 OTAR</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Hardware Cryptographic Relay</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Critical Connect Gateway</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">NOMINAL</div>
          <div className="text-[10px] text-slate-500 mt-0.5">FedRAMP In-Process Core</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'CriticalConnectPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: Active Interop Bridges */}',
    replacement
  );
}

// Execute
upgradeModule09();
upgradeModule10();
upgradeModule13();
upgradeModule14();
upgradeModule15();
upgradeModule16();
