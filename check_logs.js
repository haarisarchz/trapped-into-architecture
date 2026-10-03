const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    const { data, error } = await supabase
      .from('social_publishing_logs')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) console.error(error);
    else console.log(data);
}
checkLogs();
