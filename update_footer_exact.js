const fs = require('fs');

let content = fs.readFileSync('components/Footer.tsx', 'utf8');

const regex = /<div className="mb-4 flex items-center">\s*\{settings\?\.logo_url \? \(\s*<img src=\{settings\.logo_url\} alt="Site Logo" className="h-10 object-contain" \/>\s*\) : \(\s*<h2 className="text-xl md:text-2xl font-bold">Trapped Into Architecture<\/h2>\s*\)\}\s*<\/div>\s*<p className="text-gray-400 leading-6 text-sm md:text-base">\s*Careers, knowledge, opportunities and growth for architecture students and professionals\.\s*<\/p>/;

const replacement = `<div className="flex items-start gap-4 mb-4">
              {settings?.logo_url && (
                <img src={settings.logo_url} alt="Site Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
              )}
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Trapped Into Architecture</h2>
                <p className="text-gray-400 leading-6 text-sm md:text-base">
                  Careers, knowledge, opportunities and growth for architecture students and professionals.
                </p>
              </div>
            </div>`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('components/Footer.tsx', content);
  console.log("Updated Footer layout");
} else {
  console.log("Regex not found in Footer");
}