const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regexEnd = /([ \t]*)\}\)\}\n([ \t]*)<\/div>\n([ \t]*)<div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">/;
const replacementEnd = `$1})}` + "\n" + `$2</div>\n$2</>\n$2)}\n$3<div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`;

content = content.replace(regexEnd, replacementEnd);
fs.writeFileSync('app/admin/add-job/page.tsx', content);