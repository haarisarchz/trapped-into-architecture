const fs = require('fs');

function patchHeader(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '<div className="flex items-center justify-between mb-6">',
    '<div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 -mx-6 -mt-6 px-6 py-6 border-b border-gray-100">'
  );
  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}

patchHeader('app/jobs/page.tsx');
patchHeader('app/internships/page.tsx');
patchHeader('app/companies/page.tsx');
