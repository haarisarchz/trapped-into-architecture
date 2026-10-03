const fs = require('fs');
let file = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

if (!file.includes('formatDate')) {
  file = file.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { formatDate } from "@/utils/formatDate";');
}

const dateRegex = /\{\s*job\.posted_date\s*\|\|\s*job\.created_at\s*\?\s*new Date\(\s*job\.posted_date\s*\|\|\s*job\.created_at\s*\)\.toLocaleDateString\('en-GB',\s*\{\s*day:\s*'2-digit',\s*month:\s*'short',\s*year:\s*'numeric'\s*\}\)\s*:\s*'-'\s*\}/g;
file = file.replace(dateRegex, '{job.posted_date || job.created_at ? formatDate(job.posted_date || job.created_at) : "-"}');

fs.writeFileSync('app/admin/activity/page.tsx', file);
console.log("Patched app/admin/activity/page.tsx");
