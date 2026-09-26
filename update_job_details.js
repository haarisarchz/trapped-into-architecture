const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Parse role vs description
const parseRegex = /const hasDescription = job\.job_description && job\.job_description\.trim\(\);/s;
const parseReplace = `
    let jobRole = "";
    let cleanDescription = job.job_description || "";
    if (cleanDescription.startsWith("**Job Role:**")) {
      const parts = cleanDescription.split("\\n\\n");
      if (parts.length > 1) {
        jobRole = parts[0].replace("**Job Role:**", "").trim();
        cleanDescription = parts.slice(1).join("\\n\\n");
      }
    }
    const hasDescription = cleanDescription.trim();
    const hasRole = jobRole.trim();
`;
content = content.replace(parseRegex, parseReplace);

// Sidecars slicing 5 -> 3
content = content.replace(/\.slice\(0, 5\)/g, '.slice(0, 3)');

// Popular jobs "saved" text removal
content = content.replace(/<p className="text-xs text-gray-500 mt-1">🏷️ \{pj\.save_count \|\| 0\} saved<\/p>/g, '');

// Remove DESCRIPTION block from Hero Card
const oldDescRegex = /\{\/\* DESCRIPTION \*\/\}\s*\{hasDescription && \(\s*<div>\s*<h2 className="text-lg font-bold mb-2 text-gray-900">Job Description<\/h2>\s*<div className="text-gray-700 leading-relaxed whitespace-pre-line">\s*\{job\.job_description\}\s*<\/div>\s*<\/div>\s*\)\}/s;
const newRoleBlock = `
                      {/* JOB ROLE */}
                      {hasRole && (
                        <div>
                          <h2 className="text-lg font-bold mb-2 text-gray-900">Job Role</h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {jobRole}
                          </div>
                        </div>
                      )}`;
content = content.replace(oldDescRegex, newRoleBlock);

// Insert JOB DESCRIPTION Box below the Hero Card
const heroEndRegex = /\{\/\* SIDEBAR \*\/\}/s;
const newDescBox = `
            {/* JOB DESCRIPTION CARD (Full Width Bottom Box) */}
            {hasDescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {cleanDescription}
                </div>
              </div>
            )}
            
            {/* SIDEBAR */}`;
content = content.replace(heroEndRegex, newDescBox);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Success updating job details page layout");