const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

const calcRegex = /const publishedCount = filteredAdminJobs\.filter\(j => j\.status === 'published'\)\.length;\s*const draftsCount = filteredAdminJobs\.filter\(j => j\.status === 'draft'\)\.length;\s*const scheduledCount = filteredAdminJobs\.filter\(j => j\.status === 'scheduled'\)\.length;\s*const earnings = publishedCount \* \(admin\.rupees_per_post \|\| rupeesPerPost \|\| 10\);/s;

const calcReplacement = `const draftsCount = filteredAdminJobs.filter(j => j.status === 'draft').length;
                  const scheduledCount = filteredAdminJobs.filter(j => j.status === 'scheduled').length;
                  const publishedCount = filteredAdminJobs.filter(j => j.status === 'published').length;
                  
                  const price = admin.rupees_per_post ?? rupeesPerPost ?? 10;
                  let earnings = 0;
                  
                  // Calculate earnings based on single vs multiple logic
                  uniqueJobs.forEach(uJob => {
                    const groupJobs = filteredAdminJobs.filter(fj => (fj.admin_post_id || fj.id) === (uJob.admin_post_id || uJob.id));
                    const pubCount = groupJobs.filter(j => j.status === 'published').length;
                    uJob.creditedAmount = 0;
                    if (pubCount === 1) {
                      uJob.creditedAmount = price;
                    } else if (pubCount > 1) {
                      uJob.creditedAmount = pubCount * (price * 0.5);
                    }
                    earnings += uJob.creditedAmount;
                  });`;

content = content.replace(calcRegex, calcReplacement);

const historyRowRegex = /<div className="text-right">\s*<div className=\{\`text-xs px-2 py-1 rounded-full capitalize inline-block mb-1[^>]+>\s*\{job\.status === 'published' \? 'Published' : job\.status === 'draft' \? 'Saved Draft' : 'Scheduled'\}\s*<\/div>\s*<div className="text-gray-700 md:text-gray-400 text-xs">\s*\{job\.posted_date \|\| job\.created_at \? new Date\(job\.posted_date \|\| job\.created_at\)\.toLocaleDateString\('en-GB', \{\s*day: '2-digit', month: 'short', year: 'numeric'\s*\}\) : ''\}\s*<\/div>\s*<\/div>/s;

const historyRowReplacement = `<div className="text-right flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                      <div className={\`text-xs px-2 py-1 rounded-full capitalize inline-block mb-1 \${job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}\`}>
                                        {job.status === 'published' ? 'Published' : job.status === 'draft' ? 'Saved Draft' : 'Scheduled'}
                                      </div>
                                      <div className="text-gray-700 md:text-gray-400 text-xs">
                                        {job.posted_date || job.created_at ? new Date(job.posted_date || job.created_at).toLocaleDateString('en-GB', {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                        }) : ''}
                                      </div>
                                    </div>
                                    <div className="w-16 text-right">
                                      {job.creditedAmount > 0 ? (
                                        <div className="font-bold text-green-600 text-sm">₹{job.creditedAmount}</div>
                                      ) : (
                                        <div className="text-gray-400 text-xs">-</div>
                                      )}
                                    </div>
                                  </div>`;

content = content.replace(historyRowRegex, historyRowReplacement);

const headerRegex = /<h4 className="font-semibold text-gray-900 mb-4">Activity History<\/h4>/;
const headerReplacement = `<div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900">Activity History</h4>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-right pr-1">Credit</div>
                          </div>`;

content = content.replace(headerRegex, headerReplacement);

fs.writeFileSync('app/admin/activity/page.tsx', content);
console.log("Updated admin activity logic");