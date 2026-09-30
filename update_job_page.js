const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

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
  content = content.replace('export default async function JobDetailsPage', formatLogic + '\nexport default async function JobDetailsPage');
}

content = content.replace(
  '{Array.isArray(job.experience) ? job.experience.join(", ") : job.experience}',
  '{formatExperience(job.experience)}'
);
content = content.replace(
  '{Array.isArray(rj.experience) ? rj.experience.join(", ") : rj.experience}',
  '{formatExperience(rj.experience)}'
);
content = content.replace(
  '{Array.isArray(pj.experience) ? pj.experience.join(", ") : pj.experience}',
  '{formatExperience(pj.experience)}'
);
content = content.replace(
  '{Array.isArray(cj.experience) ? cj.experience.join(", ") : cj.experience}',
  '{formatExperience(cj.experience)}'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Job page");