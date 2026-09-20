const fs = require('fs');
let code = fs.readFileSync('components/Footer.tsx', 'utf8');

code = code.replace(
  'router.push(`/profile/${username}`); // Assuming saved jobs is in profile',
  'router.push(`/profile/${username}?tab=saved-jobs`);'
);

const contactSearch = `<li className="p-1 -m-1">Madurai, India</li>`;
const contactReplace = `<li><a href="mailto:admin.ti2a@gmail.com" className="hover:text-white transition block p-1 -m-1">admin.ti2a@gmail.com</a></li>
            <li><a href="https://wa.me/918608609661" target="_blank" rel="noopener noreferrer" className="hover:text-white transition block p-1 -m-1">+91 8608609661</a></li>
            <li className="p-1 -m-1">Madurai, India</li>`;

code = code.replace(contactSearch, contactReplace);
fs.writeFileSync('components/Footer.tsx', code);
console.log('Fixed Footer');
