const fs = require('fs');

let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldSelect = /const \{ data: existingJob \} = await supabase\.from\('jobs'\)\.select\('author_id'\)\.eq\('id', jobId\)\.single\(\);/;
const newSelect = `const { data: existingJob, error: authorError } = await supabase.from('jobs').select('id').eq('id', jobId).single();
      // Temporarily removed author_id from select to prevent schema crash`;

if (code.match(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
  fs.writeFileSync('app/admin/add-job/page.tsx', code);
}
