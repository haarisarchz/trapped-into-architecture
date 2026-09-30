const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Update company fetch
content = content.replace(
  '.select("slug")',
  '.select("slug, phone, email, website")'
);

// We need to inject the Contact Details block after the Job Description block.
const jobDescEnd = `                  </div>
                </div>
              )}`;

const contactBlock = `                  </div>
                </div>
              )}
              
              {/* CONTACT DETAILS */}
              {(job.application_email || (company && (company.email || company.phone || company.website))) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Details</h2>
                  <div className="space-y-3 text-lg text-gray-700">
                    {job.application_email && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Email:</span>
                        <a href={\`mailto:\${job.application_email}\`} className="text-blue-600 hover:underline">
                          {job.application_email}
                        </a>
                      </div>
                    )}
                    {!job.application_email && company?.email && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Email:</span>
                        <a href={\`mailto:\${company.email}\`} className="text-blue-600 hover:underline">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company?.phone && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Phone:</span>
                        <a href={\`tel:\${company.phone}\`} className="text-blue-600 hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    )}
                    {company?.website && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Website:</span>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}`;

content = content.replace(jobDescEnd, contactBlock);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated Job page with Contact Details");