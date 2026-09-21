const fs = require('fs');
const code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('uploadMode === \'url\''));
console.log(lines.slice(idx, idx + 20).join('\n'));
