const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: jobs } = await supabase.from("jobs").select("id, firm_name, position, status, posted_date, created_at").order('created_at', { ascending: false }).limit(5);
    console.log(jobs);
}
test();
