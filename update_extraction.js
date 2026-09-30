const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regexExtraction = `
    const hasSalary = job.salary && job.salary.trim() && job.salary.trim().toLowerCase() !== "not disclosed";
    const hasExperience = job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));
    const hasSource = job.source && job.source.trim();
    
    // Auto-extract contact details for older jobs
    const phoneRegex = /(?:\+?91|0)?\s*([6-9]\d{9})/g;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    
    let extractedPhones = [];
    let match;
    while ((match = phoneRegex.exec(cleanDescription)) !== null) {
      extractedPhones.push(match[1]);
    }
    const fallbackPhone = extractedPhones.length > 0 ? extractedPhones[0] : null;
    
    let extractedEmails = [];
    while ((match = emailRegex.exec(cleanDescription)) !== null) {
      extractedEmails.push(match[1]);
    }
    const fallbackEmail = extractedEmails.length > 0 ? extractedEmails[0] : null;
    
    const displayEmail = job.application_email || company?.email || fallbackEmail;
    const displayPhone = company?.phone || fallbackPhone;
`;

content = content.replace(
    '    const hasSalary = job.salary && job.salary.trim() && job.salary.trim().toLowerCase() !== "not disclosed";\n    const hasExperience = job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));\n    const hasSource = job.source && job.source.trim();',
    regexExtraction
);

const contactDetailsBlockOld = `              {/* CONTACT DETAILS */}
              {(job.application_email || (company && (company.email || company.phone || company.website))) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Details</h2>
                  <div className="space-y-4 text-lg text-gray-700">
                    {job.application_email && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Email:</span>
                        <a href={\`mailto:\${job.application_email}\`} className="text-blue-600 hover:underline break-all">
                          {job.application_email}
                        </a>
                      </div>
                    )}
                    {!job.application_email && company?.email && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Email:</span>
                        <a href={\`mailto:\${company.email}\`} className="text-blue-600 hover:underline break-all">
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
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}`;

const contactDetailsBlockNew = `              {/* CONTACT DETAILS */}
              {(displayEmail || displayPhone || company?.website) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Details</h2>
                  <div className="space-y-4 text-lg text-gray-700">
                    {displayEmail && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Email:</span>
                        <a href={\`mailto:\${displayEmail}\`} className="text-blue-600 hover:underline break-all">
                          {displayEmail}
                        </a>
                      </div>
                    )}
                    {displayPhone && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Phone:</span>
                        <a href={\`tel:\${displayPhone}\`} className="text-blue-600 hover:underline">
                          {displayPhone}
                        </a>
                      </div>
                    )}
                    {company?.website && (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-black">Website:</span>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}`;

content = content.replace(contactDetailsBlockOld, contactDetailsBlockNew);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated with extraction logic");