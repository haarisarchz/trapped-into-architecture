const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: user } = await supabase.auth.getUser();
    console.log("Current User:", user);
    
    // Just try to fetch all saved_jobs limit 10
    const { data, error } = await supabase.from('saved_jobs').select('*').limit(10);
    console.log("saved_jobs data:", data);
    console.log("saved_jobs error:", error);
}
test();