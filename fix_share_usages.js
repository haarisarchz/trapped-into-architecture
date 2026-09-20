const fs = require('fs');

let jobDetail = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

jobDetail = jobDetail.replace(/initialShares=\{job\.share_count \|\| 0\}/g, 
  'initialShares={job.share_count || 0} organizationType={job.organization_type} location={`${job.city}, ${job.state}`}');

fs.writeFileSync('app/jobs/[id]/page.tsx', jobDetail);

let jobCard = fs.readFileSync('components/Jobcard.tsx', 'utf8');
jobCard = jobCard.replace(/initialShares=\{shareCount\}/g,
  'initialShares={shareCount} organizationType={organization_type} location={`${city}, ${state}`}');

fs.writeFileSync('components/Jobcard.tsx', jobCard);

console.log('Fixed ShareButtons usages');
