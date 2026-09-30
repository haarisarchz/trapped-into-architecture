const fs = require('fs');
let content = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

const regex = /const key = j\.admin_post_id \|\| j\.id;/;
console.log(content.match(regex) ? "Found" : "Not Found");