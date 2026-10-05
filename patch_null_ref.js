const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Fix 1: Handle null/undefined position
const badPos = `  let cleanPos = job.position;
  const pLower = cleanPos.toLowerCase();`;
const goodPos = `  let cleanPos = job.position || "";
  const pLower = cleanPos.toLowerCase();`;
file = file.replace(badPos, goodPos);

// Fix 2: Handle null/undefined city in supabase query
// We can use job.city || ""
const badQueryCity = `eq("city", job.city)`;
const goodQueryCity = `eq("city", job.city || "")`;
file = file.replace(badQueryCity, goodQueryCity);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched null reference fixes.");
