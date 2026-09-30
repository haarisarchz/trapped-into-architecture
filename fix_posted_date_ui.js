const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Where it renders job.posted_date:
const oldRender = '<p className="font-semibold mt-1">{job.posted_date}</p>';
const newRender = '<p className="font-semibold mt-1">{job.posted_date ? new Date(job.posted_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>';

if (content.includes(oldRender)) {
  content = content.replace(oldRender, newRender);
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Fixed posted_date rendering in individual job page");
} else {
  console.log("Could not find posted_date rendering");
}