const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex1 = /job_description: pos\.description,/g;
const replacement1 = `job_description: pos.role ? \`**Job Role:** \${pos.role}\\n\\n\${pos.description}\` : pos.description,`;

const regex2 = /let rRole = "";\s*let rDesc = s\.job_description \|\| "";\s*return \{/s;
const replacement2 = `let rRole = "";
           let rDesc = s.job_description || "";
           if (rDesc.startsWith("**Job Role:**")) {
             const lines = rDesc.split("\\n\\n");
             if (lines.length > 1) {
               rRole = lines[0].replace("**Job Role:**", "").trim();
               rDesc = lines.slice(1).join("\\n\\n");
             }
           }
           return {`;

content = content.replace(regex1, replacement1);
content = content.replace(regex2, replacement2);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Success updating add-job");