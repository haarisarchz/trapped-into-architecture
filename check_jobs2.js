const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: jobs, error } = await supabase.from("jobs").select("id, firm_name, position, status, posted_date").order('posted_date', { ascending: false }).limit(5);
    console.log("Error:", error);
    console.log(jobs);
}
test();
