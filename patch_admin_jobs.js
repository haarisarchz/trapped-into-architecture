const fs = require('fs');
let file = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

if (!file.includes('formatDate')) {
  file = file.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { formatDate } from "@/utils/formatDate";');
}

file = file.replace(
  '{job.posted_date\n                          ? new Date(\n                              job.posted_date\n                            ).toLocaleDateString()\n                          : "-"}',
  '{job.posted_date ? formatDate(job.posted_date) : "-"}'
);
// Some cases might have single line or slightly different formatting due to prettier:
file = file.replace(
  /\{job\.posted_date\s*\?\s*new Date\(\s*job\.posted_date\s*\)\.toLocaleDateString\(\)\s*:\s*"-"\}/g,
  '{job.posted_date ? formatDate(job.posted_date) : "-"}'
);

fs.writeFileSync('app/admin/jobs/page.tsx', file);
console.log("Patched app/admin/jobs/page.tsx");
