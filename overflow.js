const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    if (showSmartUpload) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [showSmartUpload]);
`;

code = code.replace('useEffect(() => {\n    if (!router) return;', effectCode + '\n  useEffect(() => {\n    if (!router) return;');
fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Added overflow handling');
