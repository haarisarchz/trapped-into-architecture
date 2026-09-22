const fs = require('fs');

let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldFetch = /const fetchJobs = async \(\) => \{[\s\S]*?let filteredJobs = data \|\| \[\];/;

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

    // Enforce role locally to prevent schema crash if migration hasn't run
    const roleStr = (user?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (roleStr !== "ceo") {
      filteredJobs = filteredJobs.filter((job: any) => !job.author_id || job.author_id === user?.id);
    }
`;

if (code.match(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
  fs.writeFileSync('app/admin/jobs/page.tsx', code);
}
