const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace('        </section>', '</div>\n        </section>');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Added missing div');