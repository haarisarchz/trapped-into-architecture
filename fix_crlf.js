const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// The exact string to remove is:
//     return (
//       <main className="p-10">
//         <h1 className="text-5xl font-bold">Job Not Found</h1>
//       </main>
//     );
//   }
// Let's just find "]);" and the next "const companySlug" and remove everything in between.

const p1 = file.indexOf(']);');
const p2 = file.indexOf('const companySlug =');

if (p1 !== -1 && p2 !== -1) {
    file = file.slice(0, p1 + 3) + '\n\n  ' + file.slice(p2);
    fs.writeFileSync('app/jobs/[id]/page.tsx', file);
    console.log("Cleaned up lines 126-131 successfully.");
} else {
    console.log("Could not find targets.");
}

