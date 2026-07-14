import React from 'react';
import { 
  Search, 
  Filter, 
  FolderOpen, 
  Plus, 
  User, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronRight,
  FileCheck,
  Tag
} from 'lucide-react';
import { Case, EvidenceItem, AuditLog } from '../types';
import { formatDate, shortenHash } from '../utils';

interface CasesViewProps {
  cases: Case[];
  evidence: EvidenceItem[];
  logs: AuditLog[];
  setSelectedEvidence: (e: EvidenceItem) => void;
  setActiveTab: (tab: string) => void;
  selectedCase: Case | null;
  setSelectedCase: (c: Case | null) => void;
  onAddCase: (newCase: Case) => void;
  currentUser: string;
  badgeNumber: string;
}

export default function CasesView({
  cases,
  evidence,
  logs,
  setSelectedEvidence,
  setActiveTab,
  selectedCase,
  setSelectedCase,
  onAddCase,
  currentUser,
  badgeNumber
}: CasesViewProps) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  // Form states for creating new Case
  const [newCaseTitle, setNewCaseTitle] = React.useState('');
  const [newCaseDesc, setNewCaseDesc] = React.useState('');
  const [newCasePriority, setNewCasePriority] = React.useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.assignedOfficer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    const newCase: Case = {
      id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      title: newCaseTitle,
      description: newCaseDesc,
      status: 'ACTIVE',
      priority: newCasePriority,
      assignedOfficer: currentUser,
      badgeNumber: badgeNumber,
      department: 'Cyber Forensics Unit',
      createdAt: new Date().toISOString(),
      evidenceIds: []
    };

    onAddCase(newCase);
    setNewCaseTitle('');
    setNewCaseDesc('');
    setShowCreateModal(false);
    setSelectedCase(newCase); // Open the details page for the newly created case
  };

  // If a case is selected, show case details screen
  if (selectedCase) {
    const caseEvidence = evidence.filter(ev => ev.caseId === selectedCase.id);
    const caseLogs = logs.filter(l => caseEvidence.some(ev => ev.id === l.evidenceId));

    return (
      <div className="space-y-6 text-[#F0F6FC]">
        {/* Back and title bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedCase(null)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-gray-800 px-2.5 py-0.5 rounded text-gray-300 font-bold uppercase tracking-wider">{selectedCase.id}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase
                  ${selectedCase.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    selectedCase.priority === 'HIGH' ? 'bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20' : 
                    'bg-gray-800 text-gray-400 border border-gray-700'}
                `}>
                  {selectedCase.priority} Priority
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                  {selectedCase.status}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl tracking-tight text-white mt-1.5">{selectedCase.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg text-xs font-mono font-semibold text-gray-300 flex items-center gap-2 transition-all duration-200"
            >
              <Printer className="w-4 h-4" /> Print Court Docket
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 rounded-lg text-xs font-mono font-semibold text-white flex items-center gap-2 transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> Ingest New File
            </button>
          </div>
        </div>

        {/* Info Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Case Details Locker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description card */}
            <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3">
              <h3 className="text-xs font-mono text-[#8B949E] uppercase tracking-wider">Vault Core Intelligence Summary</h3>
              <p className="text-sm leading-relaxed text-gray-200">{selectedCase.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
                <div>
                  <span className="font-mono text-[10px] block text-gray-500 uppercase">Assigned Custodian</span>
                  <span className="font-semibold text-white mt-1 block flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {selectedCase.assignedOfficer}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] block text-gray-500 uppercase">Badge Index</span>
                  <span className="font-mono text-white mt-1 block">{selectedCase.badgeNumber}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] block text-gray-500 uppercase">Agency Department</span>
                  <span className="font-semibold text-white mt-1 block">{selectedCase.department}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] block text-gray-500 uppercase">Creation Time</span>
                  <span className="font-mono text-white mt-1 block">{formatDate(selectedCase.createdAt).substring(0, 10)}</span>
                </div>
              </div>
            </div>

            {/* Evidence items grid list inside Case */}
            <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm tracking-wide text-white">Active Case Evidence Locker</h3>
                <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{caseEvidence.length} Total Files</span>
              </div>

              {caseEvidence.length === 0 ? (
                <div className="p-8 text-center bg-[#0D1117]/40 border border-dashed border-gray-800 rounded-lg space-y-2">
                  <FolderOpen className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No cryptographic files registered inside this case folder yet.</p>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="text-xs font-mono text-[#1F6FEB] underline hover:text-white"
                  >
                    Ingest first evidence signature &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseEvidence.map((ev) => (
                    <div 
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvidence(ev);
                        setActiveTab('upload'); // Switch to active upload context or detail
                      }}
                      className="p-4 bg-[#0D1117]/60 border border-gray-800 hover:border-[#1F6FEB]/40 rounded-xl space-y-3 cursor-pointer group transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="overflow-hidden">
                          <span className="text-[9px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-semibold">{ev.id}</span>
                          <h4 className="text-xs font-bold text-white truncate mt-1.5 group-hover:text-[#1F6FEB] transition-colors">{ev.name}</h4>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{ev.type} • {shortenHash(ev.sha256, 6, 6)}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#2EA043]/10 text-[#2EA043] border border-[#2EA043]/20 rounded-full font-bold uppercase shrink-0">
                          {ev.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-mono text-[9px] text-gray-500">Block #{ev.blockNumber}</span>
                        <span className="flex items-center gap-1">Verify Signature <ArrowRight className="w-3 h-3 text-[#1F6FEB] group-hover:translate-x-1 transition-transform" /></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sideroad audit custody tracker logs */}
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Specific Custody Timeline</h3>
            
            {caseLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No historical activities logged for this case docket.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-800">
                {caseLogs.map((l) => (
                  <div key={l.id} className="relative pl-6 space-y-1">
                    <span className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#1F6FEB] border border-gray-900" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-white uppercase">{l.action.replace('_', ' ')}</span>
                      <span className="text-[9px] font-mono text-gray-500">{formatDate(l.timestamp).substring(5, 16)}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{l.details}</p>
                    <div className="text-[9px] font-mono text-gray-500">
                      Officer: {l.officer} ({l.badgeNumber})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Title bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">CRIMINAL INVESTIGATIONS</span>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Secured Case Directory</h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 rounded-lg text-xs font-mono font-semibold text-white flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#1F6FEB]/20"
        >
          <Plus className="w-4 h-4" /> Create New Case Vault
        </button>
      </div>

      {/* Directory Search & Filters Panel */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search cases by ID, title, or assigned investigator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-gray-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#1F6FEB] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#0D1117] border border-gray-800 rounded-lg px-2 py-1 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none text-[11px]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1117] border border-gray-800 rounded-lg px-2 py-1 text-xs shrink-0">
            <Tag className="w-3.5 h-3.5 text-gray-500" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none text-[11px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COURT_HEARING">Court Hearing</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table Grid */}
      <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#161B22]/70 border-b border-gray-800 text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4">Case ID</th>
                <th className="p-4">Case Title</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Custodian</th>
                <th className="p-4">Status</th>
                <th className="p-4">Evidence Locker</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                    No cases match filter parameters or directory indexing is empty.
                  </td>
                </tr>
              ) : (
                currentCases.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-gray-800/25 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCase(c)}
                  >
                    <td className="p-4 font-mono font-bold text-gray-300">{c.id}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white group-hover:text-[#1F6FEB] transition-colors">{c.title}</span>
                        <p className="text-[11px] text-gray-400 truncate max-w-[240px]">{c.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase
                        ${c.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          c.priority === 'HIGH' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                          'bg-gray-800 text-gray-400 border border-gray-700'}
                      `}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.assignedOfficer}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#1F6FEB]">
                      {evidence.filter(ev => ev.caseId === c.id).length} Files
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCases.length)} of {filteredCases.length} cases</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel-heavy p-6 rounded-2xl border border-gray-700 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white">Create New Investigation Docket</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Case Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Heist at Main Street Terminal"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#1F6FEB] text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Case Intelligence Narrative / Description</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Provide precise details of crime scene, cyber parameters involved, suspect details..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#1F6FEB] text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Security Case Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewCasePriority(p)}
                      className={`py-2 rounded-lg font-mono text-[10px] font-bold border transition-all duration-200
                        ${newCasePriority === p 
                          ? 'bg-[#1F6FEB]/10 border-[#1F6FEB] text-[#1F6FEB]' 
                          : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'}
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-mono"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 text-white rounded-lg font-mono font-bold shadow-md shadow-[#1F6FEB]/25"
                >
                  Initialize Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
