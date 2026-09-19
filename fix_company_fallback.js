const fs = require('fs');

let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const oldFetch = `  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();`;

const newFetch = `  let { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    const { data: jobs } = await supabase.from("jobs").select("*");
    if (jobs) {
       const jobMatch = jobs.find(j => {
          if (!j.firm_name) return false;
          const generatedSlug = j.firm_name.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
          return generatedSlug === slug;
       });
       if (jobMatch) {
          company = {
             id: jobMatch.id, // fake id for uniqueness check
             firm_name: jobMatch.firm_name,
             slug: slug,
             city: jobMatch.city || "",
             state: jobMatch.state || "",
             organization_type: "Company",
          };
       }
    }
  }`;

code = code.replace(oldFetch, newFetch);

fs.writeFileSync('app/companies/[slug]/page.tsx', code);
console.log('Fixed company fallback');
