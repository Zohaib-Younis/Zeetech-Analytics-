import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;
let configured = !!(supabaseUrl && supabaseKey);

if (configured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,  // Don't save session in localStorage — always require login on fresh visit
        autoRefreshToken: false,
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client. Check if your URL is valid:', err);
    configured = false;
  }
} else {
  console.error('Missing Supabase environment variables! VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

export const isSupabaseConfigured = configured;
export const supabase = supabaseClient;

