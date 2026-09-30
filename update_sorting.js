const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const targetLogic = `        const dateA = new Date(a.posted_date || 0).getTime();
        const dateB = new Date(b.posted_date || 0).getTime();`;

const replacementLogic = `        const dateA = new Date(a.posted_date || 0).getTime();
        const dateB = new Date(b.posted_date || 0).getTime();
        
        // Exact time fallback using created_at for accurate chronological sort
        const createdA = new Date(a.created_at || a.updated_at || a.posted_date || 0).getTime();
        const createdB = new Date(b.created_at || b.updated_at || b.posted_date || 0).getTime();`;

content = content.replace(targetLogic, replacementLogic);

const oldReturn = `return dateB - dateA;`;
// Wait, oldReturn appears a few times!
// We only want to replace the final `return dateB - dateA;` and the tiebreaker in salary/expiry.

content = content.replace(/return dateB - dateA;/g, 'return dateB !== dateA ? dateB - dateA : createdB - createdA;');

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Updated sorting logic");