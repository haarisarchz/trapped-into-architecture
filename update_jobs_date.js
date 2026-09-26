const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

content = content.replace(
  `useState<string>("id")`,
  `useState<string>("posted_date")`
);

content = content.replace(
  `case "posted_date":\n            valA = a.posted_date ? new Date(a.posted_date).getTime() : 0;\n            valB = b.posted_date ? new Date(b.posted_date).getTime() : 0;\n            break;`,
  `case "posted_date":
            valA = a.posted_date ? new Date(a.posted_date).getTime() : Date.now() + (a.id * 1000);
            valB = b.posted_date ? new Date(b.posted_date).getTime() : Date.now() + (b.id * 1000);
            break;`
);

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Date sort fixed");