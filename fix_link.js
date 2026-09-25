const fs = require('fs');
let c = fs.readFileSync('app/admin/page.tsx', 'utf-8');

c = c.replace(/<Link\s+href="https:\/\/www\.trappedintoarchitecture\.com\/" target="_blank" rel="noopener noreferrer"\s+className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition text-center block w-full"\s*>\s*View Website\s*<\/Link>/m, 
  \<a
          href="https://www.trappedintoarchitecture.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition text-center block w-full"
        >
          View Website
        </a>\);

fs.writeFileSync('app/admin/page.tsx', c);
