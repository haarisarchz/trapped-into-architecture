const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

c = c.replace('    if (roleStr !== "ceo") {\n      filteredJobs = filteredJobs.filter((job) =>\n        !job.author_id || job.author_id === callerProfile?.id\n      );\n    }', '// All jobs visible to everyone now based on user request');

fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Done replacement');