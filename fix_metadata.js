const fs = require('fs');
let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const oldMetadata = `  return {
    title: \`\${job.position} at \${job.firm_name}\`,
    description: \`\${job.firm_name} is hiring a \${job.position} in \${job.city}, \${job.state}. \${job.employment_type || ""} \${job.workplace_type || ""}\`,
    openGraph: {
      title: \`\${job.position} | \${job.firm_name}\`,
      description: \`Apply for the \${job.position} position at \${job.firm_name} in \${job.city}.\`,
      images: job.image ? [job.image] : [],
    },
  };`;

const newMetadata = `  return {
    title: \`\${job.position} — \${job.firm_name} | Trapped Into Architecture\`,
    description: \`\${job.position} opportunity at \${job.firm_name} in \${job.city}, \${job.state}.\`,
    openGraph: {
      title: \`\${job.position} — \${job.firm_name} | Trapped Into Architecture\`,
      description: \`\${job.position} opportunity at \${job.firm_name} in \${job.city}, \${job.state}.\`,
      url: \`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`,
      images: job.image ? [job.image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: \`\${job.position} — \${job.firm_name} | Trapped Into Architecture\`,
      description: \`\${job.position} opportunity at \${job.firm_name} in \${job.city}, \${job.state}.\`,
      images: job.image ? [job.image] : [],
    }
  };`;

code = code.replace(oldMetadata, newMetadata);
fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed metadata');
