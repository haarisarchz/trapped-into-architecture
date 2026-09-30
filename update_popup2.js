const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/<div className="fixed inset-0 bg-black\/70 flex items-center justify-center z-\[1000000\] p-4 backdrop-blur-md">\s*<div className="flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-500 w-full max-w-\[1050px\] mx-auto p-2">/, 
`<div className="fixed inset-0 bg-black/70 overflow-y-auto z-[1000000] p-4 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 transition-all duration-500 w-full max-w-[1050px] mx-auto min-h-[100%] py-10 md:py-8">`);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated with regex");