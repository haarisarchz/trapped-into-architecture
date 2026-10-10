const fs = require('fs');

// 1. Patch admin share format
let adminContent = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
const oldAdminFormat = 'let text = `Firm Name: ${job.firm_name || "Unknown"}\\nLocation: ${location}\\nPosition: ${job.position}\\n\\nFor more details, visit:\\n${url}`;';
const newAdminFormat = 'let text = `?? FIRM: ${job.firm_name || "Unknown"}\\n?? LOCATION: ${location}\\n?? POSITIONS: ${job.position}\\n\\n?? For more details and to apply, visit:\\n${url}`;';
if (adminContent.includes(oldAdminFormat)) {
  adminContent = adminContent.replace(oldAdminFormat, newAdminFormat);
  fs.writeFileSync('app/admin/jobs/page.tsx', adminContent);
  console.log("Admin share format updated.");
}

// 2. Patch API social format
let routeContent = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

// The original logic:
// let message = `${job.firm_name} is hiring!\n?? ${location}\n\nPositions:\n`;
// if (Array.isArray(job.positions) && job.positions.length > 0) { ... }
// else { message += `1. ${job.position} (${job.experience || "Experience not specified"})\n`; }
// message += `\nFor more details, visit:\nhttps://www.trappedintoarchitecture.com/jobs/${job.id}\n\nVisit www.trappedintoarchitecture.com for more job updates.`;

// Let's dynamically replace the parts.
routeContent = routeContent.replace('let message = `${job.firm_name} is hiring!\\n?? ${location}\\n\\nPositions:\\n`;', 'let message = `?? FIRM: ${job.firm_name}\\n?? LOCATION: ${location}\\n?? POSITIONS:\\n`;');
routeContent = routeContent.replace('message += `\\nFor more details, visit:\\nhttps://www.trappedintoarchitecture.com/jobs/${job.id}\\n\\nVisit www.trappedintoarchitecture.com for more job updates.\\n\\n`;', 'message += `\\n?? For more details and to apply, visit:\\nhttps://www.trappedintoarchitecture.com/jobs/${job.id}\\n\\n?? Visit www.trappedintoarchitecture.com for more job updates.\\n\\n`;');

fs.writeFileSync('app/api/publish/social/route.ts', routeContent);
console.log("Social publish API updated.");
