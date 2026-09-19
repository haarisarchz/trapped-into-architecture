const fs = require('fs');
let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// The file currently has:
//           </table>
//         </div>
//       </section>

// I just need to make sure the div tags balance!
// There is: 
// <div className="bg-white rounded-3xl shadow border overflow-hidden">
//   <div className="overflow-x-auto">
//     <table ...>
// 
// And the end should be:
//     </table>
//   </div>
// </div>

// I'll just restore the original and do it properly.
const original = code
  .replace('<div className="overflow-x-auto">\\n          <table className="w-full text-left min-w-[600px]">', '<table className="w-full text-left">')
  .replace('</table>\\n          </div>\\n        </div>\\n      </section>', '</table>\\n        </div>\\n      </section>');
fs.writeFileSync('app/admin/companies/page.tsx', original);

// Then apply it properly.
let newCode = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');
newCode = newCode.replace(
  '<table className="w-full text-left">',
  '<div className="overflow-x-auto">\\n          <table className="w-full text-left min-w-[600px]">'
);
newCode = newCode.replace(
  '<\\/table>\\n\\s*<\\/div>',
  '</table>\\n          </div>\\n        </div>'
);
fs.writeFileSync('app/admin/companies/page.tsx', newCode);
