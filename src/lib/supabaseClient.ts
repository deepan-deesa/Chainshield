import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vhrjayagrovmjgoaykuo.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocmpheWFncm92bWpnb2F5a3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MTU5NDUsImV4cCI6MjA5OTQ5MTk0NX0.niQef2whEqSfv9fmEwOBB2J6SrXgUrkAnNXFoNcmtBg';

console.log('[ChainShield Auth] Initializing Supabase Client singleton...');
console.log('[ChainShield Auth] Target URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
