const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const duplicateBlock = `    ]);
      return (
        <main className="p-10">
          <h1 className="text-5xl font-bold">Job Not Found</h1>
        </main>
      );
    }`;

const fixedBlock = `    ]);`;

file = file.replace(duplicateBlock, fixedBlock);
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Removed duplicated block");
