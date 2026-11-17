const fs = require('fs');
const path = require('path');

// Clean SituationalIntelPage.tsx
let m4 = fs.readFileSync('src/pages/apps/SituationalIntelPage.tsx', 'utf8');
m4 = m4.replace(/<Card className="bg-navy-900 border-navy-800"/g, '<Card className="bg-white border-slate-200"');
m4 = m4.replace(/<Card className="bg-navy-900 border-navy-800 overflow-hidden relative"/g, '<Card className="bg-slate-950 border-slate-800 overflow-hidden relative"');
m4 = m4.replace(/border-navy-800/g, 'border-slate-200');
m4 = m4.replace(/border-navy-700/g, 'border-slate-300');
m4 = m4.replace(/text-navy-400/g, 'text-slate-500');
m4 = m4.replace(/text-navy-300/g, 'text-slate-600');
m4 = m4.replace(/text-navy-200/g, 'text-slate-700');
m4 = m4.replace(/text-navy-500/g, 'text-slate-400');
m4 = m4.replace(/bg-navy-950\/80/g, 'bg-slate-900/90');
m4 = m4.replace(/bg-navy-950\/85/g, 'bg-slate-900/90');
m4 = m4.replace(/bg-navy-950\/70/g, 'bg-slate-50');
m4 = m4.replace(/bg-navy-950\/60/g, 'bg-slate-50');
m4 = m4.replace(/bg-navy-950/g, 'bg-slate-900');
m4 = m4.replace(/bg-navy-900\/60/g, 'bg-white');
m4 = m4.replace(/bg-navy-900/g, 'bg-white');
fs.writeFileSync('src/pages/apps/SituationalIntelPage.tsx', m4, 'utf8');
console.log('SituationalIntelPage updated, remaining navy occurrences:', (m4.match(/navy/g) || []).length);
