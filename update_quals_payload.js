const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /qualifications: sameRequirements \? qualifications : \(pos\.qualifications \|\| qualifications\),/g;

const replacement = `qualifications: sameRequirements 
          ? (Array.isArray(qualifications) ? qualifications : (qualifications ? [qualifications] : []))
          : (Array.isArray(pos.qualifications) ? pos.qualifications : (pos.qualifications ? [pos.qualifications] : (qualifications ? (Array.isArray(qualifications) ? qualifications : [qualifications]) : []))),`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success replacing qualifications map");
} else {
  console.log("Regex not found");
}
