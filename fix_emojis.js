const fs = require('fs');

function fixEmojis(content) {
    content = content.replace(/\?\? FIRM/g, '?? FIRM');
    content = content.replace(/\?\? LOCATION/g, '?? LOCATION');
    content = content.replace(/\?\? POSITIONS/g, '?? POSITIONS');
    content = content.replace(/\?\? For more details/g, '?? For more details');
    return content;
}

let socialRoute = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');
socialRoute = fixEmojis(socialRoute);
fs.writeFileSync('app/api/publish/social/route.ts', socialRoute);

let jobsPage = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
jobsPage = fixEmojis(jobsPage);
fs.writeFileSync('app/admin/jobs/page.tsx', jobsPage);

console.log("Emojis fixed in both files");
