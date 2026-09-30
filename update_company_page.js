const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const formatLogic = `
  const formatExperience = (exp: any) => {
      if (!exp) return "";
      let str = Array.isArray(exp) ? exp.join(", ") : String(exp);
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      const unique = [];
      const lowerSeen = new Set();
      for (const p of parts) {
         if (!lowerSeen.has(p.toLowerCase())) {
            lowerSeen.add(p.toLowerCase());
            unique.push(p);
         }
      }
      return unique.join(", ");
  };
`;

if (!content.includes('const formatExperience')) {
  content = content.replace('export default async function CompanyPage', formatLogic + '\nexport default async function CompanyPage');
}

content = content.replace(
  '{job.experience ? job.experience : "Experience not specified"}',
  '{job.experience ? formatExperience(job.experience) : "Experience not specified"}'
);

fs.writeFileSync('app/companies/[slug]/page.tsx', content);
console.log("Updated Company page");