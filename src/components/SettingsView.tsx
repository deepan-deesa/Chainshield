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
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  nodeCount: number;
  setNodeCount: (count: number) => void;
}

export default function SettingsView({
  user,
  onUpdateUser,
  nodeCount,
  setNodeCount
}: SettingsViewProps) {
  // Local config states
  const [fidoEnabled, setFidoEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState('15');
  const [blockchainMode, setBlockchainMode] = React.useState('AUTHORITY');
  
  // Feedback states
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#1F6FEB]" />
              <h3 className="font-display font-semibold text-sm tracking-wide text-white">Investigating Custodian Profile</h3>
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
                    className="w-full bg-[#161B22] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 cursor-not-allowed"
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
                    className="w-full bg-[#161B22] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 cursor-not-allowed"
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
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-1.5 rounded uppercase">ECDSA-P256</span>
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
                <CheckCircle className="w-4 h-4" /> Profile credentials synchronized.
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
