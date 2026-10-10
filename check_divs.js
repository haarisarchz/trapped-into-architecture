const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const renderFiltersMatch = content.match(/const renderFilters = \(isMobile: boolean = false\) => \{([\s\S]*?)\};\n\n  return \(/);
if (renderFiltersMatch) {
  const rf = renderFiltersMatch[1];
  const divs = (rf.match(/<div/g) || []).length;
  const closedivs = (rf.match(/<\/div>/g) || []).length;
  console.log(`renderFilters: <div: ${divs}, </div: ${closedivs}`);
}

const mainMatch = content.match(/return \([\s\S]*?\}\s*\}\)\(\)\}\s*<\/div>\s*\{\/\* closes job grid \*\/\}/);
if (mainMatch) {
  const mm = mainMatch[0];
  const divs = (mm.match(/<div/g) || []).length;
  const closedivs = (mm.match(/<\/div>/g) || []).length;
  console.log(`main JSX: <div: ${divs}, </div: ${closedivs}`);
}
