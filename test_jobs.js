const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    const { data: tJobs } = await supabase.from('jobs').select('id, position').eq('city', 'Tiruchirappalli').eq('status', 'published');
    const { data: aJobs } = await supabase.from('jobs').select('id, position').ilike('position', '%Assistant Professor%').eq('status', 'published');
    console.log("Tiruchirappalli jobs:", tJobs?.length);
    console.log("Assistant Professor jobs:", aJobs?.length);
}
checkJobs();
