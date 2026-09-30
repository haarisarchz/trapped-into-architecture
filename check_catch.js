const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const regex = /catch \(err: any\) \{([^}]+)\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log("Catch block:", match[1]);
}