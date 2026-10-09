const fs = require('fs');

let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// Remove all instances of "use client" and imports of createPortal from the very top
content = content.replace('import { createPortal } from "react-dom";\n"use client";\n', '');
content = content.replace('"use client";\nimport { createPortal } from "react-dom";\n', '');
content = content.replace('import { createPortal } from "react-dom";\n', '');
content = content.replace('"use client";\n', '');

// Put them back cleanly at the very top
content = '"use client";\nimport { createPortal } from "react-dom";\n' + content;

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Fixed use client position");
