const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Group by heuristic instead of admin_post_id
const oldGroup = `                  const uniqueJobs = [];
                  const seenPostIds = new Set();
                  for (const j of filteredAdminJobs) {
                    const key = j.admin_post_id || j.id;
                    if (!seenPostIds.has(key)) {
                      seenPostIds.add(key);
                      uniqueJobs.push({ ...j });
                    } else {
                      const existing = uniqueJobs.find(u => (u.admin_post_id || u.id) === key);`;

const newGroup = `                  const uniqueJobs = [];
                  const seenPostIds = new Set();
                  for (const j of filteredAdminJobs) {
                    const key = j.firm_name + '_' + j.status + '_' + (j.posted_date || j.created_at);
                    if (!seenPostIds.has(key)) {
                      seenPostIds.add(key);
                      uniqueJobs.push({ ...j, _groupKey: key });
                    } else {
                      const existing = uniqueJobs.find(u => u._groupKey === key);`;

content = content.replace(oldGroup, newGroup);

// 2. Count positions, not groups
const oldCount = `const publishedCount = uniqueJobs.filter(j => j.status === 'published').length;
                const draftsCount = uniqueJobs.filter(j => j.status === 'draft').length;
                const scheduledCount = uniqueJobs.filter(j => j.status === 'scheduled').length;`;

const newCount = `const publishedCount = filteredAdminJobs.filter(j => j.status === 'published').length;
                const draftsCount = filteredAdminJobs.filter(j => j.status === 'draft').length;
                const scheduledCount = filteredAdminJobs.filter(j => j.status === 'scheduled').length;`;

content = content.replace(oldCount, newCount);

fs.writeFileSync('app/admin/activity/page.tsx', content);
console.log("Success updating activity page logic");