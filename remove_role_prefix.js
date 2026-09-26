const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Remove the prepend logic
content = content.replace(/job_description: pos\.role \? `\*\*Job Role:\*\* \$\{pos\.role\}\\n\\n\$\{pos\.description\}` : pos\.description,/g, 'job_description: pos.description,');

// Remove the parse-on-load logic
const oldParse = `           let rRole = "";
           let rDesc = s.job_description || "";
           if (rDesc.startsWith("**Job Role:**")) {
             const lines = rDesc.split("\\n\\n");
             if (lines.length > 1) {
               rRole = lines[0].replace("**Job Role:**", "").trim();
               rDesc = lines.slice(1).join("\\n\\n");
             }
           }
           return {
             id: s.id,
             position: s.position || "",
             role: rRole,`;

const newParse = `           let rRole = "";
           let rDesc = s.job_description || "";
           return {
             id: s.id,
             position: s.position || "",
             role: rRole,`;

content = content.replace(oldParse, newParse);

fs.writeFileSync('app/admin/add-job/page.tsx', content);