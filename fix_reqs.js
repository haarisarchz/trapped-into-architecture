const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Qualifications and Skills on one line globally.
const globalReqRegex = /\{\/\* QUALIFICATION \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\s*<div>\s*<label className="block mb-1\.5 text-sm font-medium">\s*Qualifications\s*<\/label>([\s\S]*?)<\/div>\s*<\/div>\s*\{\/\* SKILLS \*\/\}\s*<div className="mt-4">\\n\s*<label className="block mb-1\.5 text-sm font-medium">\\n\s*Skills Required\s*<\/label>/;
c = c.replace(globalReqRegex, (match, p1) => {
    return {/* QUALIFICATION & SKILLS */} <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block mb-1.5 text-sm font-medium"> Qualifications </label></div> <div> <label className="block mb-1.5 text-sm font-medium"> Skills Required </label>;
});

// Since the skills section originally closed a div that I now need to manage, let's fix the closing tags.
// Wait, the skills section had </div></div></div> at the end. I am just putting the Skills Required label inside a new col.
// I will just replace the exact tags.

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed qualifications line');