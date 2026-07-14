import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

let isSupabaseHealthy = false;
let supabaseClientInstance: any = null;

function isValidHttpUrl(stringStr: string) {
  try {
    const url = new URL(stringStr);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;  
  }
}

function getSupabaseClient() {
  if (!supabaseClientInstance) {
    let url = config.supabaseUrl;
    if (!url || !isValidHttpUrl(url)) {
      url = 'https://placeholder.supabase.co'; // Prevent startup crash
    }
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey || 'dummy-anon-key';
    supabaseClientInstance = createClient(url, key);
  }
  return supabaseClientInstance;
}

// Transparent Proxy to allow lazy initialization and avoid module-load crashes
export const supabase = new Proxy({} as any, {
  get(target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export function isSupabaseConnected(): boolean {
  return isSupabaseHealthy;
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are not fully configured.');
    isSupabaseHealthy = false;
    return false;
  }
  try {
    // Attempt a lightweight query to test the connection.
    const { error } = await supabase.from('Officer').select('id').limit(1);
    
    if (error && error.code === 'PGRST301') {
      console.error('Supabase key/auth configuration is invalid:', error.message);
      isSupabaseHealthy = false;
      return false;
    }
    
    isSupabaseHealthy = true;
    return true;
  } catch (err) {
    console.error('Supabase connection check threw exception:', err);
    isSupabaseHealthy = false;
    return false;
  }
}

export async function initializeSupabaseStorage() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('⚠️ Failed to list Supabase storage buckets:', error.message);
      return;
    }
    
    const bucketName = 'evidence-files';
    const hasBucket = buckets.some(b => b.name === bucketName);
    
    if (!hasBucket) {
      console.log(`Creating missing Supabase storage bucket "${bucketName}"...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false
      });
      if (createError) {
        console.warn(`⚠️ Failed to create storage bucket "${bucketName}":`, createError.message);
      } else {
        console.log(`✅ Created Supabase storage bucket "${bucketName}" successfully.`);
      }
    } else {
      console.log(`✅ Supabase storage bucket "${bucketName}" already exists.`);
    }
  } catch (err) {
    console.error('Exception during Supabase storage bucket check/creation:', err);
  }
}
