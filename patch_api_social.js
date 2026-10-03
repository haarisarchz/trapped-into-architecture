const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

const replacement = `
function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {
  const firmName = jobs[0].firm_name || "Unknown Firm";

  if (platform === "whatsapp" || platform === "telegram") {
    let orgTypeLabel = company?.organization_type 
      ? company.organization_type.charAt(0).toUpperCase() + company.organization_type.slice(1) 
      : (jobs[0].organization_type || "Firm");
    let msg = \`\${orgTypeLabel} Name: \${firmName}\\n\`;
    const locParts = [jobs[0].area || jobs[0].neighborhood, jobs[0].city, jobs[0].state].filter(Boolean);
    msg += \`Location: \${locParts.length > 0 ? locParts.join(", ") : "Remote / Not specified"}\\n\`;
    
    if (jobs.length === 1) {
      const job = jobs[0];
      const exp = Array.isArray(job.experience) ? job.experience.join(', ') : job.experience;
      const expText = exp && exp.trim() && job.employment_type !== "Internship" && !job.position?.toLowerCase().includes("intern") ? \` (\${exp})\` : '';
      msg += \`Position: \${job.position}\${expText}\\n\\n\`;
    } else {
      msg += \`Positions:\\n\`;
      jobs.forEach((job, index) => {
        const exp = Array.isArray(job.experience) ? job.experience.join(', ') : job.experience;
        const expText = exp && exp.trim() && job.employment_type !== "Internship" && !job.position?.toLowerCase().includes("intern") ? \` (\${exp})\` : '';
        msg += \`\${index + 1}. \${job.position}\${expText}\\n\`;
      });
      msg += \`\\n\`;
    }
    msg += \`For more details, visit:\\n\${jobUrl}\`;
    return msg;
  }
`;

file = file.replace('function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {', replacement);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched API generatePostText");
