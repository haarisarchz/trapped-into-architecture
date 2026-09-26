const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex1 = /const activeUser = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);\s*const adminPayload/s;
const replacement1 = `const adminPayload`;

const regex2 = /try \{\s*let currentCompanyId = selectedCompanyId;/s;
const replacement2 = `try {
      const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      let currentCompanyId = selectedCompanyId;`;

if (regex1.test(content) && regex2.test(content)) {
  content = content.replace(regex1, replacement1);
  content = content.replace(regex2, replacement2);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success moving activeUser initialization");
} else {
  console.log("Regex not found");
}