const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// Fix 1: missing {!sameRequirements && (
c = c.replace(/<div className="md:col-span-4 mt-2 pt-4 border-t border-gray-100">\\n                             <h4 className="font-bold text-sm mb-3">Position Requirements<\\/h4>/g, '{!sameRequirements && (\\n                          <div className="md:col-span-4 mt-2 pt-4 border-t border-gray-100">\\n                             <h4 className="font-bold text-sm mb-3">Position Requirements</h4>');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed missing sameRequirements wrapper');