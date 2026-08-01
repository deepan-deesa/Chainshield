import React from 'react';
import { ShieldAlert, Mail, Lock, User, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
}

export default function SignUpView({ onSwitchToLogin }: SignUpViewProps) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [needsVerification, setNeedsVerification] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setNeedsVerification(false);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    console.log('[ChainShield Auth] Initiating Supabase Auth Signup for:', email.trim());

    try {
      const badgeNum = `SH-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            badge_number: badgeNum
          }
        }
      });

      console.log('[ChainShield Auth] Supabase SignUp Response:', { data, error });

      if (error) {
        console.error('[ChainShield Auth] Supabase SignUp Error:', error);
        let userMsg = error.message || 'Signup failed via Supabase Authentication.';
        if (error.message?.toLowerCase().includes('rate limit exceeded') || error.status === 429) {
          userMsg = 'Supabase email rate limit reached (max 3-4 signup confirmation emails per hour on default SMTP). Please wait a few minutes or disable "Confirm email" under Supabase Project Settings > Authentication > Providers > Email.';
        }
        setErrorMessage(userMsg);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        console.log('[ChainShield Auth] Real Supabase User Created with ID:', data.user.id);

        // 2. Insert into public.profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            badge_number: badgeNum,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.warn('[ChainShield Auth] Profiles table insert warning (RLS or missing table):', profileError.message);
        } else {
          console.log('[ChainShield Auth] User profile row successfully created in database.');
        }

        // 3. Handle Session vs Email Verification status
        if (data.session) {
          // Email confirmation is DISABLED in Supabase project -> Auto Logged In!
          setSuccessMessage('Account created & authenticated! Redirecting to dashboard session...');
          console.log('[ChainShield Auth] Auto-session active. User logged in.');
        } else {
          // Email confirmation is ENABLED in Supabase project
          setNeedsVerification(true);
          setSuccessMessage('Account created in Supabase! If email confirmation is enabled in your project, check your inbox. If you have disabled email confirmation in Supabase dashboard, click "Login Here" below to access your account.');
          console.log('[ChainShield Auth] User created in Supabase Auth.');
        }
      }
    } catch (err: any) {
      console.error('[ChainShield Auth] Unexpected Exception during SignUp:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-[#F0F6FC] font-sans relative overflow-hidden">
      {/* Background graphics */}
      <div className="absolute inset-0 bg-radial-gradient from-[#1F6FEB]/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1F6FEB]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#161B22]/85 backdrop-blur-xl p-8 rounded-2xl border border-gray-800/80 space-y-6 relative glowing-blue">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="p-3 bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 rounded-xl inline-flex glowing-blue">
            <ShieldAlert className="w-8 h-8 text-[#1F6FEB] animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-white">INITIALIZE INVESTIGATOR ACCOUNT</h1>
            <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">CHAINSHIELD SUPABASE AUTH REGISTRATION</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-2 text-xs text-red-300 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                placeholder="Agent Marcus Vance"
              />
            </div>
          </div>

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
            <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Password</label>
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

          <div className="space-y-1">
            <label className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0D1117] border border-gray-800 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#1F6FEB] text-white font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3 rounded-lg font-mono font-bold tracking-wider uppercase transition-all duration-300 border flex items-center justify-center gap-2 mt-4
              ${isSubmitting
                ? 'bg-gray-800/40 border-gray-800/80 text-gray-600 cursor-not-allowed'
                : 'bg-[#1F6FEB] hover:bg-[#1F6FEB]/95 border-[#1F6FEB] text-white shadow-md shadow-[#1F6FEB]/25'
              }
            `}
          >
            {isSubmitting ? 'Creating Supabase Account...' : 'Sign Up & Provision Profile'}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-800/80 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-xs font-mono text-gray-400 hover:text-[#1F6FEB] transition-colors inline-flex items-center gap-1"
          >
            <span>Already have an authenticated account?</span>
            <span className="text-[#1F6FEB] font-bold underline">Login Here</span>
          </button>
        </div>

      </div>
    </div>
  );
}
