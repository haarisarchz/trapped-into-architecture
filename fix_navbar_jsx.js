const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

content = content.replace(
  `{authTab !== "success" && (
              <div className="flex border-b mb-6">`,
  `<div className="flex border-b mb-6" style={{ display: authTab === 'success' ? 'none' : 'flex' }}>`
);

content = content.replace(
  `            )}
            
  {/* LOGIN */}`,
  `  {/* LOGIN */}`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Fixed Navbar jsx syntax");