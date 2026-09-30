const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

if (!content.includes('import { EXPERIENCE_OPTIONS }')) {
  content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { EXPERIENCE_OPTIONS } from "@/app/constants/jobFilters";');
}

// Now replace the dynamic experience options generation
const oldExpOptions = `{[
        ...new Set(
          jobs.flatMap((job) =>
  
            Array.isArray(job.experience)
              ? job.experience.map((exp: any) => typeof exp === 'string' ? exp.trim() : String(exp || ''))
              : []
  
          )
        ),
      ]
        .filter(Boolean)`;

// Let's replace the whole block dynamically with regex since spacing might be weird
const regex = /\{\[\s*\.\.\.new Set\(\s*jobs\.flatMap\(\(job\) =>\s*Array\.isArray\(job\.experience\)\s*\?\s*job\.experience\.map\(\(exp:\s*any\)\s*=>\s*typeof\s*exp\s*===\s*'string'\s*\?\s*exp\.trim\(\)\s*:\s*String\(exp \|\|\s*''\)\)\s*:\s*\[\]\s*\)\s*\),\s*\]\s*\.filter\(Boolean\)/g;

if (regex.test(content)) {
  content = content.replace(regex, 'EXPERIENCE_OPTIONS');
  fs.writeFileSync('app/jobs/page.tsx', content);
  console.log("Successfully replaced filter array in jobs page.");
} else {
  // If regex fails, let's try a broader one
  const broadRegex = /\{\[\s*\.\.\.new Set\([\s\S]*?\]\s*\.filter\(Boolean\)/;
  if (broadRegex.test(content)) {
      content = content.replace(broadRegex, 'EXPERIENCE_OPTIONS');
      fs.writeFileSync('app/jobs/page.tsx', content);
      console.log("Successfully replaced filter array in jobs page (fallback regex).");
  } else {
      console.log("Failed to match filter array.");
  }
}