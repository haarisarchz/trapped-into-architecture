const fs = require('fs');

let code = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const divStart = code.indexOf('<div className="hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200">');
if (divStart !== -1) {
  let balance = 0;
  let divEnd = -1;

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

  // We will cut the innerContent out first!
  code = code.replace(innerContent, '{renderFilters()}');

  // Replace mobile placeholder BEFORE we inject the definition, to avoid ambiguity
  const mobilePlaceholder = '{/* CUT & PASTE YOUR ENTIRE FILTER CONTENT HERE */}';
  code = code.replace(mobilePlaceholder, '{renderFilters()}');

  // Now inject definition before the first return (which should be the component return)
  // Actually, we need to inject it before `return (`
  const replacement = `
  const renderFilters = () => (
    ${innerContent}
  );
  `;
  const returnIdx = code.indexOf('return (');
  if (returnIdx !== -1) {
      code = code.slice(0, returnIdx) + replacement + '\n  ' + code.slice(returnIdx);
  }

  // Ensure any other mobile placeholders are handled if multiple
  code = code.replace(/{mobileFiltersOpen && \(/g, '{showFilters && (');
  code = code.replace(/setMobileFiltersOpen/g, 'setShowFilters');
  // It already has showFilters

  fs.writeFileSync('app/jobs/page.tsx', code);
  console.log('Fixed mobile filters safely!');
} else {
  console.log("Could not find the sidebar div");
}
