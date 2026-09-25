const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace('else if (datePreset === "last_month")', 'else if (datePreset === "previous_month")');
c = c.replace("start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];", "start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];");
c = c.replace("start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];", "start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];");
c = c.replace("start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];", "start = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];");

// And fix the filterByDate to truncate to just the date
c = c.replace('jobDate = job.posted_date || "";', 'jobDate = (job.posted_date || "").split("T")[0].split(" ")[0];');
c = c.replace('jobDate = job.scheduled_date ? job.scheduled_date.split(" ")[0] : "";', 'jobDate = (job.scheduled_date || "").split("T")[0].split(" ")[0];');
c = c.replace('return true; \\n      }', 'jobDate = (job.created_at || "").split("T")[0].split(" ")[0];\\n      }');

fs.writeFileSync('app/admin/activity/page.tsx', c);
