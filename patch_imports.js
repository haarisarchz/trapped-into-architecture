const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app/admin', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<AdminQuickMenu />') && !content.includes('import AdminQuickMenu')) {
       // Insert it right after the last import, or just at the very top after the first few lines
       content = content.replace(
         'import { useRouter }',
         'import AdminQuickMenu from "@/components/admin/AdminQuickMenu";\nimport { useRouter }'
       );
       
       if (!content.includes('import AdminQuickMenu')) {
         content = content.replace(
            'import Navbar',
            'import AdminQuickMenu from "@/components/admin/AdminQuickMenu";\nimport Navbar'
         );
       }
       if (!content.includes('import AdminQuickMenu')) {
           content = 'import AdminQuickMenu from "@/components/admin/AdminQuickMenu";\n' + content;
       }
       fs.writeFileSync(filePath, content);
       console.log("Patched imports for: " + filePath);
    }
  }
});
