const fs = require('fs');

const files = [
  'app/admin/jobs/page.tsx',
  'app/admin/companies/page.tsx',
  'app/admin/analytics/page.tsx',
  'app/admin/add-job/page.tsx',
  'app/admin/contact/page.tsx',
  'app/admin/users/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    const match = code.match(/return \(\s*(?:<main|<div)[\s\S]*?(?:<div|<section|<header)[\s\S]*?(?:<h1|<h2)/i);
    console.log('--- ' + f + ' ---');
    if (match) console.log(match[0].replace(/\n\s*/g, ' '));
  }
});
