const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');
if (!content.includes('generateJobUrl')) {
    content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { generateJobUrl } from "@/utils/jobUrl";');
} else if (!content.includes('import { generateJobUrl')) {
    content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { generateJobUrl } from "@/utils/jobUrl";');
}
fs.writeFileSync('app/profile/[username]/page.tsx', content);