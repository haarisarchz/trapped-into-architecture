const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regexEmailNow = /\{job\.application_email && \(\s*<a href=\{`mailto:\$\{job\.application_email\}\?subject=Application for \$\{encodeURIComponent\(job\.position\)\} at \$\{encodeURIComponent\(job\.firm_name\)\}`\} className="bg-white text-black px-8 py-3 rounded-xl text-base font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm">\s*Email Now\s*<\/a>\s*\)\}/;

const replaceEmailNow = `{displayEmail && (
                              <a href={\`mailto:\${displayEmail}?subject=Application for \${encodeURIComponent(job.position)} at \${encodeURIComponent(job.firm_name)}\`} className="bg-white text-black px-8 py-3 rounded-xl text-base font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm">
                                Email Now
                              </a>
                            )}`;

content = content.replace(regexEmailNow, replaceEmailNow);

content = content.replace(
  '{!job.apply_link && !job.application_email && (',
  '{!job.apply_link && !displayEmail && ('
);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Email Now button");