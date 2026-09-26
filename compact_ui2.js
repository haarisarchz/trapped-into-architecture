const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/<section className="w-full px-6 lg:px-12 py-10">/, '<section className="w-full max-w-5xl mx-auto px-6 lg:px-12 py-8">');
c = c.replace(/<h2 className="text-xl font-bold mb-6">/g, '<h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">');
c = c.replace(/<h2 className="text-4xl font-bold">/g, '<h2 className="text-3xl font-bold">');
c = c.replace(/<h1 className="text-4xl font-bold">/g, '<h1 className="text-3xl font-bold">');
c = c.replace(/px-4 py-3/g, 'px-3 py-2.5 text-sm');
c = c.replace(/rounded-2xl/g, 'rounded-xl');
c = c.replace(/gap-6/g, 'gap-4');
c = c.replace(/block mb-2 font-medium/g, 'block mb-1.5 text-sm font-medium');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('UI compacted');