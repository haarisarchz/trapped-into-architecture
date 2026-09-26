const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const startIndex = c.indexOf('{/* JOB & APPLICATION DETAILS */}');
const endIndex = c.indexOf('{/* MEDIA */}');

const replaceStr = `{/* JOB & APPLICATION DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
              
              {/* Left Column: Job Details */}
              <div className="lg:col-span-4">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                  Job Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Employment Type <span className="text-red-500 text-xl font-bold">*</span></label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="" disabled>Select Employment Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Workplace Type</label>
                    <select value={workplaceType} onChange={(e) => setWorkplaceType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Application Details */}
              <div className="lg:col-span-8">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                  Application Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Date Type</label>
                    <select value={dateType} onChange={(e) => setDateType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="expiry">Expiry Date</option>
                      <option value="apply">Last Date To Apply</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">{dateType === "apply" ? "Last Date To Apply" : "Expiry Date"}</label>
                    <input type="date" value={dateType === "apply" ? lastDateToApply : postExpiryDate} onChange={(e) => { if (dateType === "apply") { setLastDateToApply(e.target.value); } else { setPostExpiryDate(e.target.value); } }} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Source Link</label>
                    <input type="text" placeholder="https://..." value={source} onChange={(e) => setSource(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Button Type <span className="text-red-500 text-xl font-bold">*</span></label>
                    <select value={applicationType} onChange={(e) => setApplicationType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="apply">Apply Now</option>
                      <option value="email">Email Now</option>
                    </select>
                  </div>
                  {applicationType === "apply" ? (
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium">Apply Link <span className="text-red-500 text-xl font-bold">*</span></label>
                      <input type="text" placeholder="https://..." value={apply_link} onChange={(e) => setapply_link(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium">Application Email <span className="text-red-500 text-xl font-bold">*</span></label>
                      <input type="email" placeholder="careers@firm.com" value={application_email} onChange={(e) => setapplication_email(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            `;
c = c.substring(0, startIndex) + replaceStr + c.substring(endIndex);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Restructured Job Details');