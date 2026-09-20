const fs = require('fs');

let code = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const divStart = code.indexOf('<div className="space-y-8">');
let balance = 0;
let divEnd = -1;

for (let i = divStart; i < code.length; i++) {
  if (code.slice(i, i + 4) === '<div') balance++;
  if (code.slice(i, i + 6) === '</div') { // Wait, </div counts as 5, but I used 6. Ah. '</div' is 5.
    balance--;
    if (balance === 0) {
      divEnd = i + 6; // '</div>'
      break;
    }
  }
}

// Fix logic
balance = 0;
for (let i = divStart; i < code.length; i++) {
  if (code.slice(i, i + 5) === '<div ') balance++;
  if (code.slice(i, i + 5) === '<div>') balance++;
  if (code.slice(i, i + 6) === '</div>') {
    balance--;
    if (balance === 0) {
      divEnd = i + 6;
      break;
    }
  }
}

const innerContent = code.slice(divStart, divEnd);

const replacement = `
  const renderFilters = () => (
    ${innerContent}
  );
`;

// Insert the definition just before `return (`
const returnIdx = code.indexOf('return (');
if (returnIdx !== -1) {
    code = code.slice(0, returnIdx) + replacement + '\n  ' + code.slice(returnIdx);
}

// Replace the original with a call
code = code.replace(innerContent, '{renderFilters()}');

// Find the mobile filter drawer placeholder and replace it
const mobilePlaceholder = '{/* CUT & PASTE YOUR ENTIRE FILTER CONTENT HERE */}';
code = code.replace(mobilePlaceholder, '{renderFilters()}');

fs.writeFileSync('app/jobs/page.tsx', code);
console.log('Fixed mobile filters!');
