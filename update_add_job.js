const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /setPositions\(ai\.positions\.map\(p => \(\{\s*position: p\.position/s;

const replacement = `setPositions(ai.positions.map((p, index) => {
          // IMPORTANT: Preserve existing job ID if replacing an already saved position!
          // We use a functional state update to guarantee we access the latest positions safely,
          // but since this is an async closure, we map from the current positions array in scope.
          const existingId = positions[index] ? positions[index].id : undefined;
          return {
            ...(existingId ? { id: existingId } : {}),
            position: p.position`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success issue 1");
} else {
  console.log("Regex not found for Issue 1");
}