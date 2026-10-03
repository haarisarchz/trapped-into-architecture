const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');
const start = file.indexOf('const handlePublishJob = async (');
const end = file.indexOf('const publicJobs = validPositions.map', start);
console.log(file.substring(start, end));
