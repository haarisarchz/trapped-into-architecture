const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const oldFetch = `        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "published")
          .eq("company_id", companyRecord.id)
          .order("posted_date", { ascending: false });
          
        if (jobsError) console.error("Error fetching jobs for company_id:", jobsError);
        companyJobs = jobs || [];`;

const newFetch = `        // Fetch jobs by both company_id and firm_name to support legacy jobs
        const { data: jobsById, error: errId } = await supabase.from("jobs").select("*").eq("status", "published").eq("company_id", companyRecord.id);
        const { data: jobsByFirm, error: errFirm } = await supabase.from("jobs").select("*").eq("status", "published").eq("firm_name", companyRecord.firm_name);
        
        if (errId) console.error("Error fetching jobs by id:", errId);
        if (errFirm) console.error("Error fetching jobs by firm:", errFirm);
        
        const combined = [...(jobsById || []), ...(jobsByFirm || [])];
        const uniqueJobs = Array.from(new Map(combined.map(job => [job.id, job])).values());
        
        companyJobs = uniqueJobs.sort((a: any, b: any) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime());`;

if (content.includes('eq("company_id", companyRecord.id)')) {
  content = content.replace(oldFetch, newFetch);
  fs.writeFileSync('app/companies/[slug]/page.tsx', content);
  console.log('Fixed job fetching logic');
} else {
  console.log('Could not find old fetch block.');
}