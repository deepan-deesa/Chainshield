import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Key, 
  Cpu, 
  Building, 
  Award, 
  Copy, 
  Check, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  Edit3,
  Camera
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenSettings
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [copiedKey, setCopiedKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync props to state if user prop changes
  React.useEffect(() => {
    setName(user.name);
    setDepartment(user.department);
    setAvatarUrl(user.avatarUrl || '');
  }, [user]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
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

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(user.publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      department,
      avatarUrl: avatarUrl.trim() || user.avatarUrl
    });
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0D1117] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header Bar */}
        <div className="relative p-6 bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1F6FEB]/15 border border-[#1F6FEB]/40 rounded-xl glowing-blue">
              <User className="w-6 h-6 text-[#1F6FEB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">SECURITY CLEARANCE DOSSIER</span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-[#2EA043]/15 text-[#2EA043] border border-[#2EA043]/30 rounded-full font-bold uppercase">
                  Verified Active
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white tracking-wide">Investigator Profile & Keyring</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/80 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {saveSuccess && (
            <div className="p-3 bg-[#2EA043]/15 border border-[#2EA043]/40 rounded-xl text-xs text-[#2EA043] font-mono flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Profile credentials updated and cryptographically signed.
            </div>
          )}

          {/* User Identity Card Hero Section */}
          <div className="p-5 bg-gradient-to-b from-[#161B22]/90 to-[#161B22]/40 border border-gray-800/80 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload/change profile photo"
            >
              <img 
                src={avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt={name}
                className="w-20 h-20 rounded-full border-2 border-[#1F6FEB]/60 object-cover shadow-lg group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-mono text-white font-bold mt-0.5">Change</span>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#1F6FEB] rounded-full border-2 border-[#0D1117]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{user.name}</h3>
                  <p className="text-xs font-mono text-[#1F6FEB] font-medium">{user.badgeNumber}</p>
                </div>

                <div className="flex items-center gap-2 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-white bg-[#1F6FEB] hover:bg-[#1F6FEB]/80 rounded-lg transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-gray-300 hover:text-white bg-[#0D1117] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#1F6FEB]" />
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-gray-800/80 border border-gray-700/60 rounded-md text-gray-300">
                  <Building className="w-3 h-3 text-cyan-400" /> {user.department}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-400 font-semibold">
                  <Award className="w-3 h-3 text-amber-400" /> {user.securityClearance}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="p-5 bg-[#161B22]/60 border border-[#1F6FEB]/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="text-xs font-mono font-bold text-[#1F6FEB] uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Profile Credentials
                </h4>
                <span className="text-[10px] font-mono text-gray-400">Badge ID is read-only</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#1F6FEB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Badge Number (Immutable)</label>
                  <input
                    type="text"
                    value={user.badgeNumber}
                    disabled
                    className="w-full bg-[#0D1117]/60 border border-gray-800 rounded-lg p-2.5 text-gray-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-400 font-mono text-[10px] uppercase">Department / Agency Division</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#1F6FEB]"
                  />
                </div>

                {/* Profile photo options section */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-gray-400 font-mono text-[10px] uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-[#1F6FEB]" /> Profile Photo / Avatar</span>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#1F6FEB] hover:underline cursor-pointer text-[10px]"
                    >
                      Upload photo from device
                    </button>
                  </label>

                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-[#161B22] hover:bg-gray-800 border border-gray-800 rounded-lg text-xs font-mono text-gray-200 flex items-center gap-2 shrink-0"
                    >
                      <Camera className="w-4 h-4 text-[#1F6FEB]" />
                      Upload File...
                    </button>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Or paste photo URL (https://...)"
                      className="flex-1 bg-[#0D1117] border border-gray-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#1F6FEB] font-mono text-[11px]"
                    />
                  </div>

                  {/* Preset Avatar Pickers */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-gray-400 block mb-1.5">Preset Avatars:</span>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                            avatarUrl === url ? 'border-[#1F6FEB] scale-110' : 'border-gray-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-mono text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono font-bold text-white bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 rounded-lg transition-all shadow-md glowing-blue"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          ) : null}

          {/* Cryptographic Keyring & Hardware Security Card */}
          <div className="p-5 bg-[#161B22]/50 border border-gray-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Cryptographic Keyring & Hardware Authorization</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  Public Signing Key (ECDSA P-256 Consensus Key)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={user.publicKey}
                    className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-2.5 text-xs font-mono text-emerald-400 truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="px-3 py-2.5 bg-[#0D1117] hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#2EA043]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#0D1117] border border-gray-800 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#1F6FEB]" /> Hardware Token Key ID
                  </span>
                  <p className="text-xs font-mono font-semibold text-white truncate">{user.hardwareKeyId}</p>
                  <span className="text-[9px] font-mono text-[#2EA043]">FIDO2 / WebAuthn Active</span>
                </div>

                <div className="p-3 bg-[#0D1117] border border-gray-800 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Consensus Role
                  </span>
                  <p className="text-xs font-mono font-semibold text-white uppercase">{user.role.replace('_', ' ')}</p>
                  <span className="text-[9px] font-mono text-purple-400">Block Signer Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#161B22] border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-mono transition-colors"
          >
            <Settings className="w-4 h-4 text-[#1F6FEB]" />
            <span>Open System & Node Settings</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-gray-400 hover:text-white bg-transparent hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 hover:text-red-100 rounded-xl text-xs font-mono transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sever Connection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
