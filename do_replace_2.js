const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const replacement = fs.readFileSync('ui_payload.txt', 'utf-8');
const target = fs.readFileSync('target_content.txt', 'utf-8');

// just normalize line endings to try and match
const normalize = (str) => str.replace(/\r\n/g, '\n');

const nC = normalize(c);
const nT = normalize(target);

const idx = nC.indexOf(nT);
if (idx > -1) {
    const finalStr = nC.substring(0, idx) + replacement + nC.substring(idx + nT.length);
    fs.writeFileSync('app/admin/add-job/page.tsx', finalStr);
    console.log('Replaced perfectly');
} else {
    console.log('Not found');
}