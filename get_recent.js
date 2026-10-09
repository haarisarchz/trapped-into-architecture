const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
  let url, key;
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
  });

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('jobs')
    .select('id, position, firm_name, posted_date, status')
    .eq('status', 'published')
    .order('posted_date', { ascending: false })
    .limit(30);
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Recent jobs:");
  data.forEach(j => console.log(`${j.firm_name} - ${j.position} (${j.id}) - ${j.posted_date}`));
}
run();
