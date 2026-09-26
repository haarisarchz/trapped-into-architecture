const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Constrain the form width
c = c.replace(/<section className="w-full px-6 lg:px-12 py-10">/, '<section className="w-full max-w-5xl mx-auto px-6 lg:px-12 py-8">');

// 2. Reduce gap between sections (they are wrapped in empty lines, but often just <div>)
// We have <h2 className="text-xl font-bold mb-6">
c = c.replace(/<h2 className="text-xl font-bold mb-6">/g, '<h2 className="text-lg font-bold mb-3">');

// We have <h2 className="text-4xl font-bold"> -> Make it <h2 className="text-3xl font-bold">
c = c.replace(/<h2 className="text-4xl font-bold">/g, '<h2 className="text-3xl font-bold">');
c = c.replace(/<h1 className="text-4xl font-bold">/g, '<h1 className="text-3xl font-bold">');

// 3. Reduce input paddings and rounded corners for a tighter look
// px-4 py-3 -> px-3 py-2 text-sm
c = c.replace(/px-4 py-3/g, 'px-3 py-2.5 text-sm');
// ounded-2xl -> ounded-xl
c = c.replace(/rounded-2xl/g, 'rounded-xl');

// 4. Reduce gap-6 (if any missed) to gap-4
c = c.replace(/gap-6/g, 'gap-4');

// 5. Reduce mb-6 on labels to mb-1 (block mb-2 font-medium)
c = c.replace(/block mb-2 font-medium/g, 'block mb-1.5 text-sm font-medium');

// 6. Fix mb-6 generally if it's too much (e.g., separating sections)
// Look for </div>\n\n            {/* LOCATION */}
// Let's replace the hardcoded padding margins.

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('UI compacted');