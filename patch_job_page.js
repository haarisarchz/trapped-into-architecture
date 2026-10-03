const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

if (!file.includes('formatDate')) {
  file = file.replace('import { generateCompanySlug } from "@/utils/jobUrl";', 'import { generateCompanySlug } from "@/utils/jobUrl";\nimport { formatDate } from "@/utils/formatDate";');
}

// 1. Posted Date
file = file.replace(
  'job.posted_date ? new Date(job.posted_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""',
  'formatDate(job.posted_date)'
);

// 2. Last Date to Apply
file = file.replace(
  '<p className="font-semibold mt-1">{job.last_date_to_apply}</p>',
  '<p className="font-semibold mt-1">{formatDate(job.last_date_to_apply)}</p>'
);

// 3. Post Expiry Date
file = file.replace(
  '<p className="font-semibold mt-1">{job.post_expiry_date}</p>',
  '<p className="font-semibold mt-1">{formatDate(job.post_expiry_date)}</p>'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched app/jobs/[id]/page.tsx");
