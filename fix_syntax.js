const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /skills: p\.skills \|\| \[\],\s*completed: false\s*\}\)\)\);/s;
const replacement = `skills: p.skills || [],
          completed: false
        };
      }));`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Fixed syntax");
} else {
  console.log("Regex not found");
}