const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// The injected block starts with:
// import { generateJobUrl } from "@/utils/jobUrl";
// function AdminActionMenu
content = content.replace('import { generateJobUrl } from "@/utils/jobUrl";\n\nfunction AdminActionMenu', 'function AdminActionMenu');
content = content.replace('import { generateJobUrl } from "@/utils/jobUrl";\r\n\r\nfunction AdminActionMenu', 'function AdminActionMenu');
content = content.replace('import { generateJobUrl } from "@/utils/jobUrl";\nfunction AdminActionMenu', 'function AdminActionMenu');

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Duplicate import removed.");
