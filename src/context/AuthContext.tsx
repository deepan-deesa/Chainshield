import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileState: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  logout: async () => {},
  updateProfileState: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);



  const getFallbackProfile = (authUser: User): UserProfile => {
    const saved = localStorage.getItem(`chainshield_profile_${authUser.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Investigator',
      badgeNumber: authUser.user_metadata?.badge_number || `SH-${authUser.id.substring(0, 4).toUpperCase()}`,
      role: 'EVIDENCE_ADMIN',
      department: 'Federal Cyber Crime Division',
      securityClearance: 'Level 5 (State-Security)',
      publicKey: `0x${authUser.id.replace(/-/g, '').substring(0, 40)}`,
      hardwareKeyId: `YubiKey-FIDO2-${authUser.id.substring(0, 4)}`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };
  };

  const fetchProfile = async (authUser: User) => {
    try {
      console.log('[ChainShield Auth] Fetching profile for user ID:', authUser.id);
      const fallback = getFallbackProfile(authUser);
      setProfile(fallback);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[ChainShield Auth] Profiles query notice:', error.message);
      }

      if (data) {
        console.log('[ChainShield Auth] Profile found in database:', data);
        const merged: UserProfile = {
          id: data.id,
          name: data.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Investigator',
          badgeNumber: data.badge_number || authUser.user_metadata?.badge_number || `SH-${authUser.id.substring(0, 4).toUpperCase()}`,
          role: 'EVIDENCE_ADMIN',
          department: data.department || 'Federal Cyber Crime Division',
          securityClearance: data.security_clearance || 'Level 5 (State-Security)',
          publicKey: `0x${authUser.id.replace(/-/g, '').substring(0, 40)}`,
          hardwareKeyId: `YubiKey-FIDO2-${authUser.id.substring(0, 4)}`,
          avatarUrl: fallback.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        };
        setProfile(merged);
      } else {
        console.log('[ChainShield Auth] No database profile found. Auto-creating profile row...');
        // Auto-provision profile record in database
        try {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: fallback.name,
            email: authUser.email || '',
            badge_number: fallback.badgeNumber,
            updated_at: new Date().toISOString()
          });
          console.log('[ChainShield Auth] Auto-provisioned profile record successfully.');
        } catch (upsertErr) {
          console.warn('[ChainShield Auth] Auto-provisioning profile notice:', upsertErr);
        }
      }
    } catch (err) {
      console.error('[ChainShield Auth] Error loading user profile:', err);
    }
  };


  useEffect(() => {
    let isMounted = true;

    // Immediately resolve initial session synchronously or via fast call
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    }).catch(err => {
      console.error('[ChainShield Auth] getSession error:', err);
      if (isMounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[ChainShield Auth] Auth state change event:', _event, session?.user?.email);
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);



  const logout = async () => {
    try {
      console.log('[ChainShield Auth] Signing out user & clearing local storage session tokens...');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[ChainShield Auth] Sign out error:', err);
    } finally {
      // Thoroughly clear all Supabase session tokens from localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('sb-') || key.includes('supabase') || key.includes('auth'))) {
          localStorage.removeItem(key);
        }
      }
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };


  const updateProfileState = (updated: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updated });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

