const fs = require('fs');

let socialRoute = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');
socialRoute = socialRoute.split('?? FIRM').join('?? FIRM');
socialRoute = socialRoute.split('?? LOCATION').join('?? LOCATION');
socialRoute = socialRoute.split('?? POSITIONS').join('?? POSITIONS');
socialRoute = socialRoute.split('?? For more details').join('?? For more details');
fs.writeFileSync('app/api/publish/social/route.ts', socialRoute);

let jobsPage = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
jobsPage = jobsPage.split('?? FIRM').join('?? FIRM');
jobsPage = jobsPage.split('?? LOCATION').join('?? LOCATION');
jobsPage = jobsPage.split('?? POSITIONS').join('?? POSITIONS');
jobsPage = jobsPage.split('?? For more details').join('?? For more details');
fs.writeFileSync('app/admin/jobs/page.tsx', jobsPage);

console.log("Emojis fixed in both files using split/join");
