import React from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Key, 
  Server, 
  Network, 
  Smartphone, 
  Eye, 
  CheckCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  Camera,
  Trash2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  nodeCount: number;
  setNodeCount: (count: number) => void;
  onClearDemoData?: () => void;
  onResetDemoData?: () => void;
}

export default function SettingsView({
  user,
  onUpdateUser,
  nodeCount,
  setNodeCount,
  onClearDemoData,
  onResetDemoData
}: SettingsViewProps) {
  // Local config states
  const [fidoEnabled, setFidoEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState('15');
  const [blockchainMode, setBlockchainMode] = React.useState('AUTHORITY');
  const [clearSuccess, setClearSuccess] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Feedback states
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUser({
            ...user,
            avatarUrl: reader.result
          });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearDemoClick = () => {
    if (window.confirm('Are you sure you want to clear all demo cases, evidence items, blocks, and logs? This will give you a clean workspace to upload your evidence.')) {
      if (onClearDemoData) onClearDemoData();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  const handleResetDemoClick = () => {
    if (window.confirm('Restore initial sample demo cases and evidence files?')) {
      if (onResetDemoData) onResetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleNodeChange = (increment: boolean) => {
    if (increment && nodeCount < 32) {
      setNodeCount(nodeCount + 1);
    } else if (!increment && nodeCount > 3) {
      setNodeCount(nodeCount - 1);
    }
  };

  const activeValidators = [
    { name: 'NY_POLICE_DEPT_NODE_01', address: '0x10a8...f42c', status: 'ACTIVE', latency: '12ms', blocks: 2404 },
    { name: 'FED_CYBER_CRIME_NODE_A', address: '0x7b4c...ffac', status: 'ACTIVE', latency: '4ms', blocks: 4912 },
    { name: 'CH_JUSTICE_CENTRAL_NODE', address: '0x992d...dd12', status: 'ACTIVE', latency: '18ms', blocks: 1104 },
    { name: 'MIAMI_SHERIFF_FORENSICS_NODE', address: '0x32ab...21fe', status: 'STANDBY', latency: '142ms', blocks: 802 }
  ];

  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Hidden file input for uploading profile photo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* Title bar */}
      <div className="border-b border-gray-800 pb-5">
        <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">SYSTEM CONTROL & PARAMETERS</span>
        <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Security & Node Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile and System parameters forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custodian identity card */}
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#1F6FEB]" />
                <h3 className="font-display font-semibold text-sm tracking-wide text-white">Investigating Custodian Profile</h3>
              </div>
              <span className="text-[10px] font-mono text-[#1F6FEB] bg-[#1F6FEB]/10 border border-[#1F6FEB]/30 px-2 py-0.5 rounded">
                Level 5 Enclave Clearance
              </span>
            </div>

            {/* Profile Avatar Banner */}
            <div className="p-4 bg-[#161B22]/80 border border-gray-800 rounded-xl flex items-center gap-4">
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile picture"
              >
                <img 
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-[#1F6FEB]/60 object-cover shadow-md group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono">Profile Avatar Photo</h4>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#1F6FEB] hover:bg-[#1F6FEB]/80 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Upload a custom profile photo or select a preset avatar.</p>

                {/* Preset Avatars Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-gray-500">Presets:</span>
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onUpdateUser({ ...user, avatarUrl: url })}
                      className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                        user.avatarUrl === url ? 'border-[#1F6FEB] scale-110' : 'border-gray-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Officer Name</label>
                  <input 
                    type="text" 
                    value={user?.name || ''}
                    onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#1F6FEB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Badge Reference ID</label>
                  <input 
                    type="text" 
                    disabled
                    value={user?.badgeNumber || ''}
                    className="w-full bg-[#161B22] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Agency Department</label>
                  <input 
                    type="text" 
                    value={user?.department || ''}
                    onChange={(e) => onUpdateUser({ ...user, department: e.target.value })}
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#1F6FEB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Security Clearance Level</label>
                  <input 
                    type="text" 
                    disabled
                    value={user?.securityClearance || ''}
                    className="w-full bg-[#161B22] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Signing Authority Public Key</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    disabled
                    value={user?.publicKey || ''}
                    className="w-full bg-[#161B22] border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-gray-400 truncate cursor-not-allowed"
                  />
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-1.5 rounded uppercase shrink-0">ECDSA-P256</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-mono">Modifications auto-signed on hardware keyring.</p>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 text-white rounded-lg font-mono font-bold transition-all duration-200"
                >
                  Save Profile Specs
                </button>
              </div>
            </form>

            {saveSuccess && (
              <div className="p-3 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg text-xs text-[#2EA043] font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Profile credentials & photo synchronized.
              </div>
            )}
          </div>

          {/* Demo Files & Enclave Data Management */}
          <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-display font-semibold text-sm tracking-wide text-white">Demo Files & Workspace Data</h3>
                  <p className="text-[11px] text-gray-400">Clear sample demo files so new users can upload and test their own evidence.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                Workspace Controls
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="text-xs space-y-1 text-gray-300">
                <p className="font-semibold text-white">Start Clean or Reset Demo Environment</p>
                <p className="text-[11px] text-gray-400">
                  Clearing demo files empties sample cases, evidence, consensus blocks, and audit logs.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClearDemoClick}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Demo Files
                </button>

                <button
                  type="button"
                  onClick={handleResetDemoClick}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Demo Data
                </button>
              </div>
            </div>

            {clearSuccess && (
              <div className="p-3 bg-[#2EA043]/10 border border-[#2EA043]/30 rounded-lg text-xs text-[#2EA043] font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> All demo files and mock entries successfully cleared! You have a clean vault.
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-[#1F6FEB]/10 border border-[#1F6FEB]/30 rounded-lg text-xs text-[#1F6FEB] font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Initial demo files restored.
              </div>
            )}
          </div>

          {/* Private Ledger Authority settings */}
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#2EA043]" />
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Private Consensus Parameters</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
                <div>
                  <span className="font-bold text-white block">Active Validator Node Count</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Toggle peer servers actively voting on PoA blocks</p>
                </div>
                <div className="flex items-center gap-3 bg-[#0D1117] border border-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => handleNodeChange(false)}
                    className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-white font-mono flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-[#1F6FEB] px-1">{nodeCount} Peers</span>
                  <button 
                    onClick={() => handleNodeChange(true)}
                    className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-white font-mono flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
                <div>
                  <span className="font-bold text-white block">Consensus Voting Mode</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Define mathematical rules for cryptographic validation</p>
                </div>
                <select 
                  value={blockchainMode}
                  onChange={(e) => setBlockchainMode(e.target.value)}
                  className="bg-[#0D1117] border border-gray-800 rounded-lg p-2 text-gray-300 text-xs focus:outline-none"
                >
                  <option value="AUTHORITY">Authority Nodes Only</option>
                  <option value="MULTI_DEPT_STATE">Multi-Department State Consensus</option>
                  <option value="STRICT_GOVERNMENT_PROOF">Strict Federal Proof System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security tokens and Hardware Keys list sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-yellow-500" />
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Cryptographic Access Control</h3>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="flex items-center justify-between p-3 bg-gray-800/25 border border-gray-800 rounded-xl">
                <div>
                  <span className="font-bold text-white block">Biometric FIDO2 Shield</span>
                  <span className="text-[10px] text-gray-500 font-mono uppercase mt-0.5 block">State Token Authenticator</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFidoEnabled(!fidoEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${fidoEnabled ? 'bg-[#2EA043]' : 'bg-gray-700'}
                  `}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${fidoEnabled ? 'translate-x-4' : 'translate-x-0'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/25 border border-gray-800 rounded-xl">
                <div>
                  <span className="font-bold text-white block">FIDO2 Hardware Biometrics</span>
                  <span className="text-[10px] text-gray-500 font-mono uppercase mt-0.5 block">YubiKey biometric security</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${biometricsEnabled ? 'bg-[#2EA043]' : 'bg-gray-700'}
                  `}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${biometricsEnabled ? 'translate-x-4' : 'translate-x-0'}
                  `} />
                </button>
              </div>

              <div className="space-y-1 bg-[#161B22]/50 p-3 rounded-xl border border-gray-800/60 text-[11px] text-gray-400 leading-relaxed">
                <span className="text-white font-bold block mb-1">Key ID Confirmed</span>
                <span className="font-mono text-gray-300 break-all">{user.hardwareKeyId}</span>
              </div>
            </div>
          </div>

          {/* Active Validators List widget */}
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Active Validator Nodes</span>
              <Activity className="w-3.5 h-3.5 text-[#2EA043]" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeValidators.map((val) => (
                <div key={val.name} className="p-2.5 bg-[#0D1117] border border-gray-800 rounded-lg text-[11px] space-y-1 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block truncate max-w-[140px]">{val.name}</span>
                    <span className="text-[9px] font-mono text-gray-500">{val.address}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#2EA043] font-bold text-[9px] uppercase tracking-wider block">{val.status}</span>
                    <span className="text-gray-500 font-mono text-[9px]">{val.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
