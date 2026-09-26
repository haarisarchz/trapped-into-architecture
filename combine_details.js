const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// Combine the two sections
const regex = /\{\/\* JOB DETAILS \*\/\}\s*<div>\s*<h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">\s*Job Details\s*<\/h2>\s*<div className="grid md:grid-cols-3 gap-4 mb-6">\s*<div>\s*<label className="block mb-1\.5 text-sm font-medium">Employment Type <span className="text-red-500 text-xl font-bold">\*<\/span><\/label>\s*<select\s*value=\{employmentType\}\s*onChange=\{\(e\) => setEmploymentType\(e\.target\.value\)\}\s*className="w-full border rounded-xl px-3 py-2\.5 text-sm"\s*>\s*<option value="" disabled>Select Employment Type<\/option>\s*<option value="Full-time">Full-time<\/option>\s*<option value="Part-time">Part-time<\/option>\s*<option value="Contract">Contract<\/option>\s*<option value="Temporary">Temporary<\/option>\s*<option value="Freelance">Freelance<\/option>\s*<option value="Internship">Internship<\/option>\s*<\/select>\s*<\/div>\s*<div>\s*<label className="block mb-1\.5 text-sm font-medium">Workplace Type<\/label>\s*<select\s*value=\{workplaceType\}\s*onChange=\{\(e\) => setWorkplaceType\(e\.target\.value\)\}\s*className="w-full border rounded-xl px-3 py-2\.5 text-sm"\s*>\s*<option value="On-site">On-site<\/option>\s*<option value="Hybrid">Hybrid<\/option>\s*<option value="Remote">Remote<\/option>\s*<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* APPLICATION \*\/\}\s*<div>\s*<h2 className="text-xl font-bold mb-4">\s*Application Details\s*<\/h2>\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\s*\{\/\* SOURCE LINK \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g;

c = c.replace(regex, `{/* APPLICATION DETAILS */}
            <div>
              <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                Job & Application Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
`);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Combined Job and Application Details');