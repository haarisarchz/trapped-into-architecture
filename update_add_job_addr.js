const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add state for companyAddress
content = content.replace(
  `const [companyDescription, setCompanyDescription] = useState("");`,
  `const [companyAddress, setCompanyAddress] = useState("");\n  const [companyDescription, setCompanyDescription] = useState("");`
);

// 2. Add to loadCompanyData
content = content.replace(
  `setCompanyDescription(data.description || "");`,
  `setCompanyAddress(data.address || "");\n    setCompanyDescription(data.description || "");`
);

// 3. Add to dependencies of isCompanyProfileDirty
content = content.replace(
  `companyLogo, companyDescription`,
  `companyAddress, companyLogo, companyDescription`
);

// 4. Add to Autocomplete fetch (comp block)
content = content.replace(
  `setCompanyDescription(comp.description || "");`,
  `setCompanyAddress(comp.address || "");\n             setCompanyDescription(comp.description || "");`
);

// 5. Add to handleSaveCompany -> companyPayload
content = content.replace(
  `neighborhood: area || "",`,
  `address: companyAddress || "",\n        neighborhood: area || "",`
);

// 6. Add to handlePublishJob -> companyPayload
content = content.replace(
  `neighborhood: area,`,
  `address: companyAddress,\n            neighborhood: area,`
);

// 7. Add to setSelectedCompanyId inside job-form on select
content = content.replace(
  `setCompanyDescription(record.description || "");`,
  `setCompanyAddress(record.address || "");\n        setCompanyDescription(record.description || "");`
);

// 8. Add the UI input inside the Company Profile Section
const uiInsertPoint = `<div>
                    <label className="block mb-1.5 text-sm font-medium">Principal Architect / Head</label>
                    <input type="text" placeholder="John Doe..." value={principalArchitect} onChange={(e) => setPrincipalArchitect(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>`;

const newUI = `<div>
                    <label className="block mb-1.5 text-sm font-medium">Principal Architect / Head</label>
                    <input type="text" placeholder="John Doe..." value={principalArchitect} onChange={(e) => setPrincipalArchitect(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium">Full Office Address</label>
                    <input type="text" placeholder="No 123, 4th Main Road..." value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>`;

content = content.replace(uiInsertPoint, newUI);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job with company address");