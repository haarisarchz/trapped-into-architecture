const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Fix the dirty flag tracking to not depend on selectedCompanyId
file = file.replace(
  'useEffect(() => {\n      if (selectedCompanyId) {\n        setIsCompanyProfileDirty(true);\n      }\n    }, [',
  'useEffect(() => {\n      setIsCompanyProfileDirty(true);\n    }, ['
);

// 2. Fix the company fetching inside fetchJob
file = file.replace(
  'if (job.firm_name) {\n            const { data: comp } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();\n            if (comp) {',
  'if (job.firm_name || job.company_id) {\n            let comp = null;\n            if (job.company_id) {\n              const { data } = await supabase.from("companies").select("*").eq("id", job.company_id).maybeSingle();\n              comp = data;\n            }\n            if (!comp && job.firm_name) {\n              const { data } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();\n              comp = data;\n            }\n            if (comp) {'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched dirty flag and fetch logic.");
