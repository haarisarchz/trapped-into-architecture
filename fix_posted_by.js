const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// The Posted By TD is identifiable by looking for the exact pattern (normalize endings)
// Find the start of the Posted By TD and replace it
const searchStr = '{job.profiles?.display_name || job.profiles?.full_name || job.profiles?.username || "Admin"}';

const replacement = `{(() => {
                          if (!job.profiles) return '—';
                          const myRole = (loggedProfile?.role || '').toLowerCase().replace(/[\\s_]+/g, '');
                          if (myRole === 'ceo') {
                            return job.profiles.display_name || job.profiles.full_name || job.profiles.username || 'Admin';
                          }
                          if (loggedProfile?.id === job.author_id) {
                            return job.profiles.display_name || job.profiles.full_name || job.profiles.username || 'Admin';
                          }
                          const pRole = (job.profiles.role || '').toLowerCase().replace(/[\\s_]+/g, '');
                          if (pRole === 'ceo') return 'CEO';
                          if (pRole === 'superadmin') return 'Super Admin';
                          return 'Admin';
                        })()}`;

code = code.replace(searchStr, replacement);

fs.writeFileSync('app/admin/jobs/page.tsx', code);

const result = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
const hasFix = result.includes("myRole === 'ceo'");
console.log('Posted By privacy fix applied:', hasFix);
