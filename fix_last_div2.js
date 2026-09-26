const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
c = c.replace('</div>\n        </section>', '</div>\n</div>\n        </section>');
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Added second missing div');