const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bcifyymjfktabtsmocnc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y');

async function simulateFetchJob() {
  const jobId = "e28d9f22-194b-4de1-a4c5-612f35170a34";
  console.log("Fetching job...");
  const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
        
  if (error) { console.error("Error fetching job", error); return; }
  
  if (job) {
    let query = supabase.from("jobs").select("*")
          .eq("firm_name", job.firm_name)
          .eq("status", job.status);
        
    if (job.posted_date) query = query.eq("posted_date", job.posted_date);
    else query = query.is("posted_date", null);

    if (job.image) query = query.eq("image", job.image);
    
    const { data: siblings, error: sibError } = await query;
    if (sibError) console.error("Sibling error:", sibError);
    
    const validSiblings = siblings && siblings.length > 0 ? siblings : [job];
    
    // Simulate setPositions
    const mapped = validSiblings.map(s => {
             let rRole = "";
             let rDesc = s.job_description || "";
             if (rDesc.startsWith("**Job Role:**")) {
               const lines = rDesc.split("\n\n");
               if (lines.length > 1) {
                 rRole = lines[0].replace("**Job Role:**", "").trim();
                 rDesc = lines.slice(1).join("\n\n");
               }
             }
             return {
             id: s.id,
             position: s.position || "",
             role: rRole,
             salary: s.salary || "",
             description: rDesc,
             experience: Array.isArray(s.experience) ? s.experience : (s.experience ? [s.experience] : []),
             qualifications: Array.isArray(s.qualifications) ? s.qualifications.join(", ") : (s.qualifications || ""),
             skills: Array.isArray(s.skills_required) ? s.skills_required : (s.skills_required ? [s.skills_required] : []),
             completed: false
           };
        });
    console.log("Mapped valid siblings successfully");
    
    console.log("Setting imageUrl to:", job.image || "");
    
    if (job.apply_link && job.apply_link.trim() !== "") {
        console.log("Set application type to apply");
    } else if (job.application_email && job.application_email.trim() !== "") {
        console.log("Set application type to email");
        console.log("Set application email to:", job.application_email);
    } else {
        console.log("Set application type to apply (fallback)");
    }
  }
}
simulateFetchJob().catch(console.error);
