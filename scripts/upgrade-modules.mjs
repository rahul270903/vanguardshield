import fs from 'fs';

// ==========================================
// UPGRADE MODULE 05: MANETPage.tsx
// ==========================================
function upgradeMANET() {
  let content = fs.readFileSync('src/pages/apps/MANETPage.tsx', 'utf8');

  const startMarker = '{/* Top Breadcrumb & Status Bar */}';
  const endMarker = '{/* TAB 1: MESH TOPOLOGY CONSOLE */}';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('MANET markers not found', { startIdx, endIdx });
    return;
  }

  const newHeaderAndKpi = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 05 // MANET-TACCOM
                </span>
                <span className="text-xs text-slate-400">TSM / Silvus MIMO / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  TSM / MIMO Active
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                MANET Tactical Communications &amp; Mobile Mesh Network
              </h1>
              <p className="text-xs text-slate-400">
                Self-forming, self-healing ad-hoc tactical mesh networking with FIPS 140-3 mutual authentication, QoS prioritization, and enterprise gateway bridging.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const activeLink = meshLinks[0]
                if (activeLink) simulateLinkBreak(activeLink.id)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Mesh Heal</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsFleetZeroizeModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fleet Zeroize</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Mesh Node</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('topology')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'topology'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Mesh Topology Console</span>
          </button>

          <button
            onClick={() => setActiveTab('enrollment')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'enrollment'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Node Enrollment &amp; Posture</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {meshNodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'profiles'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mission Network Profiles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/60">
              {missionProfiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('link-monitor')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'link-monitor'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Link Monitor &amp; RF Telemetry</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {meshLinks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security-events')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'security-events'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security &amp; Zeroization</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {manetSecurityEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'gateways'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Tactical Gateways &amp; Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-cyan-300 border border-blue-700/50">
              {tacticalGateways.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mesh Nodes</span>
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {meshNodes.filter(n => n.status === 'ACTIVE').length}{' '}
            <span className="text-xs font-semibold text-emerald-600 font-sans">
              / {meshNodes.length} Online
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% FIPS 140-3 Validated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active RF Links</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {meshLinks.filter(l => l.status === 'OPTIMAL').length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">
              / {meshLinks.length} Links
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Avg Latency: 12ms</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>RF Spectrum Band</span>
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            2,240 <span className="text-xs font-normal text-slate-500 font-sans">MHz</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">S-Band MIMO (10 MHz BW)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mission Profile</span>
            <Shield className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono truncate">
            {activeProfile.missionCode}
          </div>
          <div className="text-[10px] text-teal-600 font-medium mt-0.5">QoS: Voice Priority 1</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Primary Gateway</span>
            <Server className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            SATCOM <span className="text-xs font-semibold text-emerald-600 font-sans">184M</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Starlink HP Flat Uplink</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>OTAR Key Epoch</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            AES-256
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Next Rekey: 8h 14m</div>
        </div>
      </div>
\n\n      `;

  let rest = content.slice(endIdx);

  // Clean navy classes in rest of MANETPage
  rest = rest.replaceAll('bg-navy-900 border-navy-800 overflow-hidden relative', 'bg-slate-950 border-slate-800 overflow-hidden relative');
  rest = rest.replaceAll('bg-navy-900 border-navy-800', 'bg-white border-slate-200');
  rest = rest.replaceAll('border-navy-800/60', 'border-slate-100');
  rest = rest.replaceAll('border-navy-800/80', 'border-slate-200');
  rest = rest.replaceAll('border-navy-800', 'border-slate-200');
  rest = rest.replaceAll('border-navy-700', 'border-slate-300');
  rest = rest.replaceAll('text-navy-400', 'text-slate-500');
  rest = rest.replaceAll('text-navy-300', 'text-slate-600');
  rest = rest.replaceAll('text-navy-200', 'text-slate-700');
  rest = rest.replaceAll('text-navy-500', 'text-slate-400');
  rest = rest.replaceAll('bg-navy-950/85', 'bg-slate-900/90');
  rest = rest.replaceAll('bg-navy-950/80', 'bg-slate-50');
  rest = rest.replaceAll('bg-navy-950/70', 'bg-slate-50');
  rest = rest.replaceAll('bg-navy-950/60', 'bg-slate-50');
  rest = rest.replaceAll('bg-navy-950', 'bg-white');
  rest = rest.replaceAll('bg-navy-900/60', 'bg-white');
  rest = rest.replaceAll('bg-navy-900/80', 'bg-slate-100');
  rest = rest.replaceAll('bg-navy-900', 'bg-white');
  rest = rest.replaceAll('placeholder-navy-500', 'placeholder-slate-400');

  const updatedContent = content.slice(0, startIdx) + newHeaderAndKpi + rest;
  fs.writeFileSync('src/pages/apps/MANETPage.tsx', updatedContent, 'utf8');
  console.log('MANETPage updated successfully! Navy count:', (updatedContent.match(/navy/g) || []).length);
}

upgradeMANET();
