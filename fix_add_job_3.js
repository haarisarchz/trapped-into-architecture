const fs = require('fs');
let c = fs.readFileSync('temp_add_job.tsx', 'utf-8');

const positionBlockRegex = /\s*\{\/\* POSITION \*\/\}\s*<div>\s*<label className="block mb-2 font-medium">\s*Position <span className="text-red-500 text-xl font-bold">\*<\/span>\s*<\/label>[\s\S]*?<\/datalist>\s*<\/div>\s*<\/div>/;
c = c.replace(positionBlockRegex, '\n</div>\n');

const oldExpRegex = /\s*\{\/\* EXPERIENCE \*\/\}\s*<div className="mb-6">[\s\S]*?<\/div>\s*<\/div>/;
c = c.replace(oldExpRegex, '');

let positionsJSX = fs.readFileSync('positions_ui.txt', 'utf-8');
c = c.replace(/\{\/\* LOCATION \*\/\}/, positionsJSX + '\n              {/* LOCATION */}');

fs.writeFileSync('temp_add_job.tsx', c);