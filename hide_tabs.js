const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// Hide tab switcher if success
content = content.replace(
  `<div className="flex border-b mb-6">`,
  `{authTab !== "success" && (
              <div className="flex border-b mb-6">`
);

content = content.replace(
  `{/* LOGIN */}`,
  `            )}
            
  {/* LOGIN */}`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Hid tab switcher on success");