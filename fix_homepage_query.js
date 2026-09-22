const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const oldQuery = /const \{ data: recentJobs \} = await supabase\s*\.from\("jobs"\)\s*\.select\("\*"\)\s*\.eq\("status", "published"\)\s*\.order\("created_at", \{ ascending: false \}\)/;
const newQuery = `const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("posted_date", { ascending: false })`;

if (code.match(oldQuery)) {
  code = code.replace(oldQuery, newQuery);
  fs.writeFileSync('app/page.tsx', code);
}
