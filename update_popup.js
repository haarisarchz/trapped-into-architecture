const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const targetStr = `{showSmartUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000000] p-4 backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-500 w-full max-w-[1050px] mx-auto p-2">`;

const replacementStr = `{showSmartUpload && (
        <div className="fixed inset-0 bg-black/70 overflow-y-auto z-[1000000] p-4 md:p-8 backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 transition-all duration-500 w-full max-w-[1050px] mx-auto min-h-full py-8 md:py-0">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  
  // Let's also fix the height constraint on mobile. 
  // Change h-[85vh] to h-[75vh] md:h-[85vh] so it's a bit smaller on mobile, or just let it be.
  content = content.replace(/h-\[85vh\] max-h-\[780px\]/g, "h-[85vh] md:h-[85vh] max-h-[780px]");
  
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Updated Smart Job Popup for scrollability");
} else {
  console.log("Target string not found in app/admin/add-job/page.tsx");
}