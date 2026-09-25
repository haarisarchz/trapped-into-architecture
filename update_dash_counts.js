const fs = require('fs');
let c = fs.readFileSync('app/admin/page.tsx', 'utf-8');

const regex = /const \{ data, error \} =\s*await supabase\s*\.from\("jobs"\)\s*\.select\("\*"\)\s*\.order\("posted_date", \{\s*ascending: false,\s*\}\);/;

const replacement = 'const [adminRes, legacyRes] = await Promise.all([\n' +
'  supabase.from("admin_jobs").select("*").order("posted_date", { ascending: false }),\n' +
'  supabase.from("jobs").select("*").is("admin_post_id", null).order("posted_date", { ascending: false })\n' +
']);\n' +
'const error = adminRes.error || legacyRes.error;\n' +
'let data = null;\n' +
'if (!error) {\n' +
'  data = [...(adminRes.data || []), ...(legacyRes.data || [])];\n' +
'  data.sort((a, b) => new Date(b.created_at || b.posted_date || 0).getTime() - new Date(a.created_at || a.posted_date || 0).getTime());\n' +
'}';

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/page.tsx', c);
console.log('Done dashboard counts');