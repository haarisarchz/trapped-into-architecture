const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace('const fetchJob = async () => { try {', 'const fetchJob = async () => {');

// Clean up any stray catch blocks just in case
file = file.replace('} catch (err: any) { alert("FETCH ERROR: " + err.message); console.error("fetchJob Error:", err); } };', '};');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Reverted broken try-catch");
