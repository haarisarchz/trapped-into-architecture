const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Replace the single 20 limit query with proper concurrent queries
const oldQuery = `  const { data: jobs = [] } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .neq("id", id)
    .limit(20);

  if (!job || error) {`;

const newQuery = `  if (!job || error) {
    return (
      <main className="p-10">
        <h1 className="text-5xl font-bold">Job Not Found</h1>
      </main>
    );
  }

  let cleanPos = job.position;
  const pLower = cleanPos.toLowerCase();
  if (pLower.includes("junior architect")) cleanPos = "Junior Architect";
  else if (pLower.includes("senior architect")) cleanPos = "Senior Architect";
  else if (pLower.includes("architect")) cleanPos = "Architect";
  else if (cleanPos.includes("/") || cleanPos.includes("-")) cleanPos = cleanPos.split(/[\\/-]/)[0].trim();

  // Fetch related jobs securely without arbitrary limits
  const [
    { data: cityJobs = [] },
    { data: positionJobs = [] },
    { data: recentJobs = [] }
  ] = await Promise.all([
    supabase.from("jobs").select("*").eq("status", "published").eq("city", job.city).neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").ilike("position", \`%\${cleanPos}%\`).neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").neq("id", id).order("created_at", { ascending: false }).limit(3)
  ]);`;

file = file.replace(oldQuery, newQuery);

// Remove the old local filtering logic
const oldLocalLogic = `  let cleanPos = job.position;
  const pLower = cleanPos.toLowerCase();
  if (pLower.includes("junior architect")) cleanPos = "Junior Architect";
  else if (pLower.includes("senior architect")) cleanPos = "Senior Architect";
  else if (pLower.includes("architect")) cleanPos = "Architect";
  else if (cleanPos.includes("/") || cleanPos.includes("-")) cleanPos = cleanPos.split(/[\\/-]/)[0].trim();

  const cityJobs = jobs.filter((j: any) => j.city === job.city && j.id !== job.id).slice(0, 3);
  const positionJobs = jobs.filter((j: any) => j.position.toLowerCase().includes(cleanPos.toLowerCase()) && j.id !== job.id).slice(0, 3);
  const recentJobs = [...jobs].filter((j: any) => j.id !== job.id).sort((a,b) => new Date(b.created_at || b.posted_date).getTime() - new Date(a.created_at || a.posted_date).getTime()).slice(0, 3);`;

file = file.replace(oldLocalLogic, '');
// Also remove popularJobs if it still exists
file = file.replace(/const popularJobs = \[.*?;\n/g, '');

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched related job fetching logic.");
