const fs = require('fs');
let file = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

const regex = /const getShareText = \(\) => \{[\s\S]*?return text;\n  \};/;

const newLogic = `const getShareText = () => {
    let text = \`*\${companyName}*\\n\`;
    
    const locParts = [];
    if (city) locParts.push(city);
    if (state) locParts.push(state);
    if (locParts.length > 0) {
      text += \`\${locParts.join(", ")}\\n\`;
    }
    
    let expText = "";
    if (experience) {
      const exp = Array.isArray(experience) ? experience.join(", ") : String(experience);
      if (exp && employmentType !== "Internship" && !(position && position.toLowerCase().includes("intern"))) {
        expText = \` (\${exp})\`;
      }
    }
    
    text += \`\${position}\${expText}\\n\\n\`;
    text += \`For more details, visit:\\n\${url}\`;
    
    return text;
  };`;

file = file.replace(regex, newLogic);
fs.writeFileSync('components/ShareButtons.tsx', file);
console.log("Patched ShareButtons");
