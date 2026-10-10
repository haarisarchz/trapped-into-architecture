const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const match = content.match(/function AdminActionMenu[\s\S]*?return \([\s\S]*?</div>\s*\);\s*\}/m);
if (match) {
  console.log(match[0]);
} else {
  console.log("Not found.");
}
