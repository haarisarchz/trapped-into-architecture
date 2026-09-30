const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

content = content.replace(
  'const dateA = new Date(a.posted_date || 0).getTime();',
  `const dateA = new Date(a.posted_date || 0).getTime();
      const createdA = new Date(a.created_at || a.updated_at || a.posted_date || 0).getTime();`
);

content = content.replace(
  'const dateB = new Date(b.posted_date || 0).getTime();',
  `const dateB = new Date(b.posted_date || 0).getTime();
      const createdB = new Date(b.created_at || b.updated_at || b.posted_date || 0).getTime();`
);

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Fixed missing variables");