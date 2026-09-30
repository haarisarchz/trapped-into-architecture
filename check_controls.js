const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');
const mobileStart = content.indexOf('{/* MOBILE CONTROLS */}');
const mobileEnd = content.indexOf('{/* VIEW + SORT BAR */}');
const viewStart = content.indexOf('{/* VIEW + SORT BAR */}');
const viewEnd = content.indexOf('{/* ACTIVE FILTERS */}');

console.log("--- MOBILE ---");
console.log(content.substring(mobileStart, mobileEnd));
console.log("--- DESKTOP ---");
console.log(content.substring(viewStart, viewEnd));