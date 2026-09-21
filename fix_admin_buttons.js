const fs = require('fs');

const buttonStr = `<button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition shrink-0 flex items-center gap-2">← Back to Dashboard</button>`;

function processFile(file, regex, replaceStr) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    // Remove existing "Dashboard" back buttons
    code = code.replace(/<button[^>]*?onClick=\{\(\) => router\.push\(['"]\/admin['"]\)\}[^>]*?>.*?Dashboard.*?<\/button>/gi, '');
    code = code.replace(/<button[^>]*?>[^<]*?Back to Dashboard.*?<\/button>/gi, '');
    code = code.replace(/<button[^>]*?>[^<]*?← Dashboard.*?<\/button>/gi, '');
    code = code.replace(regex, replaceStr);
    fs.writeFileSync(file, code);
    console.log('Processed', file);
  }
}

processFile('app/admin/jobs/page.tsx',
  /<div>\s*<h1 className="text-5xl font-bold">/,
  `${buttonStr}\n          <div>\n            <h1 className="text-5xl font-bold">`);

processFile('app/admin/companies/page.tsx',
  /<div>\s*<h1 className="text-4xl font-bold text-gray-900">/,
  `${buttonStr}\n          <div>\n            <h1 className="text-4xl font-bold text-gray-900">`);

processFile('app/admin/analytics/page.tsx',
  /<h1 className="text-4xl font-bold mb-8">/,
  `<div className="flex justify-between items-center mb-8">\n          <h1 className="text-4xl font-bold mb-0">Analytics</h1>\n          ${buttonStr}\n        </div>`);

processFile('app/admin/users/page.tsx',
  /<h1 className="text-3xl font-bold">User Management<\/h1>/,
  `<h1 className="text-3xl font-bold">User Management</h1>\n          ${buttonStr}`);

processFile('app/admin/contact/page.tsx',
  /<h1 className="text-3xl font-bold">Website Contact Information<\/h1>/,
  `<h1 className="text-3xl font-bold">Website Contact Information</h1>\n          ${buttonStr}`);

processFile('app/admin/add-job/page.tsx',
  /<h1 className="text-4xl font-bold text-gray-900">/,
  `<div className="flex justify-between items-center mb-8">\n            <h1 className="text-4xl font-bold text-gray-900">Add New Job</h1>\n            ${buttonStr}\n          </div>\n          <h1 className="hidden">`);

// Wait, add-job logic above might break, let's fix it safely
