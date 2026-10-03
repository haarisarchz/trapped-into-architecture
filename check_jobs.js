const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: 'published' })
      .eq('id', 'aa923816-7674-41f5-94f6-745ce872a1ad')
      .select();
    
    if (error) console.error(error);
    else console.log(data);
}
checkJobs();
