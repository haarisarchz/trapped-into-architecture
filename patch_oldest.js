const fs = require('fs');

function addOldestOption(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '<option value="latest">\n  Latest Posted\n</option>',
    '<option value="latest">\n  Latest Posted\n</option>\n<option value="oldest">\n  Oldest Posts\n</option>'
  );
  content = content.replace(
    '<option value="oldest">Older Posts</option>',
    '<option value="oldest">Oldest Posts</option>'
  );
  fs.writeFileSync(file, content);
  console.log("Added oldest option in " + file);
}

addOldestOption('app/jobs/page.tsx');
addOldestOption('app/internships/page.tsx');
