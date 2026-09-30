const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  /(\s*\}\)\}\s*<\/div>\s*)(<div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">)/,
  '$1</>\n                            )}\n                            $2'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI end via generic regex");