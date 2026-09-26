const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Reduce h2 margins
const h2Regex = /<h2 className="text-lg font-bold mb-2 text-gray-900">/g;
const h2Replace = `<h2 className="text-base font-bold mb-1 text-gray-900">`;
content = content.replace(h2Regex, h2Replace);

// Reduce button padding
const btn1Regex = /px-10 py-3\.5 rounded-xl text-lg/g;
const btn1Replace = `px-8 py-3 rounded-xl text-base`;
content = content.replace(btn1Regex, btn1Replace);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Success updating extra margins");