const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

// 1. Add state for companyAddress
content = content.replace(
  `const [country, setCountry] = useState("India");`,
  `const [country, setCountry] = useState("India");\n  const [companyAddress, setCompanyAddress] = useState("");`
);

// 2. Add to loadData
content = content.replace(
  `setArea(data.neighborhood || "");`,
  `setCompanyAddress(data.address || "");\n          setArea(data.neighborhood || "");`
);

// 3. Add to companyPayload
content = content.replace(
  `neighborhood: area,`,
  `address: companyAddress,\n          neighborhood: area,`
);

// 4. Add UI field
const oldLocationUI = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Neighborhood</label>`;

const newLocationUI = `<div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Full Office Address</label>
                <input type="text" placeholder="No 123, 4th Main Road..." value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Neighborhood</label>`;

content = content.replace(oldLocationUI, newLocationUI);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated edit page with company address");