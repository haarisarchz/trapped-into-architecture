const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const startIdx = content.indexOf('function AdminActionMenu');
const endIdx = content.indexOf('function AdminJobsContent');

if (startIdx !== -1 && endIdx !== -1) {
  console.log(content.substring(startIdx, endIdx));
} else {
  console.log("Not found.");
}
