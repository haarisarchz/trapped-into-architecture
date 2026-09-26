const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /            <\/div>\s*\{\/\* JOB DESCRIPTION CARD \(Full Width Bottom Box\) \*\/\}\s*\{hasDescription && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">\s*<h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description<\/h2>\s*<div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">\s*\{cleanDescription\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{\/\* SIDEBAR \*\/\}/s;

const replacement = `
              {/* JOB DESCRIPTION CARD (Full Width Bottom Box) */}
              {hasDescription && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {cleanDescription}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Success moving Job Description inside Main Content div");
} else {
  console.log("Regex not found");
}
