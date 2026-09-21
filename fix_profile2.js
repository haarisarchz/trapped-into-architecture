const fs = require('fs');

let code = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

code = code.replace(
  /import \{\s*useRouter,\s*useParams\s*\}\s*from\s*\"next\/navigation\";/,
  'import { useRouter, useParams, useSearchParams } from "next/navigation";'
);

fs.writeFileSync('app/profile/[username]/page.tsx', code);
console.log('Fixed profile imports');
