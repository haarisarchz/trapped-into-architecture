const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(/\/\/ Drafts have no date stored in our DB right now, so we just include them\r?\n\s*return true;/g, 'jobDate = (job.created_at || "").split("T")[0].split(" ")[0];');

fs.writeFileSync('app/admin/activity/page.tsx', c);
