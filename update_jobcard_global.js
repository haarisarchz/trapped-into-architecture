const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Undo previous
content = content.replace(`
    const formatExperience = (exp) => {
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
    const formattedExperience = formatExperience(experience);
    const expStr = formattedExperience.toLowerCase();
`, 'const expStr = experience ? String(experience).toLowerCase().trim() : "";');
content = content.replace('{formattedExperience}', '{experience}');

// Now insert globally at top of component:
const hookPos = content.indexOf('const router = useRouter();');
const newLogic = `const router = useRouter();
  
  const formatExperience = (exp: any) => {
      if (!exp) return "";
      let str = Array.isArray(exp) ? exp.join(", ") : String(exp);
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      const unique: string[] = [];
      const lowerSeen = new Set();
      for (const p of parts) {
         if (!lowerSeen.has(p.toLowerCase())) {
            lowerSeen.add(p.toLowerCase());
            unique.push(p);
         }
      }
      return unique.join(", ");
  };
  const formattedExperience = formatExperience(experience);
`;
content = content.replace('const router = useRouter();', newLogic);

// Replace `{experience}` with `{formattedExperience}`
// BUT only in JSX! Not `experience: string;` or `experience,`
content = content.replace(/{experience}/g, '{formattedExperience}');
content = content.replace(/String\(experience\)/g, 'String(formattedExperience)');
content = content.replace(/const formattedExperience = formatExperience\(formattedExperience\)/, 'const formattedExperience = formatExperience(experience)');

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Updated Jobcard globally");