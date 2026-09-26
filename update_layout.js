const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /\{\/\* CTA BUTTONS \*\/\}.*?\{\/\* DATES \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>/s;

// We will find the end of the CTA BUTTONS block.
const ctaEndRegex = /<div className="ml-auto flex items-center gap-4">.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s;

// Let's rewrite the layout safely by executing a script.