const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /if \(ai\.positions && Array\.isArray\(ai\.positions\) && ai\.positions\.length > 0\) \{\s*setPositions\(ai\.positions\.map\(p => \(\{/s;

const replacement = `if (ai.positions && Array.isArray(ai.positions) && ai.positions.length > 0) {
        let hasDistinctRequirements = false;
        if (ai.positions.length > 1) {
          const firstQual = ai.positions[0].qualifications || "";
          const firstSkills = JSON.stringify(ai.positions[0].skills || []);
          for (let i = 1; i < ai.positions.length; i++) {
            if (ai.positions[i].qualifications !== firstQual || JSON.stringify(ai.positions[i].skills || []) !== firstSkills) {
              hasDistinctRequirements = true;
              break;
            }
          }
        }
        if (hasDistinctRequirements) setSameRequirements(false);

        setPositions(ai.positions.map(p => ({`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success with regex");
} else {
  console.log("Regex not found");
}