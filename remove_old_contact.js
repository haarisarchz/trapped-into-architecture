const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const oldContactBlock = `              {/* CONTACT DETAILS */}
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

content = content.replace(oldContactBlock, "");

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Removed old contact block");