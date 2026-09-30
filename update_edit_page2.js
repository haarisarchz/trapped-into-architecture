const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

content = content.replace(
`      if (companyId === "new" || companyId === "null") {
        setFirmName(searchParams.get("name") || "");
        setCity(searchParams.get("city") || "");
        setState(searchParams.get("state") || "");
        setLoading(false);
      } else if (companyId) {
        fetchCompany();
      }`,
`      if (companyId === "new" || companyId === "null") {
        fetchGhostCompany(searchParams.get("name") || "");
      } else if (companyId) {
        fetchCompany();
      }`
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);