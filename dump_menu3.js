const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const startIdx = content.indexOf('function AdminActionMenu');
const endIdx = content.indexOf('function AdminJobsContent');

if (startIdx !== -1 && endIdx !== -1) {
  const code = content.substring(startIdx, endIdx);
  const lines = code.split('\n');
  console.log(lines.slice(0, 50).join('\n'));
  console.log("---");
  console.log(lines.slice(50, 100).join('\n'));
  console.log("---");
  console.log(lines.slice(100).join('\n'));
} else {
  console.log("Not found.");
}
