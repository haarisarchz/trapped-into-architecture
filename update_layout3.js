const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const anchor1 = `                    <div className="ml-auto flex items-center gap-4">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="statistic" />
                      <ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} initialShares={job.share_count || 0} variant="statistic" />
                    </div>
                  </div>

                </div>
              </div>
            </div>`;

const anchor2 = `                        {job.last_date_to_apply && (
                          <div>
                            <p className="text-sm text-gray-500">Last Date To Apply</p>
                            <p className="font-semibold mt-1">{job.last_date_to_apply}</p>
                          </div>
                        )}
                      </div>
            </div>`;

const startIndex = content.indexOf(anchor1);
const endIndex = content.indexOf(anchor2) + anchor2.length;

if (startIndex !== -1 && endIndex > startIndex) {
  content = content.substring(0, startIndex) + `                    <div className="ml-auto flex items-center gap-4">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="statistic" />
                      <ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} initialShares={job.share_count || 0} variant="statistic" />
                    </div>
                  </div>

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
            </div>` + content.substring(endIndex);
  
  content = content.replace('md:w-[38%]', 'md:w-[45%]');
  
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Success Layout Update");
} else {
  console.log("Not found indexes");
}