import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Check your server/.env file.');
}

// Service role key — this client bypasses Row Level Security.
// This must only ever be used on the backend, never sent to the frontend.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
