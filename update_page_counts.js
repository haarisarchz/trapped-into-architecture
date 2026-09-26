const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /const \{ count: jobsCount \} = await supabase\s*\.from\("jobs"\)\s*\.select\("\*", \{ count: "exact", head: true \}\)\s*\.eq\("status", "published"\);/s;

const replacement = `const { data: jobsData } = await supabase
    .from("jobs")
    .select("employment_type, position")
    .eq("status", "published");

  let jobsCount = 0;
  let internshipsCount = 0;

  if (jobsData) {
    jobsData.forEach(job => {
      const isIntern = job.employment_type === 'Internship' || (job.position && job.position.toLowerCase().includes('intern'));
      if (isIntern) {
        internshipsCount++;
      } else {
        jobsCount++;
      }
    });
  }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/page.tsx', content);
  console.log("Success replacing count logic in page.tsx");
} else {
  console.log("Regex not found in page.tsx");
}