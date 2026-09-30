const fs = require('fs');

let content = fs.readFileSync('components/Footer.tsx', 'utf8');

const regex = /<div className="flex items-start gap-4 mb-4">\s*\{settings\?\.logo_url && \(\s*<img src=\{settings\.logo_url\} alt="Site Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" \/>\s*\)\}\s*<div>\s*<h2 className="text-xl md:text-2xl font-bold mb-2">Trapped Into Architecture<\/h2>\s*<p className="text-gray-400 leading-6 text-sm md:text-base">\s*Careers, knowledge, opportunities and growth for architecture students and professionals\.\s*<\/p>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="mb-5">
              <div className="flex items-center gap-4 mb-3">
                {settings?.logo_url && (
                  <img src={settings.logo_url} alt="Site Logo" className="h-12 w-auto md:h-16 object-contain shrink-0" />
                )}
                <h2 className="text-xl md:text-2xl font-bold">Trapped Into Architecture</h2>
              </div>
              <p className="text-gray-400 leading-6 text-sm md:text-base">
                Careers, knowledge, opportunities and growth for architecture students and professionals.
              </p>
            </div>`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('components/Footer.tsx', content);
  console.log("Updated Footer logo layout");
} else {
  console.log("Regex not found in Footer");
}