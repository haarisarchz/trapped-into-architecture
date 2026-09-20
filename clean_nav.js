const fs = require('fs');

let nav = fs.readFileSync('components/Navbar.tsx', 'utf8');
nav = nav.replace(/<Link[^>]*href="\/practice-exams"[^>]*>[\s\S]*?<\/Link>/gi, '');
nav = nav.replace(/<Link[^>]*href="\/resources"[^>]*>[\s\S]*?<\/Link>/gi, '');
fs.writeFileSync('components/Navbar.tsx', nav);

let footer = fs.readFileSync('components/Footer.tsx', 'utf8');
footer = footer.replace(/<li>\s*<Link[^>]*href="\/career-advice"[^>]*>[\s\S]*?<\/Link>\s*<\/li>/gi, '');
footer = footer.replace(/<li>\s*<Link[^>]*href="\/resume-tips"[^>]*>[\s\S]*?<\/Link>\s*<\/li>/gi, '');
fs.writeFileSync('components/Footer.tsx', footer);

console.log('Cleanup regex complete');
