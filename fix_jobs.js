const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

const regex = /let queryAdmin = supabase\.from\("admin_jobs"\)[\s\S]*?const \{ data: profilesData \} = await supabase\.from\("profiles"\)/;
const replacement = 'let query = supabase.from("jobs").select("*");\n' +
'    if (statusFilter && !["active", "expired"].includes(statusFilter)) {\n' +
'      query = query.eq("status", statusFilter);\n' +
'    }\n' +
'    const { data, error } = await query.order("id", { ascending: false });\n' +
'    if (error) console.log(error);\n' +
'    let filteredJobs = data || [];\n' +
'    const { data: profilesData } = await supabase.from("profiles")';
c = c.replace(regex, replacement);

c = c.replace(/const \{ error \} = await supabase\s*\.from\("admin_jobs"\)\s*\.delete\(\)\s*\.eq\("id", id\);/, 'const { error } = await supabase.from("jobs").delete().eq("id", id);');

fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed manage jobs');