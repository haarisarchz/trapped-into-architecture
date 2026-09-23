const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

code = code.replace(
  '<aside className="hidden md:flex md:w-72 bg-black text-white min-h-screen p-6 flex-col justify-between">',
  '<aside className="flex w-full md:w-72 bg-black text-white md:min-h-screen p-6 flex-col justify-between gap-10 md:gap-0">'
);

fs.writeFileSync('app/admin/page.tsx', code);
console.log('Mobile sidebar fix applied');
