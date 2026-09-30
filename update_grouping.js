const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// Replace uniqueJobs grouping key
const oldKeyRegex = /const key = j\.admin_post_id \|\| j\.id;/g;
const newKey = `// Group by admin_post_id if available, otherwise by firm_name and created_at timestamp (within 10 seconds)
                    const timeWindow = Math.floor(new Date(j.created_at).getTime() / 10000);
                    const key = j.admin_post_id || (j.firm_name + "_" + timeWindow);`;

content = content.replace(oldKeyRegex, newKey);

// Also need to replace the groupJobs filter that uses the same logic
const oldGroupRegex = /const groupJobs = filteredAdminJobs\.filter\(fj => \(fj\.admin_post_id \|\| fj\.id\) === \(uJob\.admin_post_id \|\| uJob\.id\)\);/g;
const newGroup = `const groupJobs = filteredAdminJobs.filter(fj => {
                      const fjTime = Math.floor(new Date(fj.created_at).getTime() / 10000);
                      const fjKey = fj.admin_post_id || (fj.firm_name + "_" + fjTime);
                      const uJobTime = Math.floor(new Date(uJob.created_at).getTime() / 10000);
                      const uJobKey = uJob.admin_post_id || (uJob.firm_name + "_" + uJobTime);
                      return fjKey === uJobKey;
                    });`;

content = content.replace(oldGroupRegex, newGroup);

fs.writeFileSync('app/admin/activity/page.tsx', content);
console.log("Updated admin activity grouping key");