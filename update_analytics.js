const fs = require('fs');
let content = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

const target = `<section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10">
          
          {/* HEADER & CONTROLS */}`;

const replacement = `<section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="mb-6">
            <a href="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition group">
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
            </a>
          </div>
          {/* HEADER & CONTROLS */}`;

content = content.replace(target, replacement);
fs.writeFileSync('app/admin/analytics/page.tsx', content);
console.log("Added Back to Dashboard button");