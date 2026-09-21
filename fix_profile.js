const fs = require('fs');
let code = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');
if (!code.includes('useSearchParams } from "next/navigation"')) {
  code = code.replace(/import { useRouter } from "next\/navigation";/g, 'import { useRouter, useSearchParams } from "next/navigation";');
}
fs.writeFileSync('app/profile/[username]/page.tsx', code);
console.log('Fixed profile page');
