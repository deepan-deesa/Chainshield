import React from 'react';
import { 
  Database, 
  Search, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Server, 
  Calendar,
  Lock,
  ChevronRight,
  TrendingUp,
  Hash
} from 'lucide-react';
import { Block } from '../types';
import { formatDate, shortenHash } from '../utils';

interface ExplorerViewProps {
  blocks: Block[];
  onMineBlock?: () => void;
}

export default function ExplorerView({ blocks, onMineBlock }: ExplorerViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedBlockNumber, setSelectedBlockNumber] = React.useState<number | null>(
    blocks.length > 0 ? blocks[blocks.length - 1].blockNumber : null
  );

  // Search blocks
  const filteredBlocks = blocks.filter((b) => {
    const term = searchTerm.toLowerCase();
    return b.blockNumber.toString().includes(term) ||
           b.caseTitle.toLowerCase().includes(term) ||
           b.evidenceName.toLowerCase().includes(term) ||
           b.currentHash.toLowerCase().includes(term);
  });

  // Get currently selected block detail
  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber);

  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">STATE CRIME BLOCKCHAIN LAYER</span>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Immutable Ledger Explorer</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg text-xs font-mono font-semibold text-[#2EA043]">
            Avg Validation: ~1.4s
          </div>
          {onMineBlock && (
            <button 
              onClick={onMineBlock}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-800 rounded-lg text-xs font-mono font-semibold text-[#1F6FEB] flex items-center gap-1.5 transition-all duration-200"
            >
              <Cpu className="w-4 h-4 animate-spin text-[#2EA043]" /> Simulate Consensus Tick
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Total Anchored Blocks</span>
          <span className="text-xl font-display font-bold text-white mt-0.5">{blocks.length} Blocks</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Consensus Algorithm</span>
          <span className="text-xl font-display font-bold text-white mt-0.5">PoA (Authority)</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Validator Authority Nodes</span>
          <span className="text-xl font-display font-bold text-[#2EA043] mt-0.5">8 Synced</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Ledger State</span>
          <span className="text-xl font-display font-bold text-[#1F6FEB] mt-0.5">100% Intact</span>
        </div>
      </div>

      {/* Interactive Main Body Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Scrollable Blockchain block timeline stream */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search ledger */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Query blocks by height, evidence filename, case name, or hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1117] border border-gray-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#1F6FEB] transition-colors"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredBlocks.length === 0 ? (
              <p className="p-8 text-center text-gray-500 italic">No matching blockchain blocks found in ledger.</p>
            ) : (
              filteredBlocks.map((b, index) => {
                const isSelected = selectedBlockNumber === b.blockNumber;
                return (
                  <div key={b.blockNumber} className="relative">
                    {/* Visual linking arrow between sequential blocks */}
                    {index < filteredBlocks.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-[-16px] w-[1px] border-l border-dashed border-gray-800" />
                    )}

                    <div 
                      onClick={() => setSelectedBlockNumber(b.blockNumber)}
                      className={`
                        p-4 bg-[#0D1117]/50 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 group
                        ${isSelected 
                          ? 'border-[#1F6FEB] bg-[#1F6FEB]/5 glowing-blue' 
                          : 'border-gray-800/80 hover:border-gray-700 hover:bg-[#161B22]/30'}
                      `}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Graphical Block index sphere */}
                        <div className={`
                          w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono shrink-0 border
                          ${isSelected 
                            ? 'bg-[#1F6FEB]/10 border-[#1F6FEB] text-[#1F6FEB]' 
                            : 'bg-gray-800/60 border-gray-800 text-gray-400 group-hover:border-gray-700 group-hover:text-white'}
                        `}>
                          <span className="text-[9px] uppercase tracking-tighter">BLOCK</span>
                          <span className="text-xs font-bold leading-none">{b.blockNumber}</span>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#F0F6FC] truncate max-w-[200px] block group-hover:text-[#1F6FEB] transition-colors">
                              {b.evidenceName}
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 truncate">
                              {shortenHash(b.currentHash, 6, 6)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[280px]">
                            Case: <span className="text-gray-300 font-semibold">{b.caseTitle}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right shrink-0 font-mono text-[9px] text-gray-500">
                        <div>
                          <span className="block text-gray-400 font-bold uppercase">{formatDate(b.timestamp).substring(11, 19)}</span>
                          <span>Consensus Locked</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected block forensic parameters deck */}
        <div className="space-y-6">
          {selectedBlock ? (
            <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                <Database className="w-4 h-4 text-[#1F6FEB]" />
                <h3 className="font-display font-semibold text-sm tracking-wide text-white">Consensus Block Specs</h3>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Block header summary */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-display font-bold text-white">#{selectedBlock.blockNumber}</span>
                    <span className="text-[10px] font-mono text-[#2EA043] block mt-0.5 uppercase tracking-widest font-semibold">Immutable Status</span>
                  </div>
                  <div className="p-2 bg-[#2EA043]/10 border border-[#2EA043]/20 rounded-lg text-[#2EA043] glowing-emerald">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1 bg-[#161B22]/50 p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wider block">Cryptographic Hash</span>
                    <span className="font-mono text-white text-[11px] break-all">{selectedBlock.currentHash}</span>
                  </div>

                  <div className="space-y-1 bg-[#161B22]/50 p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wider block">Previous Block Hash</span>
                    <span className="font-mono text-gray-400 text-[11px] break-all">{selectedBlock.previousHash}</span>
                  </div>

                  <div className="space-y-1 bg-[#161B22]/50 p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wider block">Raw File Original Hash</span>
                    <span className="font-mono text-white text-[11px] break-all">{selectedBlock.fileHash}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Registered Under Case</span>
                    <span className="font-semibold text-white max-w-[150px] truncate text-right">{selectedBlock.caseTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Validator Officer</span>
                    <span className="font-semibold text-white">{selectedBlock.officer}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Badge Reference</span>
                    <span className="font-mono text-white">{selectedBlock.badgeNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Sealed Nonce</span>
                    <span className="font-mono text-white">{selectedBlock.nonce}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Sealed Date</span>
                    <span className="font-mono text-white">{formatDate(selectedBlock.timestamp)}</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-xl border border-gray-800 text-center py-12 text-gray-500">
              <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs">Select a block on the left to reveal its complete mathematical chain specification.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
