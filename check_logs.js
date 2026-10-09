const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kbbjllkbbgcvhixyoxom.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-key'; // I need to get the actual key if not available
// Actually let's just grep the key from .env.local
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const key = keyMatch ? keyMatch[1] : '';

const supabase = createClient(supabaseUrl, key);

async function check() {
  const { data, error } = await supabase.from('social_publishing_logs').select('*').order('updated_at', { ascending: false }).limit(20);
  console.log(data);
}
check();
