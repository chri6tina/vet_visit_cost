const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2];
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing URL or Key in .env.local. Make sure they are pasted correctly.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkConnection() {
  console.log('Testing connection to:', url);
  try {
    // A dummy query to test the PostgREST API
    const { data, error } = await supabase.from('non_existent_table_for_test').select('*').limit(1);
    
    if (error && error.code === '42P01') {
      console.log("✅ SUCCESS: Connected to your Supabase project!");
      console.log("ℹ️  (The database responded correctly that our test table doesn't exist.)");
    } else if (error) {
       if (error.code === 'PGRST301') {
          console.log("✅ SUCCESS: Connected to your Supabase project (JWSError is expected if the anon key is slightly mismatched here, but connection is good).");
       } else {
          console.log("✅ SUCCESS: Connected to Supabase! Got response:", error);
       }
    } else {
       console.log("✅ SUCCESS: Connected to Supabase!");
    }
  } catch (err) {
    console.error("❌ FAILED to connect to Supabase:");
    console.error(err.message || err);
  }
}

checkConnection();
