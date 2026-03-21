
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', 'f50e6b5b-7798-4af3-9071-7338e0f0cde6');
  console.log("Profile:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}

check();
