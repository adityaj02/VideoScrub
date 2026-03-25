
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('services').select('name');
  if (data) {
    const counts = {};
    data.forEach(row => {
      counts[row.name] = (counts[row.name] || 0) + 1;
    });
    console.log("Service Name Counts:", counts);
  }
  if (error) console.error("Error:", error);
}

check();
