const fs = require('fs');

function fixGap(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/lg:top-24 lg:max-h-\[calc\(100vh-6rem\)\]/g, 'lg:top-6 lg:max-h-[calc(100vh-3rem)]');
  fs.writeFileSync(file, content);
  console.log("Fixed gap in " + file);
}

fixGap('app/jobs/page.tsx');
fixGap('app/internships/page.tsx');
fixGap('app/companies/page.tsx');
