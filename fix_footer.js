const fs = require('fs');
let c = fs.readFileSync('components/Footer.tsx', 'utf-8');
c = c.replace(/<li><Link href="\/practice-exams" className="hover:text-white transition block p-1 -m-1">Practice Exams<\/Link><\/li>\s*/, '');
c = c.replace(/<li><Link href="\/resources" className="hover:text-white transition block p-1 -m-1">Resources<\/Link><\/li>\s*/, '');
fs.writeFileSync('components/Footer.tsx', c);