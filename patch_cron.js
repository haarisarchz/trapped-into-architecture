const fs = require('fs');
let file = fs.readFileSync('app/api/cron/schedule/route.ts', 'utf8');

file = file.replace(
  '.update({ status: "published", updated_at: now })',
  '.update({ status: "published" })'
);

fs.writeFileSync('app/api/cron/schedule/route.ts', file);
console.log("Patched cron update logic");
