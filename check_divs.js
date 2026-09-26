const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

let divOpen = (c.match(/<div(\s|>)/g) || []).length;
let divClose = (c.match(/<\/div>/g) || []).length;
console.log(`Open: ${divOpen}, Close: ${divClose}, Difference: ${divOpen - divClose}`);