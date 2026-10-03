const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace(
  /\}\)\.eq\("id", logRecord\.id\);/g,
  '}).eq("job_id", triggerJob.id).eq("platform", platform);'
);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched logRecord usage!");
