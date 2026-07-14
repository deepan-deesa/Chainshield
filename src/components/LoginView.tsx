import React from 'react';
import { ShieldAlert, KeyRound, Fingerprint, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [badgeId, setBadgeId] = React.useState('SH-9941');
  const [pin, setPin] = React.useState('••••••••');
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [fidoTriggered, setFidoTriggered] = React.useState(false);
  const [fidoPassed, setFidoPassed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    // Simulate double-factor FIDO2 security biometrics sequence!
    setTimeout(() => {
      setFidoTriggered(true);
      setTimeout(() => {
        setFidoPassed(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-[#F0F6FC] font-sans relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-radial-gradient from-[#1F6FEB]/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1F6FEB]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main secure vault login shell */}
      <div className="w-full max-w-md bg-[#161B22]/85 backdrop-blur-xl p-8 rounded-2xl border border-gray-800/80 space-y-6 relative glowing-blue">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="p-3 bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 rounded-xl inline-flex glowing-blue">
            <ShieldAlert className="w-8 h-8 text-[#1F6FEB] animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white">CHAINSHIELD ACCESS TERMINAL</h1>
            <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">FEDERAL CYBER EVIDENCE MANAGEMENT</p>
          </div>
        </div>

        {fidoTriggered ? (
          // Multi-Factor FIDO2 security scan simulation
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {fidoPassed ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#2EA043]/10 border border-[#2EA043]/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto glowing-emerald animate-bounce">
                  <ShieldCheck className="w-8 h-8 text-[#2EA043]" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#2EA043] uppercase tracking-wider">Access Granted</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">Cryptographic key matched. Initializing terminal session...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto glowing-blue animate-pulse">
                  <Fingerprint className="w-8 h-8 text-[#1F6FEB]" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Awaiting FIDO2 Hardware Touch</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">Touch physical biometrics security key to finalize ECDSA handshake...</p>
                </div>
                <div className="flex justify-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#1F6FEB] rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-[#1F6FEB] rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-[#1F6FEB] rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Base Credentials Form
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Badge Reference Number</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input 
                  type="text" 
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                  placeholder="e.g. SH-9941"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Investigator Key PIN</label>
                <span className="text-[9px] text-gray-500 font-mono">FIDO2 Biometric Fallback</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input 
                  type="password" 
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`
                w-full py-3 rounded-lg font-mono font-bold tracking-wider uppercase transition-all duration-300 border flex items-center justify-center gap-2 mt-2
                ${isAuthenticating
                  ? 'bg-gray-800/40 border-gray-800/80 text-gray-600 cursor-not-allowed'
                  : 'bg-[#1F6FEB] hover:bg-[#1F6FEB]/95 border-[#1F6FEB] text-white shadow-md shadow-[#1F6FEB]/25'
                }
              `}
            >
              {isAuthenticating ? 'Connecting security tunnel...' : 'Verify Identity & Login'}
            </button>
          </form>
        )}

        {/* Demo fast pass hint info box */}
        <div className="p-3 bg-gray-800/20 border border-gray-800 rounded-lg text-[10px] text-gray-500 font-mono leading-relaxed text-center">
          <span>Demonstration Mode Active. Click </span>
          <span className="text-[#1F6FEB] font-bold">Verify Identity</span>
          <span> to launch secure sandbox with investigator credentials.</span>
        </div>

      </div>
    </div>
  );
}
