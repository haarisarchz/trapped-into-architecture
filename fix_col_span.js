const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/<div className="md:col-span-2">\s*<label className="block mb-1\.5 text-sm font-medium">Job Description/g, '<div className="md:col-span-4">\\n                          <label className="block mb-1.5 text-sm font-medium">Job Description');
c = c.replace(/<div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100">\s*<h4 className="font-bold text-sm mb-3">Position Requirements<\/h4>/g, '<div className="md:col-span-4 mt-2 pt-4 border-t border-gray-100">\\n                             <h4 className="font-bold text-sm mb-3">Position Requirements</h4>');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed md:col-span-4');