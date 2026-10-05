const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from('social_publishing_logs')
        .select(`
            platform, 
            status, 
            updated_at,
            jobs ( firm_name )
        `)
        .eq('status', 'published')
        .gte('updated_at', yesterday)
        .order('updated_at', { ascending: false });
        
    console.log("Error:", error);
    console.log("Data:", data);
}
test();
