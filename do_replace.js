const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const replacement = fs.readFileSync('ui_payload.txt', 'utf-8');

const regexStr = '<div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6\">[\\\\s\\\\S]*?<textarea[\\\\s\\\\S]*?\\\\/>\\\\s*<\\\\/div>\\\\s*<\\\\/div>';
const rgx = new RegExp(regexStr);

c = c.replace(rgx, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done');