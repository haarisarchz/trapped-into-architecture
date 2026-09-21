const fs = require('fs');
let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
code = code.replace('const { data: allJobs } = await supabase', 'const { data: allJobs, error: jobsError } = await supabase');
code = code.replace('const companyJobs = (allJobs || []).filter', 'console.log("Server allJobs length:", allJobs?.length, "error:", jobsError, "slug:", slug, "company:", !!company);\n  const companyJobs = (allJobs || []).filter');
fs.writeFileSync('app/companies/[slug]/page.tsx', code);
