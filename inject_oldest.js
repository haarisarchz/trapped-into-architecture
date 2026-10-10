const fs = require('fs');

function injectOldest(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '<option value="salaryHigh">',
    '<option value="oldest">\n  Oldest Posts\n</option>\n<option value="salaryHigh">'
  );
  fs.writeFileSync(file, content);
  console.log("Injected oldest option for desktop in " + file);
}

injectOldest('app/jobs/page.tsx');
injectOldest('app/internships/page.tsx');
