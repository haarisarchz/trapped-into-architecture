const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    const { data, error } = await supabase.from('jobs').select('id, firm_name, position').order('posted_date', { ascending: false }).limit(2);
    console.log(error || data);
}
checkJobs();
