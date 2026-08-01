import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  FolderOpen,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';
import { Case, EvidenceItem, Block, AuditLog } from '../types';
import { formatDate, shortenHash } from '../utils';

interface DashboardViewProps {
  cases: Case[];
  evidence: EvidenceItem[];
  blocks: Block[];
  logs: AuditLog[];
  setActiveTab: (tab: string) => void;
  setSelectedCase: (c: Case) => void;
  setSelectedEvidence: (e: EvidenceItem) => void;
}

export default function DashboardView({
  cases,
  evidence,
  blocks,
  logs,
  setActiveTab,
  setSelectedCase,
  setSelectedEvidence
}: DashboardViewProps) {
  const safeCases = cases || [];
  const safeEvidence = evidence || [];
  const safeBlocks = blocks || [];
  const safeLogs = logs || [];

  // Dynamic stats calculation
  const totalEvidence = safeEvidence.length;
  const activeCases = safeCases.filter(c => c?.status === 'ACTIVE').length;
  const blockHeight = safeBlocks.length > 0 ? Math.max(...safeBlocks.map(b => b?.blockNumber || 0)) : 10000;
  const verificationsCount = safeLogs.filter(l => l?.action === 'COURT_VERIFICATION').length;
  const totalActions = safeLogs.length;

  // Let's create an emergency status banner if any files are marked "TAMPERED" (none initially, but user can triggers it)
  const compromisedFiles = safeEvidence.filter(e => e?.status === 'TAMPERED');


  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Upper Title Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">STATE FORENSICS CONTROL BOARD</span>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">ChainShield Central Ledger</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2EA043] rounded-full animate-pulse" />
            <span className="text-xs font-mono text-[#2EA043] font-semibold">ALL SENSORS ENCRYPTED</span>
          </div>
          <button 
            onClick={() => setActiveTab('verify')}
            className="px-4 py-1.5 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 rounded-lg text-xs font-mono font-semibold text-white flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#1F6FEB]/20"
          >
            <ShieldCheck className="w-4 h-4" /> Run Quick Audit
          </button>
        </div>
      </div>

      {/* Security Threat Broadcast */}
      {compromisedFiles.length > 0 ? (
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl glowing-amber flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-400 uppercase tracking-wide">COMPROMISED SIGNATURE DETECTED</h4>
            <p className="text-xs text-gray-300 mt-1">
              Immediate attention requested: {compromisedFiles.length} file(s) failed standard integrity synchronization metrics. Standard database properties overridden.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#1F6FEB]/5 border border-[#1F6FEB]/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2EA043]" />
            <div>
              <p className="text-xs font-semibold text-white">Consensus Integrity Report</p>
              <p className="text-[11px] text-gray-400">Zero cryptographic discrepancies detected since server cold-boot.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-500">SYSTEM TIME SYNCED</span>
        </div>
      )}

      {/* Statistics Cards Bento-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-[#1F6FEB]/40 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">Evidence Enclave</span>
            <span className="text-2xl font-display font-bold text-white tracking-tight">{totalEvidence} Files</span>
            <span className="text-[10px] text-[#2EA043] font-mono block mt-1">▲ 100% Locked & Vaulted</span>
          </div>
          <div className="p-3 bg-[#1F6FEB]/5 rounded-lg border border-gray-800/80 group-hover:bg-[#1F6FEB]/10 group-hover:border-[#1F6FEB]/20 transition-all duration-300">
            <FileText className="w-5 h-5 text-[#1F6FEB]" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-[#2EA043]/40 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">Audit Proof Height</span>
            <span className="text-2xl font-display font-bold text-white tracking-tight">#{blockHeight}</span>
            <span className="text-[10px] text-gray-400 font-mono block mt-1">Consensus: Proof-of-Authority</span>
          </div>
          <div className="p-3 bg-[#2EA043]/5 rounded-lg border border-gray-800/80 group-hover:bg-[#2EA043]/10 group-hover:border-[#2EA043]/20 transition-all duration-300">
            <Database className="w-5 h-5 text-[#2EA043]" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-yellow-500/40 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">Active Cases</span>
            <span className="text-2xl font-display font-bold text-white tracking-tight">{activeCases} Vaults</span>
            <span className="text-[10px] text-yellow-500/80 font-mono block mt-1">Critical Priority: {cases.filter(c => c.priority === 'CRITICAL').length}</span>
          </div>
          <div className="p-3 bg-yellow-500/5 rounded-lg border border-gray-800/80 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/20 transition-all duration-300">
            <FolderOpen className="w-5 h-5 text-[#D29922]" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-[#2EA043]/40 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">Courtroom Audits</span>
            <span className="text-2xl font-display font-bold text-white tracking-tight">{verificationsCount} Checked</span>
            <span className="text-[10px] text-[#2EA043] font-mono block mt-1">Success verification rate: 100%</span>
          </div>
          <div className="p-3 bg-[#2EA043]/5 rounded-lg border border-gray-800/80 group-hover:bg-[#2EA043]/10 group-hover:border-[#2EA043]/20 transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-[#2EA043]" />
          </div>
        </div>
      </div>

      {/* Graphs, charts & Live Ledger Block Stream Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Volume Graphic Panel */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Ingestion Chronology & Ledger Volume</h3>
              <p className="text-xs text-gray-400">Total evidence submitted and certified on ledger over current week</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#1F6FEB]" />
          </div>

          {/* Elegant Custom SVG Graph to represent data beautifully and reliably */}
          <div className="h-48 w-full bg-[#0D1117]/60 rounded-lg p-2 border border-gray-800/60 relative flex flex-col justify-between">
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
              <div className="border-b border-gray-800/50 w-full h-0" />
              <div className="border-b border-gray-800/50 w-full h-0" />
              <div className="border-b border-gray-800/50 w-full h-0" />
              <div className="border-b border-gray-800/50 w-full h-0" />
            </div>

            {/* Custom SVG line with a glowing gradient overlay */}
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F6FEB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1F6FEB" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid guides */}
              <line x1="50" y1="10" x2="50" y2="130" stroke="#1f2937" strokeDasharray="3,3" />
              <line x1="125" y1="10" x2="125" y2="130" stroke="#1f2937" strokeDasharray="3,3" />
              <line x1="200" y1="10" x2="200" y2="130" stroke="#1f2937" strokeDasharray="3,3" />
              <line x1="275" y1="10" x2="275" y2="130" stroke="#1f2937" strokeDasharray="3,3" />
              <line x1="350" y1="10" x2="350" y2="130" stroke="#1f2937" strokeDasharray="3,3" />
              <line x1="425" y1="10" x2="425" y2="130" stroke="#1f2937" strokeDasharray="3,3" />

              {/* Area map filled under line */}
              <path 
                d="M 50 120 Q 125 70, 200 80 T 350 40 T 450 30 L 450 130 L 50 130 Z" 
                fill="url(#glowGrad)" 
              />
              {/* Graphic line path */}
              <path 
                d="M 50 120 Q 125 70, 200 80 T 350 40 T 450 30" 
                fill="none" 
                stroke="#1F6FEB" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />

              {/* Glowing anchor dots */}
              <circle cx="50" cy="120" r="4" fill="#1F6FEB" stroke="#0D1117" strokeWidth="2" />
              <circle cx="125" cy="70" r="4" fill="#2EA043" stroke="#0D1117" strokeWidth="2" />
              <circle cx="200" cy="80" r="4" fill="#1F6FEB" stroke="#0D1117" strokeWidth="2" />
              <circle cx="275" cy="60" r="4" fill="#1F6FEB" stroke="#0D1117" strokeWidth="2" />
              <circle cx="350" cy="40" r="4" fill="#D29922" stroke="#0D1117" strokeWidth="2" />
              <circle cx="450" cy="30" r="5" fill="#2EA043" className="animate-pulse" />
            </svg>

            <div className="z-10 flex justify-between font-mono text-[9px] text-gray-500 mt-auto px-4 pt-40">
              <span>Mon (Ingested)</span>
              <span>Tue (Audited)</span>
              <span>Wed (Ingested)</span>
              <span>Thu (Ingested)</span>
              <span>Fri (Court Verify)</span>
              <span>Today (State Synced)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 text-center pt-2">
            <div className="border-r border-gray-800">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Daily Peak Ingestion</span>
              <span className="text-sm font-display font-bold text-white mt-0.5">4.2 GB / hr</span>
            </div>
            <div className="border-r border-gray-800">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Blockchain Consensus</span>
              <span className="text-sm font-display font-bold text-[#2EA043] mt-0.5">&lt; 1.8s Finality</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Data Retention Integrity</span>
              <span className="text-sm font-display font-bold text-white mt-0.5">100% Cryptographic</span>
            </div>
          </div>
        </div>

        {/* Live Scrolling Ledger Block Stream Feed */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#2EA043]" />
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Live Ledger Feed</h3>
            </div>
            <span className="text-[9px] font-mono text-[#2EA043] uppercase animate-pulse">● Live Mined</span>
          </div>

          {/* Active ledger blocks list */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {blocks.slice(0, 4).map((b) => (
              <div 
                key={b.blockNumber} 
                className="p-3 bg-[#0D1117]/60 border border-gray-800 hover:border-[#1F6FEB]/30 rounded-lg space-y-1.5 transition-all duration-200 group cursor-pointer"
                onClick={() => setActiveTab('explorer')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1F6FEB]">Block #{b.blockNumber}</span>
                  <span className="text-[9px] font-mono text-gray-500">{formatDate(b.timestamp).substring(11, 19)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-sans truncate max-w-[120px]">{b.evidenceName}</span>
                  <span className="font-mono text-[9px] bg-gray-800/60 px-1.5 py-0.5 rounded text-gray-300">
                    {shortenHash(b.currentHash, 4, 4)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#2EA043] font-mono">
                  <ShieldCheck className="w-3 h-3 text-[#2EA043]" />
                  <span>Immutable Lock Confirmed</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab('explorer')}
            className="w-full text-center py-2 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-lg text-xs font-mono text-[#1F6FEB] tracking-wide transition-all duration-200 mt-2"
          >
            Launch Ledger Block Explorer &rarr;
          </button>
        </div>
      </div>

      {/* Split layout: Recent Cases & Dynamic Timeline logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Cases container */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Active Case Lockers</h3>
            <span className="text-xs text-gray-400 font-mono">Total Cases: {cases.length}</span>
          </div>

          <div className="space-y-3">
            {cases.slice(0, 3).map((c) => (
              <div 
                key={c.id}
                className="p-3.5 bg-[#0D1117]/50 hover:bg-[#0D1117]/80 border border-gray-800 hover:border-gray-700 rounded-lg flex items-center justify-between gap-4 transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedCase(c);
                  setActiveTab('cases');
                }}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-gray-800 px-2 py-0.5 rounded font-semibold text-gray-300">{c.id}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase
                      ${c.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        c.priority === 'HIGH' ? 'bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20' : 
                        'bg-gray-800 text-gray-400 border border-gray-700'}
                    `}>
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#F0F6FC] truncate mt-1">{c.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{c.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold block text-white">
                      {c.evidenceIds.length} Items
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase">Vault Secure</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Activity Log Timeline */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Recent Chain-of-Custody Events</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-800">
            {logs.slice(0, 3).map((l) => (
              <div key={l.id} className="relative pl-6 space-y-1">
                {/* Node indicator */}
                <span className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-[#0D1117]
                  ${l.action === 'INGESTION' ? 'bg-[#2EA043]' :
                    l.action === 'COURT_VERIFICATION' ? 'bg-[#1F6FEB]' :
                    'bg-[#D29922]'}
                `} />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white uppercase font-mono tracking-wider">
                    {l.action.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500">{formatDate(l.timestamp).substring(0, 16)}</span>
                </div>
                <p className="text-[11px] text-gray-400">{l.details}</p>
                <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500">
                  <span>Signer: {l.officer}</span>
                  <span>•</span>
                  <span>Loc: {l.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
