const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/md:text-gray-500/g, 'md:text-black');
content = content.replace(/text-gray-800/g, 'text-black');
content = content.replace(/text-gray-700 md:text-gray-400/g, 'text-black md:text-black');
content = content.replace(/text-gray-700/g, 'text-black');
content = content.replace(/text-gray-400/g, 'text-black');

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated colors");