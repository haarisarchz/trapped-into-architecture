const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (data) {
    console.log("JOB KEYS:", Object.keys(data[0]));
  }
})();