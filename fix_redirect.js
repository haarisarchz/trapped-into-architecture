const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace('router.push("/admin/activity");', 'router.push("/admin/jobs");');

fs.writeFileSync('app/admin/add-job/page.tsx', content);