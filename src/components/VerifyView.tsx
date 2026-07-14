import React from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  Copy, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  Database,
  Lock,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { EvidenceItem } from '../types';
import { calculateSHA256, formatFileSize, shortenHash, formatDate } from '../utils';

interface VerifyViewProps {
  evidence: EvidenceItem[];
}

export default function VerifyView({ evidence }: VerifyViewProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isHashing, setIsHashing] = React.useState(false);
  const [hashProgress, setHashProgress] = React.useState(0);
  const [calculatedHash, setCalculatedHash] = React.useState('');
  
  // Results states
  const [matchFound, setMatchFound] = React.useState<EvidenceItem | null>(null);
  const [verificationTriggered, setVerificationTriggered] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  // Drag drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setHashProgress(0);
    setCalculatedHash('');
    setMatchFound(null);
    setVerificationTriggered(false);

    try {
      // Calculate real browser-side SHA-256 hash of the dropped check-file!
      const hash = await calculateSHA256(selectedFile, (progress) => {
        setHashProgress(progress);
      });

      setCalculatedHash(hash);
      setIsHashing(false);
      setVerificationTriggered(true);

      // Search registered state to find if a match exists!
      const matchingItem = evidence.find(
        (item) => item.sha256.toLowerCase() === hash.toLowerCase()
      );

      if (matchingItem) {
        setMatchFound(matchingItem);
      } else {
        setMatchFound(null);
      }
    } catch (err) {
      console.error(err);
      setIsHashing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Title Header */}
      <div className="border-b border-gray-800 pb-5">
        <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">COURTROOM INTEGRITY VERIFICATION</span>
        <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Courtroom Verification Deck</h2>
      </div>

      {/* Description explanation card */}
      <div className="p-4 bg-[#161B22] border border-gray-800 rounded-xl flex items-start gap-3 text-xs text-gray-400">
        <HelpCircle className="w-5 h-5 text-[#1F6FEB] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-display font-bold text-white uppercase tracking-wider">How to Verify evidence in court</h4>
          <p className="mt-1 leading-relaxed">
            Drag and drop the exact digital file presented in court into the comparison container below. ChainShield will calculate the file's current SHA-256 signature locally on your machine and compare it with the secure blockchain audit ledger. If even a single byte of video, metadata, or timestamps was tampered with, the signature will mismatch!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Drop zone container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-800 space-y-5">
            <h3 className="font-display font-semibold text-sm tracking-wide text-white">Select Discovery File to Validate</h3>

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
                  <div className="w-12 h-12 rounded-full border-4 border-t-[#1F6FEB] border-gray-800 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-[#1F6FEB] uppercase tracking-wider font-semibold">Calculating current SHA-256 fingerprint...</p>
                  <div className="w-full bg-gray-800 rounded-full h-1 h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#1F6FEB] h-1.5 rounded-full transition-all duration-150" 
                      style={{ width: `${hashProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{hashProgress}% Loaded</span>
                </div>
              ) : file ? (
                <div className="space-y-3 z-10">
                  <FileText className="w-12 h-12 text-[#1F6FEB] mx-auto animate-pulse" />
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
                    <p className="text-xs font-semibold text-white">Drag & drop active file here, or <span className="text-[#1F6FEB] underline">select target file</span></p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Calculations executed securely offline in browser context</p>
                  </div>
                  <input 
                    type="file" 
                    id="verify-file-input"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Generated Hash Box */}
            {calculatedHash && (
              <div className="p-4 bg-[#161B22] border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Calculated Fingerprint</span>
                  <button 
                    type="button"
                    onClick={() => handleCopy(calculatedHash)}
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#2EA043]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-white bg-[#0D1117] p-3 rounded border border-gray-800 break-all select-all">
                  {calculatedHash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Verification Result side panel */}
        <div className="space-y-6">
          {verificationTriggered ? (
            matchFound ? (
              // Integrity verified: Match secured (Green state card)
              <div className="glass-panel p-6 rounded-xl border border-[#2EA043]/30 glowing-emerald space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-3 pb-4 border-b border-gray-800/80">
                  <div className="p-3 bg-[#2EA043]/10 border border-[#2EA043]/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto glowing-emerald animate-pulse">
                    <ShieldCheck className="w-7 h-7 text-[#2EA043]" />
                  </div>
                  <div>
                    <h3 className="text-md font-display font-bold text-[#2EA043] uppercase tracking-wider">Match Secured</h3>
                    <p className="text-xs text-[#2EA043] font-mono font-medium">100.00% Integrity Proven</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-300">
                  <p className="leading-relaxed text-[11px] text-gray-400">
                    The file matches exactly the forensic item registered on day one of the investigation. No admin overrides or tampering detected.
                  </p>
                  
                  <div className="pt-2 space-y-2.5">
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-500 font-mono text-[9px] uppercase">Registered ID</span>
                      <span className="font-mono text-white font-semibold">{matchFound.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-500 font-mono text-[9px] uppercase">Associated Case</span>
                      <span className="font-semibold text-white text-right max-w-[140px] truncate">{matchFound.caseId}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-500 font-mono text-[9px] uppercase">Officer Signed</span>
                      <span className="font-semibold text-white">{matchFound.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-500 font-mono text-[9px] uppercase">Ingested Date</span>
                      <span className="font-mono text-white">{formatDate(matchFound.uploadedAt).substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-mono text-[9px] uppercase">Blockchain Block</span>
                      <span className="font-mono text-[#1F6FEB] font-bold">Block #{matchFound.blockNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Integrity compromised: Mismatch (Red/Amber state card)
              <div className="glass-panel p-6 rounded-xl border border-red-900/40 glowing-amber space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-3 pb-4 border-b border-gray-800/80">
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-full w-14 h-14 flex items-center justify-center mx-auto glowing-amber">
                    <AlertTriangle className="w-7 h-7 text-red-500 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-md font-display font-bold text-red-400 uppercase tracking-wider">Integrity Compromised</h3>
                    <p className="text-xs text-red-500 font-mono font-medium">UNRECOGNIZED SIGNATURE</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-gray-300">
                  <p className="leading-relaxed text-[11px] text-gray-400">
                    The calculated SHA-256 fingerprint does NOT match any digital assets registered on the ChainShield ledger. The file is either corrupted, edited, or mock metadata was injected.
                  </p>

                  <div className="p-3 bg-[#0D1117] border border-gray-800 rounded-lg space-y-1.5 text-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block">AUDIT DECISION</span>
                    <span className="text-[11px] font-mono text-red-400 font-bold uppercase">Evidence Inadmissible in Court</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Empty state side card
            <div className="glass-panel p-5 rounded-xl border border-gray-800 text-center py-12 space-y-3">
              <Lock className="w-8 h-8 text-gray-600 mx-auto" />
              <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Status: Awaiting file</h3>
              <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                No active verification checks executed. Use the drag zone to calculate local cryptographic properties.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
