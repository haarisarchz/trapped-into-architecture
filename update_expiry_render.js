const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

content = content.replace(
  '{job.post_expiry_date && (\\n                            <div>\\n                              <p className="text-sm text-gray-500">Post Expiry Date</p>\\n                              <p className="font-semibold mt-1">{job.post_expiry_date}</p>\\n                            </div>\\n                          )}',
  '{showExpiry && (\\n                            <div>\\n                              <p className="text-sm text-gray-500">Post Expiry Date</p>\\n                              <p className="font-semibold mt-1">{job.post_expiry_date}</p>\\n                            </div>\\n                          )}'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Expiry Date condition via string match");