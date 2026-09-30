const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

const regex = /<div>\s*<div className="font-medium text-gray-800 max-w-\[150px\] truncate">\{job\.position\}<\/div>\s*<\/div>\s*<div className="text-right flex items-center gap-4">/s;

const replacement = `<div className="flex-1 min-w-0 pr-4">
                                    <div className="font-medium text-gray-800 truncate">{job.position}</div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">{job.firm_name}</div>
                                  </div>
                                  <div className="text-right flex items-center gap-4 flex-shrink-0">`;

if(content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/activity/page.tsx', content);
  console.log("Updated activity history firm_name display");
} else {
  console.log("Regex not found");
}