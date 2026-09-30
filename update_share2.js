const fs = require('fs');
let content = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

// Update Props
content = content.replace(
  `  organizationType,
  city,
  state,
  initialShares = 0,`,
  `  organizationType,
  area,
  city,
  state,
  experience,
  initialShares = 0,`
);
content = content.replace(
  `  organizationType?: string,
  city?: string,
  state?: string,
  initialShares?: number,`,
  `  organizationType?: string,
  area?: string,
  city?: string,
  state?: string,
  experience?: any,
  initialShares?: number,`
);

// Update getShareText
const oldGetShareTextRegex = /const getShareText = \(\) => \{[\s\S]*?return text;\n  \};/;
const newGetShareText = `const getShareText = () => {
    let orgTypeLabel = organizationType 
      ? organizationType.charAt(0).toUpperCase() + organizationType.slice(1) 
      : "Firm";
    
    let text = \`\${orgTypeLabel} Name: \${companyName}\\n\`;
    
    // Format Location: Neighborhood, City, State
    const locParts = [];
    if (area) locParts.push(area);
    if (city) locParts.push(city);
    if (state) locParts.push(state);
    if (locParts.length > 0) {
      text += \`Location: \${locParts.join(", ")}\\n\\n\`;
    }
    
    if (activeJobs && activeJobs.length > 1) {
      text += \`Positions:\\n\`;
      activeJobs.forEach((job, idx) => {
        let expText = "";
        if (job.experience) {
          const exp = Array.isArray(job.experience) ? job.experience.join(", ") : String(job.experience);
          if (exp) expText = \` (\${exp})\`;
        }
        text += \`\${idx + 1}. \${job.position}\${expText}\\n\`;
      });
      text += \`\\n\`;
    } else {
      let singleExpText = "";
      if (experience) {
        const exp = Array.isArray(experience) ? experience.join(", ") : String(experience);
        if (exp) singleExpText = \` (\${exp})\`;
      }
      text += \`Positions: \${position}\${singleExpText}\\n\\n\`;
    }
    
    text += \`For Details Visit:\\n\${url}\`;
    return text;
  };`;
content = content.replace(oldGetShareTextRegex, newGetShareText);

// Remove Instagram
content = content.replace(/\n\s*\{ name: "Instagram", [^\n]*/g, '');

fs.writeFileSync('components/ShareButtons.tsx', content);
console.log("Updated ShareButtons");