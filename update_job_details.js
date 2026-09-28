const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /let cleanDescription = job\.job_description \|\| "";\n\s*if \(cleanDescription\.startsWith\("\*\*Job Role:\*\*"\)\) \{\n\s*const parts = cleanDescription\.split\("\\n\\n"\);\n\s*if \(parts\.length > 1\) \{\n\s*jobRole = parts\[0\]\.replace\("\*\*Job Role:\*\*", ""\)\.trim\(\);\n\s*cleanDescription = parts\.slice\(1\)\.join\("\\n\\n"\);\n\s*\}\n\s*\}/;

const replace = `let cleanDescription = job.job_description || "";
      let jobVacancies = "";
      
      // Parse Job Role
      if (cleanDescription.startsWith("**Job Role:**")) {
        const parts = cleanDescription.split("\\n\\n");
        if (parts.length > 1) {
          jobRole = parts[0].replace("**Job Role:**", "").trim();
          cleanDescription = parts.slice(1).join("\\n\\n");
        } else {
          jobRole = cleanDescription.replace("**Job Role:**", "").trim();
          cleanDescription = "";
        }
      }
      
      // Parse Number of Positions (could be at start now if no Job Role)
      if (cleanDescription.startsWith("**Number of Positions:**")) {
        const parts = cleanDescription.split("\\n\\n");
        if (parts.length > 1) {
          jobVacancies = parts[0].replace("**Number of Positions:**", "").trim();
          cleanDescription = parts.slice(1).join("\\n\\n");
        } else {
          jobVacancies = cleanDescription.replace("**Number of Positions:**", "").trim();
          cleanDescription = "";
        }
      }`;

content = content.replace(regex, replace);

// Now let's inject it into the UI.
const regexUI = /\{jobRole\}\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;
const replaceUI = `{jobRole}
                            </div>
                          </div>
                        )}
                        {jobVacancies && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                              <span className="text-xl">👥</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Number of Positions</p>
                              <p className="font-semibold text-black">{jobVacancies}</p>
                            </div>
                          </div>
                        )}`;

content = content.replace(regexUI, replaceUI);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Job Details page to render Number of Positions");