const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regexDates = /\{\/\*\s*DATES\s*\*\/\}/;

const newContactAndDates = `
                    {/* CONTACT DETAILS (Moved here per user request) */}
                    {(displayEmail || displayPhone || company?.website) && (
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Contact Details</p>
                        <div className="flex flex-col gap-2">
                          {displayEmail && (
                            <p className="font-semibold text-black break-all">
                              <span className="text-gray-500 font-normal mr-1">Email:</span>
                              <a href={\`mailto:\${displayEmail}\`} className="text-blue-600 hover:underline">{displayEmail}</a>
                            </p>
                          )}
                          {displayPhone && (
                            <p className="font-semibold text-black">
                              <span className="text-gray-500 font-normal mr-1">Phone:</span>
                              <a href={\`tel:\${displayPhone}\`} className="text-blue-600 hover:underline">{displayPhone}</a>
                            </p>
                          )}
                          {company?.website && (
                            <p className="font-semibold text-black break-all">
                              <span className="text-gray-500 font-normal mr-1">Website:</span>
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{company.website}</a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DATES */}`;

content = content.replace(regexDates, newContactAndDates);
fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Added new contact block");