const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/fetchSuggestions=\{async \(q\) => \{\s*let query = supabase\.from\('companies'\)\.select\('neighborhood'\)\.ilike\('neighborhood', \%\%\\);\s*if \(city\) query = query\.eq\('city', city\);\s*const \{ data \} = await query\.limit\(20\);\s*return Array\.from\(new Set\(data\?\.map\(d => d\.neighborhood\)\.filter\(Boolean\)\)\) || \[\];\s*\}\}/, 'fetchSuggestions={async (q) => {\n' +
'  let qC = supabase.from("companies").select("neighborhood").ilike("neighborhood", "%" + q + "%");\n' +
'  let qJ = supabase.from("jobs").select("neighborhood").ilike("neighborhood", "%" + q + "%");\n' +
'  if (city) { qC = qC.eq("city", city); qJ = qJ.eq("city", city); }\n' +
'  const [{data: d1}, {data: d2}] = await Promise.all([qC.limit(10), qJ.limit(10)]);\n' +
'  const combined = [...(d1 || []), ...(d2 || [])];\n' +
'  return Array.from(new Set(combined.map(d => d.neighborhood).filter(Boolean)));\n' +
'}}');

c = c.replace(/fetchSuggestions=\{async \(q\) => \{\s*let query = supabase\.from\('companies'\)\.select\('city'\)\.ilike\('city', \%\%\\);\s*if \(state\) query = query\.eq\('state', state\);\s*const \{ data \} = await query\.limit\(20\);\s*return Array\.from\(new Set\(data\?\.map\(d => d\.city\)\.filter\(Boolean\)\)\) || \[\];\s*\}\}/, 'fetchSuggestions={async (q) => {\n' +
'  let qC = supabase.from("companies").select("city").ilike("city", "%" + q + "%");\n' +
'  let qJ = supabase.from("jobs").select("city").ilike("city", "%" + q + "%");\n' +
'  if (state) { qC = qC.eq("state", state); qJ = qJ.eq("state", state); }\n' +
'  const [{data: d1}, {data: d2}] = await Promise.all([qC.limit(10), qJ.limit(10)]);\n' +
'  const combined = [...(d1 || []), ...(d2 || [])];\n' +
'  return Array.from(new Set(combined.map(d => d.city).filter(Boolean)));\n' +
'}}');

c = c.replace(/fetchSuggestions=\{async \(q\) => \{\s*const \{ data \} = await supabase\.from\('companies'\)\.select\('state'\)\.ilike\('state', \%\%\\)\.limit\(20\);\s*return Array\.from\(new Set\(data\?\.map\(d => d\.state\)\.filter\(Boolean\)\)\) || \[\];\s*\}\}/, 'fetchSuggestions={async (q) => {\n' +
'  const [{data: d1}, {data: d2}] = await Promise.all([\n' +
'    supabase.from("companies").select("state").ilike("state", "%" + q + "%").limit(10),\n' +
'    supabase.from("jobs").select("state").ilike("state", "%" + q + "%").limit(10)\n' +
'  ]);\n' +
'  const combined = [...(d1 || []), ...(d2 || [])];\n' +
'  return Array.from(new Set(combined.map(d => d.state).filter(Boolean)));\n' +
'}}');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done location suggestions');