const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const startStr = 'const handlePublishJob = async (';
const endStr = 'const handleSmartExtraction = async () => {';
const startIndex = c.indexOf(startStr);
const endIndex = c.indexOf(endStr);
if (startIndex > -1 && endIndex > startIndex) {
  const newFunc = fs.readFileSync('new_func.txt', 'utf-8');
  c = c.substring(0, startIndex) + newFunc + '\n\n' + c.substring(endIndex);
  fs.writeFileSync('app/admin/add-job/page.tsx', c);
  console.log('Success');
} else {
  console.log('Not found', startIndex, endIndex);
}

