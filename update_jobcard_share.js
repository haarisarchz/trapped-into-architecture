const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// There are multiple ShareButtons in Jobcard.tsx
// Let's replace state={state} with state={state}\n              area={area}\n              experience={experience}

content = content.replace(/state=\{state\}/g, `state={state}\n              area={area}\n              experience={experience}`);

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Updated Jobcard.tsx");