const fs = require('fs');
let content = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

const newFunc = `function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {
  const firmName = jobs[0].firm_name || "Unknown Firm";
  const locParts = [jobs[0].area || jobs[0].neighborhood, jobs[0].city, jobs[0].state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote / Not specified";

  let msg = \`?? FIRM: \${firmName}\\n?? LOCATION: \${location}\\n?? POSITIONS:\\n\`;
  
  jobs.forEach((job, index) => {
    const exp = Array.isArray(job.experience) ? job.experience.join(', ') : job.experience;
    const expText = exp && String(exp).trim() && job.employment_type !== "Internship" && !job.position?.toLowerCase().includes("intern") ? \` (\${exp})\` : '';
    const prefix = jobs.length === 1 ? '1. ' : \`\${index + 1}. \`;
    msg += \`\${prefix}\${job.position}\${expText}\\n\`;
  });

  if (platform === "whatsapp" || platform === "telegram") {
    msg += \`\\n?? For more details and to apply, visit:\\n\${jobUrl}\`;
    return msg;
  }

  if (platform === "instagram") {
    msg += \`\\n?? For more details and to apply, visit the link in our bio!\\n\`;
  } else {
    msg += \`\\n?? For more details and to apply, visit:\\n\${jobUrl}\\n\`;
  }
  msg += \`\\n?? Visit www.trappedintoarchitecture.com for more job updates.\\n\\n\`;

  const mainJob = jobs[0];
  const city = (mainJob.city || "Architecture").replace(/[^a-zA-Z0-9]/g, '');
  const rawPosition = mainJob.position || "Architecture";
  const isIntern = rawPosition.toLowerCase().includes("intern");
  const positionTag = isIntern ? "ArchitectureIntern" : "Architect";
  
  let tags = [];
  if (city) {
    tags.push(\`#\${city}Jobs\`);
    tags.push(\`#\${city}\${positionTag}Jobs\`);
    tags.push(\`#\${positionTag}sIn\${city}\`);
  }
  tags.push(\`#\${positionTag}JobsIndia\`);
  
  if (rawPosition.toLowerCase().includes("interior")) tags.push("#InteriorDesignJobs");
  if (rawPosition.toLowerCase().includes("civil")) tags.push("#CivilEngineeringJobs");
  
  msg += [...new Set(tags)].join(" ");
  return msg;
}
`;

content = content.replace(/function generatePostText[\s\S]*?return text;\n\}/m, newFunc.trim());

fs.writeFileSync('app/api/publish/social/route.ts', content);
console.log("Successfully replaced generatePostText with regex on correct file.");
