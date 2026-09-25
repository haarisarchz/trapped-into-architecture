const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

const regex = /let query = supabase\s*\.from\("admin_jobs"\)\s*\.select\("\*"\);/;
if(c.match(regex)) {
   console.log('admin_jobs found in jobs/page');
} else {
   console.log('not found');
}