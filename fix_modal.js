const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Left pane preview
code = code.replace(/bg-white rounded-\[32px\] w-\[500px\] h-\[780px\] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500/g, 'bg-white rounded-[32px] w-full max-w-[500px] h-[85vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500');

// Right pane upload
code = code.replace(/bg-white rounded-\[32px\] w-\[500px\] h-\[780px\] shadow-2xl flex flex-col relative overflow-hidden border border-white\/20/g, 'bg-white rounded-[32px] w-full max-w-[500px] h-[85vh] max-h-[780px] shadow-2xl flex flex-col relative overflow-hidden border border-white/20');

// Container
code = code.replace(/<div className="flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-500">/g, '<div className="flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-500 w-full max-w-[1050px] mx-auto p-2">');

fs.writeFileSync('app/admin/add-job/page.tsx', code);
