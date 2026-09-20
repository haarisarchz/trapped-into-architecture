const fs = require('fs');

let code = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

code = code.replace(
  'companyName: string,\n  position: string,\n  experience?: string,',
  'companyName: string,\n  position: string,\n  experience?: string,\n  organizationType?: string,\n  location?: string,'
);

code = code.replace(
  'companyName: string, \n  position: string,\n  experience?: string,',
  'companyName: string, \n  position: string,\n  experience?: string,\n  organizationType?: string,\n  location?: string,'
);

code = code.replace(
  'companyName, \n  position, \n  experience,\n  initialShares = 0,',
  'companyName, \n  position, \n  experience,\n  organizationType,\n  location,\n  initialShares = 0,'
);

const shareTextFuncSearch = `  const getShareText = () => {
    let text = \`Name: \${companyName}\\nPosition: \${position}\\n\`;
    if (experience) text += \`Experience: \${experience}\\n\`;
    text += \`\\nFor more details, visit:\\n\${url}\`;
    return text;
  };`;

const shareTextFuncReplace = `  const getShareText = () => {
    let orgTypeLabel = "Firm Name";
    if (organizationType) {
      if (organizationType.toLowerCase().includes('college')) orgTypeLabel = "College Name";
      else if (organizationType.toLowerCase().includes('consultancy')) orgTypeLabel = "Consultancy Name";
      else if (organizationType.toLowerCase().includes('studio')) orgTypeLabel = "Studio Name";
    }
    
    let text = \`\${orgTypeLabel}: \${companyName}\\n\`;
    if (location) {
      text += \`Location: \${location}\\n\`;
    }
    
    let combinedPosition = position;
    if (experience && experience.trim() !== '') {
      combinedPosition += \` (\${experience.trim()})\`;
    }
    text += \`Position: \${combinedPosition}\\n\`;
    
    text += \`\\nFor more details visit:\\n\${url}\`;
    return text;
  };`;

code = code.replace(shareTextFuncSearch, shareTextFuncReplace);

fs.writeFileSync('components/ShareButtons.tsx', code);
console.log('Fixed ShareButtons');
