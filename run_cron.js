const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCron() {
    const now = new Date().toISOString();
    const { data: scheduledJobs, error } = await supabase
      .from("jobs")
      .select("id, posted_date, status")
      .eq("status", "scheduled")
      .lte("posted_date", now);

    if (error) {
      console.error("Error fetching:", error);
      return;
    }
    
    console.log("Found jobs:", scheduledJobs);
    
    for (const job of scheduledJobs) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ status: "published", updated_at: now })
        .eq("id", job.id);
        
      if (updateError) {
        console.error("Update error:", updateError);
      } else {
        console.log("Published job:", job.id);
        // Call the publish social endpoint WITHOUT CRON_SECRET just by sending a normal request, but wait it doesn't need auth!
        const res = await fetch("https://www.trappedintoarchitecture.com/api/publish/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: job.id })
        });
        console.log("Social publish triggered:", await res.text());
      }
    }
}
runCron();
