import dotenv from 'dotenv';
dotenv.config();

let rawSupabaseUrl = process.env.SUPABASE_URL || '';
if (rawSupabaseUrl && !rawSupabaseUrl.startsWith('http://') && !rawSupabaseUrl.startsWith('https://')) {
  rawSupabaseUrl = `https://${rawSupabaseUrl}.supabase.co`;
}

export const config = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secure-jwt-secret-chainshield-2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-secure-jwt-refresh-secret-chainshield-2026',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: rawSupabaseUrl || `https://${process.env.DATABASE_URL || 'vhrjayagrovmjgoaykuo'}.supabase.co`,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

