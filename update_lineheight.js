const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

content = content.replace('className="text-gray-700 leading-8 whitespace-pre-line"', 'className="text-gray-700 leading-relaxed whitespace-pre-line"');

fs.writeFileSync('app/jobs/[id]/page.tsx', content);