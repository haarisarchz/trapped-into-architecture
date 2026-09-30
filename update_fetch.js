const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex2 = /setCompanyLinkedin\(data\.linkedin \|\| ""\);/;
const replacement2 = `setCompanyLinkedin(data.linkedin || "");
    setCompanyWhatsapp(data.whatsapp || "");
    setCompanyTwitter(data.twitter || "");`;

if(content.match(regex2)) {
  content = content.replace(regex2, replacement2);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Updated fetchJobData with whatsapp and twitter");
} else {
  console.log("Regex not found for fetchJobData");
}