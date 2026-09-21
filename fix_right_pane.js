const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /<div className="p-8 flex-1 flex flex-col">([\s\S]*?)<button\s+disabled={loadingAI === "loading"}[\s\S]*?onClick={async \(\) => {/g;

code = code.replace(
  /<div className="p-8 flex-1 flex flex-col">\s*<h2 className="text-2xl font-black mt-4 tracking-tight">Smart Job<\/h2>\s*<p className="text-gray-400 text-xs mb-6 uppercase tracking-widest font-bold">Extraction Mode<\/p>\s*<div className="flex-1 flex flex-col justify-center overflow-hidden">/g,
  '<div className="p-4 md:p-8 flex-1 flex flex-col h-full min-h-0">\n<h2 className="text-2xl font-black mt-1 tracking-tight shrink-0">Smart Job</h2>\n<p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-bold shrink-0">Extraction Mode</p>\n<div className="flex-1 flex flex-col overflow-y-auto min-h-0 pb-4">'
);

code = code.replace(
  /<\/div>\s*<button\s*disabled={loadingAI === "loading"}/g,
  '</div>\n<div className="shrink-0 pt-4 bg-white border-t border-gray-50 mt-auto">\n<button\ndisabled={loadingAI === "loading"}'
);

code = code.replace(
  /<\/div>\s*\) : \(\s*"? Extract Details"\s*\)\s*}<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g,
  '</div>\n) : (\n"? Extract Details"\n)}\n</button>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>'
);

// We should fix the button closing tag because the previous replace wrapped it in a div
const buttonRegex = /"? Extract Details"\s*\)\s*}<\/button>/g;
code = code.replace(buttonRegex, '"? Extract Details"\n  )}\n</button>\n</div>');

fs.writeFileSync('app/admin/add-job/page.tsx', code);
