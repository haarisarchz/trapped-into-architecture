const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

// Rename "Exclude Expired Jobs" -> "Exclude Expired Internships"
content = content.replace(/Exclude Expired Jobs/g, 'Exclude Expired Internships');

// Remove POSITION block
const posStart = content.indexOf('{/* POSITION */}');
const qualStart = content.indexOf('{/* QUALIFICATION */}');
if (posStart !== -1 && qualStart !== -1) {
  content = content.substring(0, posStart) + content.substring(qualStart);
}

// Remove QUALIFICATION block
const qualStart2 = content.indexOf('{/* QUALIFICATION */}');
const skillsStart = content.indexOf('{/* SKILLS */}');
if (qualStart2 !== -1 && skillsStart !== -1) {
  content = content.substring(0, qualStart2) + content.substring(skillsStart);
}

// Remove SKILLS block
const skillsStart2 = content.indexOf('{/* SKILLS */}');
// find the next block: `  <div className="mt-6 flex items-center gap-3">` which is the Exclude Expired block
const excludeStart = content.indexOf('<div className="mt-6 flex items-center gap-3">', skillsStart2);
if (skillsStart2 !== -1 && excludeStart !== -1) {
  content = content.substring(0, skillsStart2) + content.substring(excludeStart);
}

fs.writeFileSync('app/internships/page.tsx', content);
console.log("Cleaned up internship filters");
