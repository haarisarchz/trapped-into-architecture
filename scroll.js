const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldHeader = '<div className="p-8 flex-1 flex flex-col">\n                <h2 className="text-2xl font-black mt-4 tracking-tight">Smart Job</h2>\n                <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest font-bold">Extraction Mode</p>\n\n                <div className="flex-1 flex flex-col justify-center overflow-hidden">';
const newHeader = '<div className="p-4 md:p-8 flex-1 flex flex-col h-full min-h-0">\n                <h2 className="text-2xl font-black mt-1 tracking-tight shrink-0">Smart Job</h2>\n                <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-bold shrink-0">Extraction Mode</p>\n\n                <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pb-4">';
code = code.replace(oldHeader, newHeader);

const btnStr = '<button\n                  disabled={loadingAI === "loading"}';
const btnNew = '</div>\n<div className="shrink-0 pt-4 bg-white border-t border-gray-50 mt-auto z-10">\n<button\n                  disabled={loadingAI === "loading"}';
code = code.replace(btnStr, btnNew);

const closeStr = '"✨ Extract Details"\n                  )}\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n      )}';
const closeNew = '"✨ Extract Details"\n                  )}\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n        </div>\n      )}';
code = code.replace(closeStr, closeNew);

// Replace empty upload label aspect
code = code.replace(
  /<label className=\"border-2 border-dashed border-gray-200 rounded-\[2rem\] p-6 flex flex-col items-center justify-center bg-white hover:border-black cursor-pointer transition-all aspect-\[9\/12\]\">/g,
  '<label className=\"border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center bg-white hover:border-black cursor-pointer transition-all h-[40vh] min-h-[200px] max-h-[350px]\">'
);

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Scroll fixed');
