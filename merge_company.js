const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const startIndex = c.indexOf('{/* ================= ORGANIZATION INFORMATION ================= */}');
const endIndex = c.indexOf('{/* ================= SCHEDULE MODAL ================= */}');

const replaceStr = `{/* ================= ORGANIZATION INFORMATION ================= */}
              <div className="mt-6 mb-4">
                <h2 className="text-xl font-bold border-b border-gray-100 pb-2">
                  Company Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium">{organizationType} Logo</label>
                  <input type="file" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Website</label>
                  <input type="url" placeholder="https://" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Email</label>
                  <input type="email" placeholder="contact@firm.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Phone</label>
                  <input type="text" placeholder="+123..." value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="md:col-span-2 md:row-span-2">
                  <label className="block mb-1.5 text-sm font-medium">About {organizationType}</label>
                  <textarea rows={5} placeholder={\`Write about the \${organizationType.toLowerCase()}...\`} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none h-[124px]" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Principal Architect / Head</label>
                  <input type="text" placeholder="e.g. Jane Doe" value={principalArchitect} onChange={(e) => setPrincipalArchitect(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Employee Size</label>
                  <select value={employeeSize} onChange={(e) => setEmployeeSize(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                    <option value="">Select Size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Founded Year</label>
                  <input type="number" placeholder="YYYY" min="1800" max={new Date().getFullYear()} value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-6">
                <div>
                  <label className="block mb-1.5 text-sm font-medium">X (Twitter)</label>
                  <input type="url" placeholder="URL" value={companyTwitter} onChange={(e) => setCompanyTwitter(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Facebook</label>
                  <input type="url" placeholder="URL" value={companyFacebook} onChange={(e) => setCompanyFacebook(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Instagram</label>
                  <input type="url" placeholder="URL" value={companyInstagram} onChange={(e) => setCompanyInstagram(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">LinkedIn</label>
                  <input type="url" placeholder="URL" value={companyLinkedin} onChange={(e) => setCompanyLinkedin(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
              </div>
            </div>
            `;

c = c.substring(0, startIndex) + replaceStr + c.substring(endIndex);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done company profile section');