const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Restore width
c = c.replace(/<section className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-8">/, '<section className="w-full px-6 lg:px-12 py-8">');

// 2. Position block: change to 4 columns for desktop
c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/, '<div className="grid grid-cols-1 md:grid-cols-4 gap-4">');
c = c.replace(/<div className="md:col-span-2">\s*<label className="block mb-1\.5 text-sm font-medium">Job Description/, '<div className="md:col-span-4">\\n                          <label className="block mb-1.5 text-sm font-medium">Job Description');
c = c.replace(/<div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">\s*<h4 className="font-bold text-sm mb-3">Position Requirements<\/h4>/, '<div className="md:col-span-4 mt-4 pt-4 border-t border-gray-100">\\n                             <h4 className="font-bold text-sm mb-3">Position Requirements</h4>');

// 3. Company Profile block: change to 3 or 4 columns
// Let's find Company Profile grid.
// It has: <div className="grid md:grid-cols-2 gap-4"> after {/* Logo + Website */} NO wait, where is it?
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Restored width and fixed positions grid');