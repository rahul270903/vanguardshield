import fs from 'fs';

// Helper to replace header and tabs in a file
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

// =========================================================================
// MODULE 07: UnifiedCommPage.tsx
// =========================================================================
export function upgradeModule07() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 07 // UNIFIED-COMM
                </span>
                <span className="text-xs text-slate-400">P25 Phase 2 / SIP-SRTP / FIPS 140-3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SRTP / ISSI Active
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Unified Communications &amp; Dispatch Console
              </h1>
              <p className="text-xs text-slate-400">
                P25 Phase 2 Radio Dispatch • Secure VoIP/SIP • Inter-Agency Conference Bridges • Hardware Cross-Domain Guard
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewGroupModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Provision Talkgroup</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewSessionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dispatch Session</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Dispatch &amp; PTT Console</span>
          </button>

          <button
            onClick={() => setActiveTab('session-control')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'session-control'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Session Control &amp; Bridges</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {activeSessionsCount}
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
            <Users className="w-3.5 h-3.5" />
            <span>Mission Talkgroups</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {commGroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'directory'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Federated Directory</span>
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
            <span>Gateway Administration</span>
          </button>

          <button
            onClick={() => setActiveTab('cross-domain')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'cross-domain'
                ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Cross-Domain Guard (CDS)</span>
            {activeBridgesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 animate-pulse">
                {activeBridgesCount} Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Sessions</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeSessionsCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Voice &amp; Radio
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Mission Talkgroups</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeTalkgroupsCount}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            {patchedTalkgroupsCount} Interop Patched
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Field Endpoints</span>
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {availableUsersCount} <span className="text-xs font-normal text-slate-500">/ {commPresences.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Online &amp; Dispatched</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>SIP Trunks</span>
            <Server className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {operationalTrunksCount} <span className="text-xs font-normal text-slate-500">/ {sipTrunks.length}</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">SBC &amp; P25 ISSI</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>CDS Voice Guard</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeBridgesCount}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Boundary Active</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Security Enclave</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{classificationLevel}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">SRTP AES-256 Enabled</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'UnifiedCommPage.tsx',
    '{/* Top Breadcrumb & Classification Bar */}',
    '{/* ===================================================================== */}\n      {/* SCREEN 1: COMMUNICATIONS DASHBOARD & DISPATCH CONSOLE                 */}',
    replacement
  );
}

// =========================================================================
// MODULE 08: MassNotificationPage.tsx
// =========================================================================
export function upgradeModule08() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-900/60 text-red-300 border border-red-700/50">
                  Mission App 08 // MASS-NOTIFY
                </span>
                <span className="text-xs text-slate-400">IPAWS-OPEN v1.2 / CAP v1.2 OASIS</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  IPAWS / EAS Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Emergency Mass Notification System
              </h1>
              <p className="text-xs text-slate-400">
                FEMA IPAWS EAS &amp; WEA Gateway • Multi-Channel Desktop Takeover • SMS / TTS Voice • Two-Man Dual Custody Authorizations
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('two-man')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Two-Man Approvals ({pendingApprovalsCount})</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleLoadTemplate(notificationTemplates[0])
                setIsComposerModalOpen(true)
              }}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose CAP v1.2 Alert</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'dashboard'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Notification Dashboard</span>
            {activeBroadcastsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                {activeBroadcastsCount} Live
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('composer')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'composer'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CAP v1.2 Alert Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'channels'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <RadioTower className="w-3.5 h-3.5" />
            <span>Multi-Channel Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('targeting')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'targeting'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Targeting &amp; Geofences</span>
          </button>

          <button
            onClick={() => setActiveTab('two-man')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'two-man'
                ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Two-Man Dual Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'telemetry'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Evacuation Muster &amp; Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Broadcasts</span>
            <Megaphone className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{activeBroadcastsCount}</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live On Air
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Two-Man Pending</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">{pendingApprovalsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dual-Key Required</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Channels Ready</span>
            <RadioTower className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {activeChannelsCount} <span className="text-xs font-normal text-slate-500">/ {notificationChannels.length}</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">IPAWS • WEA • EAS</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Target Zones</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{notificationZones.length}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">GIS Polygons Armed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Acknowledge Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-700 font-mono">94.8%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: &gt;90% Standard</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>System Posture</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">FEDCON CUI</div>
          <div className="text-[10px] text-slate-500 mt-0.5">CAP v1.2 Authenticated</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'MassNotificationPage.tsx',
    '{/* Top Breadcrumb & Title Bar */}',
    '{/* ===================================================================== */}\n      {/* SCREEN 1: NOTIFICATION DASHBOARD & LAUNCHPAD                          */}',
    replacement
  );
}

// =========================================================================
// MODULE 09: P25FleetPage.tsx
// =========================================================================
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
    '{/* ===================================================================== */}\n      {/* SCREEN 1: SUBSCRIBER FLEET REGISTRY                                  */}',
    replacement
  );
}

