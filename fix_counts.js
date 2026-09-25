const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(
  /const publishedCount = filteredAdminJobs\.filter\\(j => j\.status === 'published'\\)\.length;\r?\n\s*const draftsCount = filteredAdminJobs\.filter\\(j => j\.status === 'draft'\\)\.length;\r?\n\s*const scheduledCount = filteredAdminJobs\.filter\\(j => j\.status === 'scheduled'\\)\.length;/g,
  \const uniqueJobs = [];
                const seenPostIds = new Set();
                for (const j of filteredAdminJobs) {
                  const key = j.admin_post_id || j.id;
                  if (!seenPostIds.has(key)) {
                    seenPostIds.add(key);
                    uniqueJobs.push({ ...j });
                  } else {
                    const existing = uniqueJobs.find(u => (u.admin_post_id || u.id) === key);
                    if (existing && !existing.position.includes(j.position)) {
                       existing.position += \, \\;
                    }
                  }
                }
                
                const publishedCount = uniqueJobs.filter(j => j.status === 'published').length;
                const draftsCount = uniqueJobs.filter(j => j.status === 'draft').length;
                const scheduledCount = uniqueJobs.filter(j => j.status === 'scheduled').length;\
);

c = c.replace(/filteredAdminJobs\.sort/g, 'uniqueJobs.sort');
c = c.replace(/\{filteredAdminJobs\.length > 0 \?/g, '{uniqueJobs.length > 0 ?');

fs.writeFileSync('app/admin/activity/page.tsx', c);
