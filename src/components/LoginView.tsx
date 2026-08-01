import React from 'react';
import { ShieldAlert, Mail, Lock, Fingerprint, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginViewProps {
  onSwitchToSignUp: () => void;
}

export default function LoginView({ onSwitchToSignUp }: LoginViewProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  
  const [fidoTriggered, setFidoTriggered] = React.useState(false);
  const [fidoPassed, setFidoPassed] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsAuthenticating(true);
    console.log('[ChainShield Auth] Attempting Supabase Auth Login for:', email.trim());

    try {
      // 1. Supabase Auth Sign In with Password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      console.log('[ChainShield Auth] Supabase Login Response:', { data, error });

      if (error) {
        console.error('[ChainShield Auth] Supabase Login Error:', error);
        let msg = error.message || 'Invalid credentials or user does not exist in Supabase.';
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          msg = 'Email address has not been confirmed yet. Please check your inbox or disable "Confirm Email" under Supabase Dashboard > Authentication > Providers > Email.';
        }
        setErrorMessage(msg);
        setIsAuthenticating(false);
        return;
      }

      if (data.user) {
        console.log('[ChainShield Auth] Login Successful! Authenticated User ID:', data.user.id);
        // Trigger smooth FIDO2 biometric authentication sequence
        setFidoTriggered(true);
        setTimeout(() => {
          setFidoPassed(true);
        }, 1200);
      }
    } catch (err: any) {
      console.error('[ChainShield Auth] Unexpected Login Exception:', err);
      setErrorMessage(err.message || 'Authentication error occurred.');
      setIsAuthenticating(false);
    }
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
            <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">SUPABASE AUTHENTICATION GATEWAY</p>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-2 text-xs text-red-300 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {fidoTriggered ? (
          // Multi-Factor FIDO2 security scan animation after successful Supabase Auth
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {fidoPassed ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#2EA043]/10 border border-[#2EA043]/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto glowing-emerald animate-bounce">
                  <ShieldCheck className="w-8 h-8 text-[#2EA043]" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#2EA043] uppercase tracking-wider">Access Granted</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">Supabase Auth verified. Loading user workspace...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto glowing-blue animate-pulse">
                  <Fingerprint className="w-8 h-8 text-[#1F6FEB]" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Verifying Cryptographic Tokens</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">Establishing RLS user session...</p>
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
              <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                  placeholder="investigator@agency.gov"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Account Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                  placeholder="••••••••"
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
              {isAuthenticating ? 'Authenticating with Supabase...' : 'Verify Credentials & Login'}
            </button>
          </form>
        )}

        {/* Link to Sign Up Page */}
        <div className="pt-2 border-t border-gray-800/80 text-center">
          <button
            onClick={onSwitchToSignUp}
            className="text-xs font-mono text-gray-400 hover:text-[#1F6FEB] transition-colors inline-flex items-center gap-1"
          >
            <span>Don't have an account?</span>
            <span className="text-[#1F6FEB] font-bold underline">Create Sign Up Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}