// =========================================================================
// MODULE 10: VRSMBWCPage.tsx
// =========================================================================
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
    '{/* Screen 1: Sensor & BWC Fleet Roster */}',
    replacement
  );
}

// =========================================================================
// MODULE 11: P25InfrastructurePage.tsx
// =========================================================================
export function upgradeModule11() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Mission App 11 // P25-INFRA
                </span>
                <span className="text-xs text-slate-400">TIA-102 Phase 2 Simulcast / FIPS 140-3 L3</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Simulcast Prime Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                On-Prem P25 Infrastructure
              </h1>
              <p className="text-xs text-slate-400">
                Master Prime Site Controllers • Voting Comparator Racks • Microwave Backhaul • Subterranean BDA In-Building Repeaters
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
                  title: 'Infrastructure Telemetry Polled',
                  message: 'All 3 master site controllers & 3 microwave links responded nominal',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Telemetry</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                triggerP25FailoverTest(selectedSiteId)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test Failover</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cores')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'cores'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Master Site Controllers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {p25CoreSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('voters')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'voters'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Comparator / Voting Racks</span>
          </button>

          <button
            onClick={() => setActiveTab('microwave')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'microwave'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Microwave Backhaul Links</span>
          </button>

          <button
            onClick={() => setActiveTab('power')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'power'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Environmental &amp; Power</span>
          </button>

          <button
            onClick={() => setActiveTab('failover')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'failover'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Failover &amp; DR Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Infrastructure Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Trunked Channels</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {totalActiveChannels} <span className="text-xs font-normal text-slate-500">/ {totalChannels}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active Simulcast TDMA Slots</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Core Redundancy</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">100% 1+1 HOT</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Geographic Redundant Standby</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Voting Comparators</span>
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{p25ComparatorVoters.length} Units</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">50 packets/sec voting rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Microwave Backbone</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {optimalMwLinks} <span className="text-xs font-normal text-slate-500">/ {microwaveLinks.length} Locked</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">&lt; 2.5ms average packet latency</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Site Prime Controller</span>
            <Server className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono">ONLINE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Simulcast Synchronization Locked</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Power &amp; Generator</span>
            <Power className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">COMMERCIAL</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Diesel Gen Standby 100% Fuel</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'P25InfrastructurePage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: Master Site Controllers */}',
    replacement
  );
}

// =========================================================================
// MODULE 12: MobileEndpointMDMPage.tsx
// =========================================================================
export function upgradeModule12() {
  const replacement = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 12 // MDM-EUD
                </span>
                <span className="text-xs text-slate-400">DoD DISA STIG / Samsung Knox DualDAR</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Knox DualDAR Nominal
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Secure Mobile &amp; MDM (ATAK / EUD)
              </h1>
              <p className="text-xs text-slate-400">
                Tactical End User Devices (EUD) • Android Team Awareness Kit (ATAK) • Remote Zeroization &amp; Cryptographic Inhibit
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
                  title: 'Fleet Health Polled',
                  message: 'All 4 enrolled tactical EUDs responded with nominal Knox integrity attestations',
                  type: 'info',
                })
              }}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Poll Fleet</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActiveTab('wipe')
              }}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Zeroize Console</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roster')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'roster'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>EUD Fleet Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {mobileEUDs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('atak')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'atak'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ATAK Mission Profiles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {atakPlugins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stig')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'stig'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DISA STIG Posture</span>
          </button>

          <button
            onClick={() => setActiveTab('mam')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'mam'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>MAM &amp; DualDAR Container</span>
          </button>

          <button
            onClick={() => setActiveTab('wipe')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'wipe'
                ? 'border-red-500 text-red-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Remote Inhibit &amp; Zeroize</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mobile Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Enrolled Devices</span>
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{totalEUDs} Units</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tactical Handhelds &amp; Tablets</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>ATAK Connected</span>
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{atakConnected} Nodes</div>
          <div className="text-[10px] text-slate-500 mt-0.5">COP Vector Broadcast Enabled</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>DISA STIG Benchmark</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600 font-mono">{avgStig}% Avg</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DoD Mobility SRG Benchmark</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Posture Pass Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {compliantCount} <span className="text-xs font-normal text-slate-500">/ {totalEUDs} Pass</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">DualDAR Hardware Encryption</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Knox Attestation</span>
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono">HARDWARE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Root of Trust Validated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Inhibit Posture</span>
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">ARMED</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Over-The-Air Zeroize Ready</div>
        </div>
      </div>
\n\n`;

  return updateFileHeaderAndKPI(
    'MobileEndpointMDMPage.tsx',
    '{/* Header Banner */}',
    '{/* Screen 1: EUD Fleet Roster */}',
    replacement
  );
}

// Run 07, 08, 09, 10, 11, 12
upgradeModule07();
upgradeModule08();
upgradeModule09();
upgradeModule10();
upgradeModule11();
upgradeModule12();
