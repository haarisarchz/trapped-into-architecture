const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// replace label
code = code.replace(
  /<label className=\"flex flex-col items-center justify-center w-full aspect-\[9\/16\] border-2 border-dashed border-gray-300 rounded-\[2rem\] cursor-pointer bg-gray-50 hover:bg-gray-100 transition shadow-inner\">/g,
  '<label className=\"flex flex-col items-center justify-center w-full h-[40vh] min-h-[200px] max-h-[350px] border-2 border-dashed border-gray-300 rounded-[2rem] cursor-pointer bg-gray-50 hover:bg-gray-100 transition shadow-inner\">'
);

// replace div
code = code.replace(
  /<div className=\"relative w-full aspect-\[9\/16\] rounded-\[2rem\] overflow-hidden border bg-white flex items-center justify-center shadow-inner\">/g,
  '<div className=\"relative w-full h-[40vh] min-h-[200px] max-h-[350px] rounded-[2rem] overflow-hidden border bg-gray-100 flex items-center justify-center shadow-inner\">'
);

// update img tag to fill container but use object-contain (already does)
code = code.replace(
  /className=\"max-w-full max-h-full object-contain p-2\"/g,
  'className=\"w-full h-full object-contain p-2\"'
);

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Fixed aspect ratio issue!');
