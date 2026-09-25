const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(/else if \\(datePreset === "last_month"\\)/g, 'else if (datePreset === "previous_month")');

c = c.replace(/start = new Date\\(now\.getFullYear\\(\\), now\.getMonth\\(\\) - 3, now\.getDate\\(\\)\\)\.toISOString\\(\\)\.split\\('T'\\)\\[0\\];/g, 'start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split(\\"T\\")[0];');

c = c.replace(/start = new Date\\(now\.getFullYear\\(\\), now\.getMonth\\(\\) - 6, now\.getDate\\(\\)\\)\.toISOString\\(\\)\.split\\('T'\\)\\[0\\];/g, 'start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split(\\"T\\")[0];');

c = c.replace(/start = new Date\\(now\.getFullYear\\(\\) - 1, now\.getMonth\\(\\), now\.getDate\\(\\)\\)\.toISOString\\(\\)\.split\\('T'\\)\\[0\\];/g, 'start = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split(\\"T\\")[0];');

fs.writeFileSync('app/admin/activity/page.tsx', c);
