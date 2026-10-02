const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('dir /s /b C:\\Users\\ASUS\\new_website_work\\app\\admin\\page.tsx').toString().trim().split('\r\n');

for (const file of files) {
  if (file.includes('admin\\\\settings')) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('router.push("/admin/settings")')) {
    console.log("Already has settings:", file);
    continue;
  }

  const settingsBtn = '\n<button\n  onClick={() => router.push("/admin/settings")}\n  className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition"\n>\n  Settings\n</button>\n';

  // Replace Companies button with Companies + Settings
  // Using a less strict regex that handles random newlines inside onClick
  const regex = /<button[\s\S]*?onClick=\{\(\) =>[\s\S]*?router\.push\(['"]\/admin\/companies['"]\)[\s\S]*?\}[^>]*>[\s\S]*?Companies\s*<\/button>/;
  
  if (regex.test(content)) {
    content = content.replace(regex, '$&' + settingsBtn);
    fs.writeFileSync(file, content);
    console.log("Injected settings to:", file);
  } else {
    console.log("Could not find companies button in:", file);
  }
}
