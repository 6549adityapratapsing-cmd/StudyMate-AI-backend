import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials have been replaced with real Supabase keys
export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseServiceKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseServiceKey.includes('your_supabase_service_role')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(`
⚠️ [Database Warning]: Supabase credentials in .env are still placeholders.
👉 To connect your live database:
   1. Go to https://supabase.com and create a free project.
   2. Open Project Settings -> API.
   3. Copy 'Project URL' into SUPABASE_URL in backend/.env.
   4. Copy 'service_role secret' into SUPABASE_SERVICE_ROLE_KEY in backend/.env.
   5. Run the SQL script from backend/database/schema.sql in the Supabase SQL Editor.
  `);
}

// Create Supabase Client with service role access (for backend admin operations)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
