const fs = require('fs');

let users = fs.readFileSync('app/admin/users/page.tsx', 'utf8');
users = users.replace(/className=\\{`px-6 py-3 font-semibold \\\$\\{activeTab === 'users'/g, 'className={`px-6 py-3 font-semibold ${activeTab === \\'users\\'');
users = users.replace(/className=\\{`px-6 py-3 font-semibold \\\$\\{activeTab === 'admins'/g, 'className={`px-6 py-3 font-semibold ${activeTab === \\'admins\\'');
users = users.replace(/className=\\{`px-6/g, 'className={`px-6');
fs.writeFileSync('app/admin/users/page.tsx', users);

let contact = fs.readFileSync('app/contact/page.tsx', 'utf8');
contact = contact.replace(/href=\\{`mailto/g, 'href={`mailto');
contact = contact.replace(/href=\\{`tel/g, 'href={`tel');
fs.writeFileSync('app/contact/page.tsx', contact);

console.log('Fixed backticks!');
