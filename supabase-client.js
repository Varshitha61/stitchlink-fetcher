import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env file if it exists (Node 20.12.0+)
if (fs.existsSync('.env')) {
  process.loadEnvFile();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Warning] SUPABASE_URL or SUPABASE_KEY is not defined in your environment variables.');
  console.warn('          Make sure to set these to connect to your Supabase project.');
}

// Instantiate client if keys are present, otherwise export null
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Asserts that the Supabase configuration is present.
 * Throws a descriptive error if variables are missing.
 */
export function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration.\n' +
      'Please ensure you define the following environment variables:\n' +
      '  - SUPABASE_URL\n' +
      '  - SUPABASE_KEY (anon or service role key)\n' +
      'You can define these in a .env file and execute node with the --env-file flag, e.g.:\n' +
      '  node --env-file=.env sync-to-supabase.js'
    );
  }
}
