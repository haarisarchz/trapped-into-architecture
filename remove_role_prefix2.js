const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

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

if (content.includes(oldParse)) {
  content = content.replace(oldParse, newParse);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success replacing oldParse");
} else {
  console.log("oldParse not found");
}
