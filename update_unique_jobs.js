const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Replace the uniqueJobs merging logic and calculations with jobsList mapping
const logicRegex = /const uniqueJobs = \[\];.*?earnings \+= uJob\.creditedAmount;\s*\n\s*\}\);/s;

const newLogic = `const draftsCount = filteredAdminJobs.filter(j => j.status === 'draft').length;
                  const scheduledCount = filteredAdminJobs.filter(j => j.status === 'scheduled').length;
                  const publishedCount = filteredAdminJobs.filter(j => j.status === 'published').length;
                  
                  const price = admin.rupees_per_post ?? rupeesPerPost ?? 10;
                  let earnings = 0;

                  const jobsList = filteredAdminJobs.map(job => {
                    const groupJobs = filteredAdminJobs.filter(fj => {
                      const fjTime = Math.floor(new Date(fj.created_at).getTime() / 10000);
                      const fjKey = fj.admin_post_id || (fj.firm_name + "_" + fjTime);
                      const uJobTime = Math.floor(new Date(job.created_at).getTime() / 10000);
                      const uJobKey = job.admin_post_id || (job.firm_name + "_" + uJobTime);
                      return fjKey === uJobKey;
                    });
                    
                    const pubCount = groupJobs.filter(j => j.status === 'published').length;
                    let creditedAmount = 0;
                    
                    if (job.status === 'published') {
                      if (pubCount === 1) {
                        creditedAmount = price;
                      } else if (pubCount > 1) {
                        creditedAmount = price * 0.5;
                      }
                      earnings += creditedAmount;
                    }
                    
                    return { ...job, creditedAmount };
                  });`;

if(content.match(logicRegex)) {
  content = content.replace(logicRegex, newLogic);
} else {
  console.log("Logic regex failed");
}

// 2. Replace uniqueJobs with jobsList in the JSX
content = content.replace(/uniqueJobs\.length/g, "jobsList.length");
content = content.replace(/uniqueJobs\.sort/g, "jobsList.sort");

// 3. Remove "Posted By: displayName" block
const postedByRegex = /<div className="text-xs text-gray-800 md:text-gray-500 mt-1">\s*\{\(\(\) => \{.*?\}\)\(\)\}\s*<\/div>/s;
if(content.match(postedByRegex)) {
  content = content.replace(postedByRegex, "");
} else {
  console.log("Posted By regex failed");
}

fs.writeFileSync('app/admin/activity/page.tsx', content);
console.log("Updated Activity logic successfully");