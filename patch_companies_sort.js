const fs = require('fs');

let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// Add logic
content = content.replace(
  '      } else if (sortBy === "year_founded") {',
  '      } else if (sortBy === "date_oldest") {\n        data.sort((a, b) => {\n          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;\n          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;\n          return timeA - timeB;\n        });\n      } else if (sortBy === "year_founded") {'
);

// Add option
content = content.replace(
  '<option value="date_added">Latest Added</option>',
  '<option value="date_added">Latest Added</option>\n                    <option value="date_oldest">Oldest Added</option>'
);

fs.writeFileSync('app/companies/page.tsx', content);
console.log("Patched companies sort");
