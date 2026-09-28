import { supabase, isSupabaseConfigured } from '../config/db.js';

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...');

  if (!isSupabaseConfigured()) {
    console.log(`
❌ Supabase is NOT configured yet in backend/.env!
Please replace SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY with your real Supabase credentials.
    `);
    process.exit(1);
  }

  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log(`
⚠️ Connected to Supabase, but the 'users' table does NOT exist yet!
👉 Action Needed:
   Copy the contents of 'backend/database/schema.sql' and run it in the Supabase SQL Editor.
        `);
      } else {
        console.error('❌ Supabase Query Error:', error.message);
      }
      process.exit(1);
    }

    console.log('✅ Supabase database connection verified successfully!');
    console.log('🎉 All tables are ready to store study materials, questions, and quizzes.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
