const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /\{job\.post_expiry_date && \(\s*<div>\s*<p className="text-sm text-gray-500">Post Expiry Date<\/p>\s*<p className="font-semibold mt-1">\{job\.post_expiry_date\}<\/p>\s*<\/div>\s*\)\}/;

const replacement = `{showExpiry && (
                            <div>
                              <p className="text-sm text-gray-500">Post Expiry Date</p>
                              <p className="font-semibold mt-1">{job.post_expiry_date}</p>
                            </div>
                          )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Expiry Date rendering");