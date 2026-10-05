const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

if (!file.includes('import { formatDate } from "@/utils/formatDate";')) {
  file = file.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { formatDate } from "@/utils/formatDate";');
  fs.writeFileSync('app/jobs/[id]/page.tsx', file);
  console.log("Patched app/jobs/[id]/page.tsx");
} else {
  console.log("Already patched.");
}
