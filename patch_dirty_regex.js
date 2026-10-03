const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Replace the if (selectedCompanyId) condition inside the dirty tracking useEffect
const regexDirty = /useEffect\(\(\) => \{\s*if \(selectedCompanyId\) \{\s*setIsCompanyProfileDirty\(true\);\s*\}\s*\}, \[/g;
const replacementDirty = `useEffect(() => {
    setIsCompanyProfileDirty(true);
  }, [`;

file = file.replace(regexDirty, replacementDirty);

// Fix fetchJob company loading to use company_id if available
const regexFetchJob = /if \(job\.firm_name\) \{\s*const \{ data: comp \} = await supabase\.from\("companies"\)\.select\("\*"\)\.ilike\("firm_name", job\.firm_name\)\.maybeSingle\(\);\s*if \(comp\) \{/g;
const replacementFetchJob = `if (job.firm_name || job.company_id) {
            let comp = null;
            if (job.company_id) {
              const { data } = await supabase.from("companies").select("*").eq("id", job.company_id).maybeSingle();
              comp = data;
            }
            if (!comp && job.firm_name) {
              const { data } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();
              comp = data;
            }
            if (comp) {`;

file = file.replace(regexFetchJob, replacementFetchJob);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched dirty flag and fetch logic via regex.");
