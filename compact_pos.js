const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/className="mt-6 mb-6"/g, 'className="mt-4 mb-4"');
c = c.replace(/className="flex justify-between items-end mb-6"/g, 'className="flex justify-between items-end mb-4"');
c = c.replace(/className="space-y-6"/g, 'className="space-y-4"');
c = c.replace(/className="border border-gray-200 p-6 rounded-xl bg-white shadow-sm relative text-black"/g, 'className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm relative text-black"');
c = c.replace(/className="absolute top-6 right-6 text-red-500 text-sm font-bold hover:underline"/g, 'className="absolute top-4 right-4 text-red-500 text-sm font-bold hover:underline"');
c = c.replace(/px-4 py-3 bg-white text-black"/g, 'px-3 py-2 text-sm bg-white text-black"'); // Just in case there are lingering inputs

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed Positions UI paddings');