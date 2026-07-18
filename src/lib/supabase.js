import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error('Missing Supabase environment variables! VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

// We still try to create a client (might be invalid URL, which is fine, we just won't use it successfully)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

