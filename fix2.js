const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
c = c.replace(/setPosition\(data\.position \|\| ""\);/g, "setPositions([{ ...positions[0], position: data.position || '' }]);");
c = c.replace(/position\.toLowerCase/g, "positions[0]?.position.toLowerCase");
c = c.replace(/value=\{position\}/g, "value={positions[0]?.position || ''}");
c = c.replace(/\{position \|\| "---"\}/g, "{positions[0]?.position || '---'}");
c = c.replace(/setPosition\(ai\.position \|\| ai\.job_title \|\| ""\);/g, "setPositions([{ ...positions[0], position: ai.position || ai.job_title || '' }]);");
fs.writeFileSync('app/admin/add-job/page.tsx', c);
