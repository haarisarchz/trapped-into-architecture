const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /let rRole = "";\s*let rDesc = s\.job_description \|\| "";\s*if \(rDesc\.startsWith\("\*\*Job Role:\*\*"\)\) \{\s*const lines = rDesc\.split\("\\n\\n"\);\s*if \(lines\.length > 1\) \{\s*rRole = lines\[0\]\.replace\("\*\*Job Role:\*\*", ""\)\.trim\(\);\s*rDesc = lines\.slice\(1\)\.join\("\\n\\n"\);\s*\}\s*\}/s;

const replacement = `let rRole = "";
           let rDesc = s.job_description || "";`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success with regex parsing removal");
} else {
  console.log("Regex not found");
}