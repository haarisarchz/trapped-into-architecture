const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Rebuild the left column (Image + Save/Share)
const leftColOld = `{/* IMAGE */}
                {job.image && (
                  <div className="md:w-[45%] bg-gray-50 flex items-start justify-center p-4">
                    <img
                      src={job.image}
                      alt={job.position}
                      className="w-full object-contain rounded-xl"
                    />
                  </div>
                )}`;

const leftColNew = `{/* LEFT COLUMN: IMAGE + SOCIAL ACTIONS */}
                <div className="md:w-[45%] bg-gray-50 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
                  {job.image ? (
                    <div className="flex-1 flex items-start justify-center p-6 sm:p-8">
                      <img
                        src={job.image}
                        alt={job.position}
                        className="w-full object-contain rounded-xl sticky top-8"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-gray-400 italic">
                      No Image Available
                    </div>
                  )}

                  {/* SAVE / SHARE (Moved from main content) */}
                  <div className="p-6 bg-gray-100 border-t border-gray-200 flex flex-col items-center justify-center gap-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="button" />
                      <ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} initialShares={job.share_count || 0} variant="button" />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="statistic" />
                      <ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} initialShares={job.share_count || 0} variant="statistic" />
                    </div>
                  </div>
                </div>`;

// 2. Remove the old CTA BUTTONS block entirely, we'll place the Apply/Email at the bottom
const ctaRegex = /\{\/\* CTA BUTTONS \*\/\}.*?<div className="ml-auto flex items-center gap-4">.*?<\/div>\s*<\/div>/s;

// 3. Update Job Description heading and Job Details
const descOld = `<h2 className="text-xl font-bold mb-3 text-gray-900">Job Description</h2>`;
const descNew = `<h2 className="text-lg font-bold mb-3 text-gray-900">Job Description</h2>`;

const datesOld = `<h2 className="text-xl font-bold mb-3 text-gray-900">Job Details</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">`;
const datesNew = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">`;

// 4. We will append the Apply/Email buttons to the END of the right column.
// First, let's locate the end of the right column content (after DATES).
const datesEndOld = `                        {hasSource && (
                          <div>
                            <p className="text-sm text-gray-500">Source</p>
                            <p className="font-semibold mt-1">{job.source}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>`;
const datesEndNew = `                        {hasSource && (
                          <div>
                            <p className="text-sm text-gray-500">Source</p>
                            <p className="font-semibold mt-1">{job.source}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* APPLY / EMAIL NOW (Moved to bottom center) */}
                    <div className="pt-10 mt-10 border-t border-gray-100 flex justify-center w-full">
                      {isExpired ? (
                        <button disabled className="bg-gray-200 text-gray-500 px-8 py-3.5 rounded-xl text-lg font-bold cursor-not-allowed w-full sm:w-auto text-center">
                          Post Expired
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                          {job.apply_link && (
                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-10 py-3.5 rounded-xl text-lg font-bold hover:bg-gray-800 transition w-full sm:w-auto text-center shadow-md">
                              Apply Now +'
                            </a>
                          )}
                          {job.application_email && (
                            <a href={\`mailto:\${job.application_email}?subject=Application for \${encodeURIComponent(job.position)} at \${encodeURIComponent(job.firm_name)}\`} className="bg-white text-black px-10 py-3.5 rounded-xl text-lg font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm">
                              Email Now
                            </a>
                          )}
                          {!job.apply_link && !job.application_email && (
                            <span className="text-gray-500 text-sm italic">No application method provided</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>`;

// Apply replacements
if (content.includes(leftColOld)) content = content.replace(leftColOld, leftColNew);
else console.log("leftColOld not found");

if (ctaRegex.test(content)) content = content.replace(ctaRegex, "");
else console.log("ctaRegex not found");

if (content.includes(descOld)) content = content.replace(descOld, descNew);
else console.log("descOld not found");

if (content.includes(datesOld)) content = content.replace(datesOld, datesNew);
else console.log("datesOld not found");

if (content.includes(datesEndOld)) content = content.replace(datesEndOld, datesEndNew);
else console.log("datesEndOld not found");

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Rewrite completed.");