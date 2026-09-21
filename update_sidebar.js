const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const navCode = `<button
  onClick={() => router.push("/admin/companies")}
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Companies
</button>
<button
  onClick={() => router.push("/admin/users")}
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Users
</button>
<button
  onClick={() => router.push("/admin/contact")}
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Contact
</button>`;

code = code.replace(/<button[\s\S]*?router\.push\(['"]\/admin\/companies['"]\)[^>]*?>[\s\S]*?Companies\s*<\/button>\s*<button[^>]*?>[\s\S]*?Settings\s*<\/button>/g, navCode);

fs.writeFileSync('app/admin/page.tsx', code);
console.log('Fixed admin sidebar');
