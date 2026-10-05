const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Fix the filter logic so it doesn't include the current job in the sidebars
file = file.replace(
  'const cityJobs = jobs.filter((j: any) => j.city === job.city).slice(0, 3);',
  'const cityJobs = jobs.filter((j: any) => j.city === job.city && j.id !== job.id).slice(0, 3);'
);
file = file.replace(
  'const positionJobs = jobs.filter((j: any) => j.position === job.position).slice(0, 3);',
  'const positionJobs = jobs.filter((j: any) => j.position === job.position && j.id !== job.id).slice(0, 3);'
);
file = file.replace(
  'const recentJobs = [...jobs].sort((a,b) => new Date(b.created_at || b.posted_date).getTime() - new Date(a.created_at || a.posted_date).getTime()).slice(0, 3);',
  'const recentJobs = [...jobs].filter((j: any) => j.id !== job.id).sort((a,b) => new Date(b.created_at || b.posted_date).getTime() - new Date(a.created_at || a.posted_date).getTime()).slice(0, 3);'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched filter logic.");
