const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('jobs').select('id, position, firm_name, created_at').order('created_at', { ascending: false }).limit(20);
  console.log(data);
}
check();