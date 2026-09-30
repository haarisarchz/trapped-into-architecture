const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /const cityJobs = jobs\.filter/;

const logic = `
    const autoExpiryDate = new Date(new Date(job.posted_date || job.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const showExpiry = job.post_expiry_date && job.post_expiry_date !== autoExpiryDate;

  const cityJobs = jobs.filter`;

content = content.replace(regex, logic);
fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Added showExpiry logic");