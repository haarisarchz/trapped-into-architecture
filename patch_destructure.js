const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const badLogic = `  // Fetch related jobs securely without arbitrary limits
  const [
    { data: cityJobs = [] },
    { data: positionJobs = [] },
    { data: recentJobs = [] }
  ] = await Promise.all([
    supabase.from("jobs").select("*").eq("status", "published").eq("city", job.city || "").neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").ilike("position", \`%\${cleanPos}%\`).neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").neq("id", id).order("created_at", { ascending: false }).limit(3)
  ]);`;

const goodLogic = `  // Fetch related jobs securely without arbitrary limits
  const [cityRes, posRes, recRes] = await Promise.all([
    supabase.from("jobs").select("*").eq("status", "published").eq("city", job.city || "").neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").ilike("position", \`%\${cleanPos}%\`).neq("id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("jobs").select("*").eq("status", "published").neq("id", id).order("created_at", { ascending: false }).limit(3)
  ]);
  const cityJobs = cityRes.data || [];
  const positionJobs = posRes.data || [];
  const recentJobs = recRes.data || [];`;

file = file.replace(badLogic, goodLogic);
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched array destructing fallback");
