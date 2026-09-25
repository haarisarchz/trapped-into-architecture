const fs = require('fs');
let c = fs.readFileSync('app/admin/page.tsx', 'utf-8');

const regex = /const \[adminRes, legacyRes\] = await Promise\.all\(\[[\s\S]*?if \(!error\) \{/;
const replacement = 'const { data, error } = await supabase.from("jobs").select("*").order("posted_date", { ascending: false });\nif (!error) {';
c = c.replace(regex, replacement);

c = c.replace('data = [...(adminRes.data || []), ...(legacyRes.data || [])];\n  data.sort((a, b) => new Date(b.created_at || b.posted_date || 0).getTime() - new Date(a.created_at || a.posted_date || 0).getTime());', '');

fs.writeFileSync('app/admin/page.tsx', c);
console.log('Fixed dashboard');