const fs = require("fs");
let code = fs.readFileSync("app/jobs/page.tsx", "utf8");
const fullRegex = /\{jobs\s*\.filter\([\s\S]*?\.map\(\(job, index\) => \([\s\S]*?<JobCard[\s\S]*?\/>\s*\)\)}/;
const match = code.match(fullRegex);
if(match) {
  let inner = match[0].substring(1, match[0].length - 1);
  let newCode = `{(() => { const filtered = ${inner}; return filtered.length > 0 ? filtered : <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500"><p className="text-xl font-semibold">No jobs available at the moment.</p><p className="mt-2 text-sm">Try adjusting your filters or search query.</p></div>; })()}`;
  code = code.replace(match[0], newCode);
  fs.writeFileSync("app/jobs/page.tsx", code);
  console.log("replaced");
}

