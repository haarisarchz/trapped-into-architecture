const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
content = content.replace("Apply Now +'", "Apply Now ↗");
fs.writeFileSync('app/jobs/[id]/page.tsx', content);