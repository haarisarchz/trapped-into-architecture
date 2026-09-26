const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm mb-6"/g, 'className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm mb-4"');
c = c.replace(/className="mt-6"\s*>\s*<label className="block mb-1.5 text-sm font-medium">\s*Skills Required/g, 'className="mt-4">\\n                <label className="block mb-1.5 text-sm font-medium">\\n                  Skills Required');
c = c.replace(/className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"/g, 'className="bg-black text-white px-3 py-1 text-sm rounded-full flex items-center gap-2"');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed Requirements padding');