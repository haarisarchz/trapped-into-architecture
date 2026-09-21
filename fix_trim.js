const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Handle any kind of trim map that assumes string
  code = code.replace(/\.map\(\(exp: string\) => exp\.trim\(\)\)/g, `.map((exp: any) => typeof exp === 'string' ? exp.trim() : String(exp || ''))`);
  code = code.replace(/\.map\(\(q: string\) => q\.trim\(\)\)/g, `.map((q: any) => typeof q === 'string' ? q.trim() : String(q || ''))`);
  code = code.replace(/\.map\(\(skill: string\) => skill\.trim\(\)\)/g, `.map((skill: any) => typeof skill === 'string' ? skill.trim() : String(skill || ''))`);
  fs.writeFileSync(file, code);
  console.log('Fixed', file);
}

fixFile('app/jobs/page.tsx');
fixFile('app/companies/page.tsx');
