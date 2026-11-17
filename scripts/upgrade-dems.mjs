import fs from 'fs';

// ==========================================
// UPGRADE MODULE 06: DEMSPage.tsx
// ==========================================
export function upgradeDEMS() {
  let content = fs.readFileSync('src/pages/apps/DEMSPage.tsx', 'utf8');

  const startMarker = '{/* Top Breadcrumb & Status Bar */}';
  const endMarker = '{/* TAB 1: EVIDENCE REPOSITORY & WORKSPACE */}';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('DEMS markers not found', { startIdx, endIdx });
    return;
  }

  const newHeaderAndKpi = `{/* Top Application Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Mission App 06 // DEMS
                </span>
                <span className="text-xs text-slate-400">CJIS 5.4 / NARA GRS 4.2 / SHA-256</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  SHA-256 Seal Valid
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Digital Evidence Management System (DEMS)
              </h1>
              <p className="text-xs text-slate-400">
                Verifiable chain of custody, cryptographic SHA-256 integrity validation, derivative redactions, statutory retention holds, and legal discovery disclosure.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (selectedEvidence) verifyEvidenceHash(selectedEvidence.id)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Active Hash</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsCustodyReportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Custody Certificate</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsIntakeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Evidence</span>
            </Button>
          </div>
        </div>

        {/* 6 Screen Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-b border-slate-800 -mb-5 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workspace')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'workspace'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Evidence Repository &amp; Workspace</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {evidenceRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'intake'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Evidence Intake &amp; Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('redaction')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'redaction'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Review &amp; Redaction Studio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/60">
              {evidenceDerivatives.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('disclosure')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'disclosure'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Disclosure &amp; Discovery Portal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
              {disclosureGrants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('retention-hold')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'retention-hold'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Retention Schedules &amp; Legal Holds</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {retentionPolicies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custody-ledger')}
            className={\`px-3.5 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap \${
              activeTab === 'custody-ledger'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }\`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Verifiable Chain-of-Custody</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-900/60 text-indigo-300 border border-blue-700/50">
              {custodyEvents.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Evidence Records</span>
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {evidenceRecords.length}{' '}
            <span className="text-xs font-semibold text-emerald-600 font-sans">Ingested</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% SHA-256 Sealed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Legal Holds</span>
            <FolderLock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            {evidenceRecords.filter(e => e.legalHold).length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Active</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Purge Protected</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Redaction Copies</span>
            <Layers className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {evidenceDerivatives.length}{' '}
            <span className="text-xs font-semibold text-teal-600 font-sans">Derivatives</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Originals Immutable</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Active Disclosures</span>
            <Share2 className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-700 font-mono">
            {disclosureGrants.filter(d => d.accessStatus === 'ACTIVE').length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Grants</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Forensic Watermarking</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Custody Ledger</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 font-mono">
            {custodyEvents.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Events</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Tamper-Evident Ledger</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Retention Policies</span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {retentionPolicies.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">Enforced</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">NARA GRS Compliant</div>
        </div>
      </div>
\n\n      `;

  let rest = content.slice(endIdx);

  // Clean navy classes in rest of DEMSPage
  rest = rest.replaceAll('bg-navy-900 border-navy-800 overflow-hidden relative', 'bg-white border-slate-200 overflow-hidden relative');
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
  rest = rest.replaceAll('divide-navy-800/60', 'divide-slate-100');
  rest = rest.replaceAll('hover:bg-navy-800/40', 'hover:bg-slate-50/70');
  rest = rest.replaceAll('hover:bg-navy-800/60', 'hover:bg-slate-50/70');

  const updatedContent = content.slice(0, startIdx) + newHeaderAndKpi + rest;
  fs.writeFileSync('src/pages/apps/DEMSPage.tsx', updatedContent, 'utf8');
  console.log('DEMSPage updated successfully! Remaining navy:', (updatedContent.match(/navy/g) || []).length);
}

upgradeDEMS();
