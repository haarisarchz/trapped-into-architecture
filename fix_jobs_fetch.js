const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldFetch = `const fetchJobs = async () => {
    const user = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    let query = supabase
      .from("jobs")
      .select("*");

    if (statusFilter && !["active", "expired"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query.order("id", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    let filteredJobs = data || [];

    // Enforce role locally to prevent schema crash if migration hasn't run
    const roleStr = (user?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (roleStr !== "ceo") {
      filteredJobs = filteredJobs.filter((job: any) => !job.author_id || job.author_id === user?.id);
    }`;

const newFetch = `const fetchJobs = async () => {
    const user = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    let query = supabase
      .from("jobs")
      .select("*");

    if (statusFilter && !["active", "expired"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query.order("id", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    let filteredJobs = data || [];

    // Manually fetch profiles to avoid Supabase relation crashes if foreign key is missing
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username");
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(p => profilesMap[p.id] = p);
    }

    // Enforce role locally to prevent schema crash if migration hasn't run
    const roleStr = (user?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (roleStr !== "ceo") {
      filteredJobs = filteredJobs.filter((job: any) => !job.author_id || job.author_id === user?.id);
    }
    
    // Attach profiles safely
    filteredJobs = filteredJobs.map((job: any) => ({
      ...job,
      profiles: job.author_id ? profilesMap[job.author_id] : null
    }));`;

if (code.includes(oldFetch)) {
   code = code.replace(oldFetch, newFetch);
   fs.writeFileSync('app/admin/jobs/page.tsx', code);
   console.log("Successfully updated jobs fetch");
} else {
   console.log("Failed to find jobs fetch");
}
