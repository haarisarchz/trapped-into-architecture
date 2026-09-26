const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace('</div>\n</div>\n</div>\n        </section>', '        </section>');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Removed 3 extra divs');