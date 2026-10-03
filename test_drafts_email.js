const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function test() {
    const { data, error } = await supabase.from('jobs').select('id, application_email, apply_link').eq('status', 'draft').order('id', { ascending: false }).limit(2);
    console.log("Drafts Email data:", data);
  }
  test();
}
