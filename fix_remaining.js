const fs = require("fs");
let content = fs.readFileSync("app/admin/add-job/page.tsx", "utf-8");

content = content.replace(/positions\[0\]\?\.position \? position\.toLowerCase\(\)/g, "positions[0]?.position ? positions[0].position.toLowerCase()");
content = content.replace(/\{position \|\| "---"\}/g, "{positions[0]?.position || \\"---\\"}");

content = content.replace(/\} else \{\r?\n\s*if \(currentUser\) \{\r?\n\s*\(jobPayload as any\)\.author_id = currentUser\.id;\r?\n\s*\}\r?\n\s*const res = await supabase\.from\("jobs"\)\.insert\(\[jobPayload\]\)\.select\(\)\.single\(\)\.select\(\)\.single\(\);\r?\n\s*jobData = res\.data;\r?\n\s*jobError = res\.error;\r?\n\s*if \(jobData && jobData\.id\) \{\r?\n\s*setJobId\(jobData\.id\);\r?\n\s*window\.history\.replaceState\(null, "", \`\/admin\/add-job\?id=\$\{jobData\.id\}\`\);\r?\n\s*\}\r?\n\s*\}/m, "");

fs.writeFileSync("app/admin/add-job/page.tsx", content);

