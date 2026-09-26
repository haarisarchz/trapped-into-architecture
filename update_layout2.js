const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* QUALIFICATIONS \*\/\}\s*\{hasQualifications && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">\s*<h2 className="text-xl font-bold mb-4 text-gray-900">Qualifications<\/h2>\s*<p className="text-gray-700 leading-relaxed">\s*\{Array\.isArray\(job\.qualifications\) \? job\.qualifications\.join\(", "\) : job\.qualifications\}\s*<\/p>\s*<\/div>\s*\)\}\s*\{\/\* SKILLS \*\/\}\s*\{hasSkills && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">\s*<h2 className="text-xl font-bold mb-4 text-gray-900">Skills Required<\/h2>\s*<div className="flex flex-wrap gap-2">\s*\{job\.skills_required\.filter\(Boolean\)\.map\(\(skill: string\) => \(\s*<span key=\{skill\.trim\(\)\} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">\s*\{skill\.trim\(\)\}\s*<\/span>\s*\)\)\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{\/\* DESCRIPTION \*\/\}\s*\{hasDescription && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">\s*<h2 className="text-xl font-bold mb-4 text-gray-900">Job Description<\/h2>\s*<div className="text-gray-700 leading-8 whitespace-pre-line">\s*\{job\.job_description\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{\/\* DATES \*\/\}\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">\s*<h2 className="text-xl font-bold mb-4 text-gray-900">Job Details<\/h2>\s*<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">\s*\{job\.posted_date && \(\s*<div>\s*<p className="text-sm text-gray-500">Posted Date<\/p>\s*<p className="font-semibold mt-1">\{job\.posted_date\}<\/p>\s*<\/div>\s*\)\}\s*\{job\.last_date_to_apply && \(\s*<div>\s*<p className="text-sm text-gray-500">Last Date To Apply<\/p>\s*<p className="font-semibold mt-1">\{job\.last_date_to_apply\}<\/p>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>/s;

const replacement = `                  </div>

                  {/* ADDITIONAL DETAILS BUNDLED INTO HERO CARD */}
                  <div className="mt-10 space-y-8 border-t border-gray-100 pt-8">
                    
                    {/* QUALIFICATIONS */}
                    {hasQualifications && (
                      <div>
                        <h2 className="text-xl font-bold mb-3 text-gray-900">Qualifications</h2>
                        <p className="text-gray-700 leading-relaxed">
                          {Array.isArray(job.qualifications) ? job.qualifications.join(", ") : job.qualifications}
                        </p>
                      </div>
                    )}

                    {/* SKILLS */}
                    {hasSkills && (
                      <div>
                        <h2 className="text-xl font-bold mb-3 text-gray-900">Skills Required</h2>
                        <div className="flex flex-wrap gap-2">
                          {job.skills_required.filter(Boolean).map((skill: string) => (
                            <span key={skill.trim()} className="bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DESCRIPTION */}
                    {hasDescription && (
                      <div>
                        <h2 className="text-xl font-bold mb-3 text-gray-900">Job Description</h2>
                        <div className="text-gray-700 leading-8 whitespace-pre-line">
                          {job.job_description}
                        </div>
                      </div>
                    )}

                    {/* DATES */}
                    <div>
                      <h2 className="text-xl font-bold mb-3 text-gray-900">Job Details</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {job.posted_date && (
                          <div>
                            <p className="text-sm text-gray-500">Posted Date</p>
                            <p className="font-semibold mt-1">{job.posted_date}</p>
                          </div>
                        )}
                        {job.last_date_to_apply && (
                          <div>
                            <p className="text-sm text-gray-500">Last Date To Apply</p>
                            <p className="font-semibold mt-1">{job.last_date_to_apply}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  
  // also change image width to be larger on desktop, e.g. w-[45%] or w-[50%] to make it match the height better
  content = content.replace('md:w-[38%]', 'md:w-[45%]');
  
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Layout updated successfully");
} else {
  console.log("Regex didn't match.");
}