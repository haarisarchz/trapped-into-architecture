const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  async function updateNullAuthors() {
    const { data, error } = await supabase
      .from('jobs')
      .update({ author_id: 'ef2f04cf-d504-411a-9e88-377beddb01e1' })
      .is('author_id', null);
      
    console.log("Updated jobs:", data, "Error:", error);
  }
  updateNullAuthors();
}