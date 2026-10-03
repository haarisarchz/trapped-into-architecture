const fs = require('fs');
let file = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

if (!file.includes('formatDate')) {
  file = file.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { formatDate } from "@/utils/formatDate";');
}

const createdRegex = /\{\s*c\.created_at\s*\?\s*new Date\(c\.created_at\)\.toLocaleDateString\("en-IN",\s*\{\s*day:\s*"2-digit",\s*month:\s*"2-digit",\s*year:\s*"numeric",\s*\}\)\s*:\s*"-.*?"\s*\}/g;
file = file.replace(createdRegex, '{c.created_at ? formatDate(c.created_at) : "-"}');

const updatedRegex = /\{\s*c\.updated_at\s*\?\s*new Date\(c\.updated_at\)\.toLocaleDateString\("en-IN",\s*\{\s*day:\s*"2-digit",\s*month:\s*"2-digit",\s*year:\s*"numeric",\s*\}\)\s*:\s*"-.*?"\s*\}/g;
file = file.replace(updatedRegex, '{c.updated_at ? formatDate(c.updated_at) : "-"}');

fs.writeFileSync('app/admin/companies/page.tsx', file);
console.log("Patched app/admin/companies/page.tsx");
