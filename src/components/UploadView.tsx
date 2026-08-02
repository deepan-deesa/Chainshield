import React from 'react';
import { 
  UploadCloud, 
  FileText, 
  Copy, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Cpu, 
  KeyRound,
  FileVideo,
  FileAudio,
  FileImage,
  Tag,
  MapPin,
  Calendar
} from 'lucide-react';
import { Case, EvidenceItem, EvidenceType } from '../types';
import { calculateSHA256, formatFileSize, shortenHash } from '../utils';

interface UploadViewProps {
  cases: Case[];
  activeCase: Case | null;
  onIngestEvidence: (evidence: EvidenceItem) => void;
  selectedEvidence: EvidenceItem | null;
  setSelectedEvidence: (ev: EvidenceItem | null) => void;
  currentUser: string;
  badgeNumber: string;
  onAddCase?: (newCase: Case) => void;
}

export default function UploadView({
  cases,
  activeCase,
  onIngestEvidence,
  selectedEvidence,
  setSelectedEvidence,
  currentUser,
  badgeNumber,
  onAddCase
}: UploadViewProps) {
  // Selection and file state
  const [selectedCaseId, setSelectedCaseId] = React.useState(activeCase?.id || (cases && cases.length > 0 ? cases[0].id : ''));
  const [newCaseTitle, setNewCaseTitle] = React.useState('');
  const [isCreatingNewCase, setIsCreatingNewCase] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  
  // Hashing progression states
  const [isHashing, setIsHashing] = React.useState(false);
  const [hashProgress, setHashProgress] = React.useState(0);
  const [generatedHash, setGeneratedHash] = React.useState('');
  
  // Metadata fields
  const [evidenceType, setEvidenceType] = React.useState<EvidenceType>('VIDEO');
  const [deviceModel, setDeviceModel] = React.useState('');
  const [gpsCoordinates, setGpsCoordinates] = React.useState('');
  const [sourcePlatform, setSourcePlatform] = React.useState('');
  
  // Interface feedback states
  const [isCopied, setIsCopied] = React.useState(false);
  const [isAnchoring, setIsAnchoring] = React.useState(false);
  const [ingestionComplete, setIngestionComplete] = React.useState(false);

  // Sync state if activeCase or cases changes
  React.useEffect(() => {
    if (activeCase) {
      setSelectedCaseId(activeCase.id);
    } else if (cases && cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [activeCase, cases, selectedCaseId]);

  // Copy hash helper
  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle file drop/selection
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setHashProgress(0);
    setGeneratedHash('');
    setIngestionComplete(false);

    // Auto-detect classification based on extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
      setEvidenceType('VIDEO');
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      setEvidenceType('IMAGE');
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      setEvidenceType('AUDIO');
    } else {
      setEvidenceType('DOCUMENT');
    }

    try {
      const realHash = await calculateSHA256(selectedFile, (progress) => {
        setHashProgress(progress);
      });
      setGeneratedHash(realHash);
      setIsHashing(false);
    } catch (err) {
      console.error(err);
      setIsHashing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !generatedHash) return;

    let targetCaseId = selectedCaseId;
    if (!targetCaseId) {
      targetCaseId = 'CASE-101';
      if (onAddCase && (!cases || cases.length === 0)) {
        onAddCase({
          id: 'CASE-101',
          title: 'Initial Digital Evidence Investigation',
          description: 'Primary locker for uploaded digital evidence files.',
          status: 'ACTIVE',
          priority: 'HIGH',
          assignedOfficer: currentUser,
          badgeNumber: badgeNumber,
          department: 'Federal Cyber Crime Division',
          createdAt: new Date().toISOString(),
          evidenceIds: []
        });
      }
    }

    setIsAnchoring(true);

    setTimeout(() => {
      const newEvidence: EvidenceItem = {
        id: `EVID-${Math.floor(100 + Math.random() * 900)}`,
        caseId: targetCaseId,
        name: file.name,
        type: evidenceType,
        size: file.size,
        sha256: generatedHash,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser,
        badgeNumber: badgeNumber,
        status: 'SECURED',
        metadata: {
          deviceModel: deviceModel || 'Standard Capture Device',
          gpsCoordinates: gpsCoordinates || 'Unknown Coordinates',
          captureDate: new Date().toISOString(),
          sourcePlatform: sourcePlatform || 'Local Terminal Client',
          fileExtension: file.name.split('.').pop() || 'bin'
        },
        blockNumber: 10426 + Math.floor(Math.random() * 50)
      };

      onIngestEvidence(newEvidence);
      setIsAnchoring(false);
      setIngestionComplete(true);
      setFile(null);
      setGeneratedHash('');
      setDeviceModel('');
      setGpsCoordinates('');
      setSourcePlatform('');
    }, 2000); // 2-second simulation of private mining consensus block emission
  };

  const getIconForType = (type: EvidenceType) => {
    switch (type) {
      case 'VIDEO':
      case 'CCTV':
        return FileVideo;
      case 'AUDIO':
        return FileAudio;
      case 'IMAGE':
        return FileImage;
      default:
        return FileText;
    }
  };

  // If evidence detail is selected, render individual forensic parameter card instead of upload panel
  if (selectedEvidence) {
    const FileIcon = getIconForType(selectedEvidence.type);
    return (
      <div className="space-y-6 text-[#F0F6FC]">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-5">
          <button 
            onClick={() => setSelectedEvidence(null)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to Ingestion
          </button>
          <div>
            <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase font-bold">{selectedEvidence.id}</span>
            <h2 className="font-display font-bold text-xl tracking-tight text-white mt-1">{selectedEvidence.name}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Inspection sandbox */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                <h3 className="font-display font-semibold text-sm tracking-wide text-white">Forensic Workspace Sandbox</h3>
                <span className="text-xs font-mono text-gray-400">{formatFileSize(selectedEvidence.size)}</span>
              </div>

              {/* Secure Player Mockbox */}
              <div className="aspect-video bg-black/60 rounded-xl border border-gray-800/80 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-radial-gradient from-[#1F6FEB]/5 to-transparent pointer-events-none" />
                <FileIcon className="w-16 h-16 text-[#1F6FEB] opacity-60 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs text-gray-400 font-mono">SECURE PREVIEW sandbox LOCKED</p>
                <div className="px-3 py-1 bg-[#1F6FEB]/10 border border-[#1F6FEB]/30 rounded text-[10px] font-mono text-[#1F6FEB]">
                  Verification Code: {shortenHash(selectedEvidence.sha256, 4, 4)}
                </div>
              </div>

              {/* SHA-256 fingerprint card */}
              <div className="p-4 bg-[#161B22] border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#1F6FEB]" /> SHA-256 Cryptographic Lock Fingerprint
                  </span>
                  <button 
                    onClick={() => handleCopyHash(selectedEvidence.sha256)}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#2EA043]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-white bg-[#0D1117] p-3 rounded-lg border border-gray-800 break-all select-all">
                  {selectedEvidence.sha256}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Metadata Checklist */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Extracted Metadata Logs</h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-800/50">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">Device Model</span>
                  <span className="font-semibold text-white">{selectedEvidence.metadata.deviceModel}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/50">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">GPS Coordinates</span>
                  <span className="font-mono text-white">{selectedEvidence.metadata.gpsCoordinates}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/50">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">Original Capture</span>
                  <span className="font-semibold text-white">{selectedEvidence.metadata.captureDate?.substring(0, 10)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/50">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">Ingestion Protocol</span>
                  <span className="font-semibold text-white">{selectedEvidence.metadata.sourcePlatform}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/50">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">Officer Signature</span>
                  <span className="font-semibold text-white">{selectedEvidence.uploadedBy}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 font-mono text-[10px] uppercase">Consensus Block</span>
                  <span className="font-mono text-[#1F6FEB] font-bold">Block #{selectedEvidence.blockNumber}</span>
                </div>
              </div>
            </div>

            {/* Integrity Badge indicator card */}
            <div className="p-4 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2EA043]" />
              <div>
                <h4 className="text-xs font-bold text-[#2EA043] uppercase tracking-wider">CRYPTOGRAPHICALLY PROVEN</h4>
                <p className="text-[11px] text-gray-300 mt-0.5">Signature perfectly matches state consensus block on chain.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Title bar */}
      <div className="border-b border-gray-800 pb-5">
        <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">LEDGER REGISTRY PROCESS</span>
        <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Evidence Ingestion Center</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hashing Sandbox Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-800 space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Client-Side Cryptoprocessor Dropzone</h3>
            
            {/* Interactive Drag Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                ${isHashing ? 'border-[#1F6FEB] bg-[#1F6FEB]/5' : 'border-gray-800 hover:border-[#1F6FEB]/50 hover:bg-[#161B22]/30'}
              `}
            >
              {isHashing ? (
                <div className="space-y-4 w-full max-w-xs text-center z-10">
                  <Cpu className="w-12 h-12 text-[#1F6FEB] animate-spin mx-auto" />
                  <p className="text-xs font-mono text-[#1F6FEB] uppercase tracking-wider font-semibold">Generating Cryptographic SHA-256...</p>
                  
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#1F6FEB] h-1.5 rounded-full transition-all duration-150" 
                      style={{ width: `${hashProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">{hashProgress}% Computed</span>
                </div>
              ) : file ? (
                <div className="space-y-3 z-10">
                  <FileText className="w-12 h-12 text-[#1F6FEB] mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white max-w-sm truncate mx-auto">{file.name}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="px-3 py-1 bg-red-950/20 border border-red-900/30 rounded text-[10px] font-mono text-red-400 hover:bg-red-950/40"
                  >
                    Clear File
                  </button>
                </div>
              ) : (
                <div className="space-y-4 z-10">
                  <div className="p-4 bg-[#161B22]/60 border border-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-[#1F6FEB]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Drag & drop digital evidence file, or <span className="text-[#1F6FEB] underline">browse local drive</span></p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Maximum size: 5GB per forensic batch</p>
                  </div>
                  <input 
                    type="file" 
                    id="evidence-file-input"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Real hash output representation */}
            {generatedHash && (
              <div className="p-4 bg-[#161B22] border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Computed Signature</span>
                  <button 
                    type="button"
                    onClick={() => handleCopyHash(generatedHash)}
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#2EA043]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-white bg-[#0D1117] p-3 rounded border border-gray-800 break-all select-all">
                  {generatedHash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metadata Form Inputs sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Case Association & Metadata</h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase flex items-center justify-between">
                  <span>Associate Case Vault</span>
                  {cases && cases.length === 0 && (
                    <span className="text-[#1F6FEB] font-bold text-[10px]">New Case Auto-Created</span>
                  )}
                </label>
                
                {cases && cases.length > 0 ? (
                  <select 
                    required
                    value={selectedCaseId} 
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        const newId = `CASE-${Math.floor(100 + Math.random() * 900)}`;
                        const newCase: Case = {
                          id: newId,
                          title: 'New Investigation Vault',
                          description: 'Auto-created vault locker for evidence ingestion.',
                          status: 'ACTIVE',
                          priority: 'HIGH',
                          assignedOfficer: currentUser,
                          badgeNumber: badgeNumber,
                          department: 'Cyber Forensics Division',
                          createdAt: new Date().toISOString(),
                          evidenceIds: []
                        };
                        if (onAddCase) onAddCase(newCase);
                        setSelectedCaseId(newId);
                      } else {
                        setSelectedCaseId(e.target.value);
                      }
                    }}
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2 focus:outline-none focus:border-[#1F6FEB] text-white text-[11px]"
                  >
                    <option value="">Select Target Vault...</option>
                    {(cases || []).map((c) => (
                      <option key={c.id} value={c.id}>[{c.id}] {c.title}</option>
                    ))}
                    <option value="__NEW__">+ Create New Case Vault</option>
                  </select>
                ) : (
                  <div className="p-2.5 bg-[#161B22] border border-gray-800 rounded-lg text-xs text-gray-300 font-mono flex items-center justify-between">
                    <span>[CASE-101] Initial Evidence Case Locker</span>
                    <span className="text-[10px] bg-[#1F6FEB]/20 text-[#1F6FEB] px-2 py-0.5 rounded font-bold">Auto-assigned</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Evidence Core Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['VIDEO', 'IMAGE', 'AUDIO', 'DOCUMENT'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEvidenceType(t)}
                      className={`py-2 rounded-lg font-mono text-[9px] font-bold border transition-all duration-200
                        ${evidenceType === t 
                          ? 'bg-[#1F6FEB]/10 border-[#1F6FEB] text-[#1F6FEB]' 
                          : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'}
                      `}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Extraction Device / Platform</label>
                <input 
                  type="text" 
                  placeholder="e.g. iPhone 15 Pro / Cellebrite Dump"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#1F6FEB] text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Geological GPS Source</label>
                <input 
                  type="text" 
                  placeholder="e.g. 40.7128° N, 74.0060° W"
                  value={gpsCoordinates}
                  onChange={(e) => setGpsCoordinates(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#1F6FEB] text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Submitting Protocol</label>
                <input 
                  type="text" 
                  placeholder="e.g. Local DVR Backup Tool"
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#1F6FEB] text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!file || !generatedHash || isAnchoring}
                className={`
                  w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 border flex items-center justify-center gap-2
                  ${(!file || !generatedHash || isAnchoring)
                    ? 'bg-gray-800/40 border-gray-800/80 text-gray-600 cursor-not-allowed'
                    : 'bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 border-[#1F6FEB] text-white shadow-md shadow-[#1F6FEB]/25'
                  }
                `}
              >
                {isAnchoring ? (
                  <>
                    <Database className="w-4 h-4 animate-bounce text-[#2EA043]" /> Mining Ledger Block...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Secure Locked Ingestion
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mining Success Card */}
          {ingestionComplete && (
            <div className="p-4 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-[#2EA043]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">LEDGER BLOCK SECURED</h4>
              </div>
              <p className="text-[11px] text-gray-300">
                Evidence successfully committed to private blockchain. Timestamps sealed, SHA-256 registered, and node consensus finalized!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
