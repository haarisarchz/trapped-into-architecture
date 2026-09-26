const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/skills: p\.skills \|\| \[\],\s*completed: false/g, 'skills: p.skills || [],\n          skill_input: "",\n          completed: false');

content = content.replace(/skills: ai\.skills \|\| \[\],\s*completed: false/g, 'skills: ai.skills || [],\n          skill_input: "",\n          completed: false');

fs.writeFileSync('app/admin/add-job/page.tsx', content);