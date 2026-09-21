const fs = require('fs');

let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

if (!code.includes('setShowFavoritesOnly(false)')) {
  code = code.replace(/setActiveJobsOnly\(false\);/, 'setActiveJobsOnly(false);\n          setShowFavoritesOnly(false);');
}

// Add CompanyActions inside the card
const targetHtml = `<span
            className={\`
              bg-gray-200
              text-gray-900
              rounded-full

              \${
                viewMode === "dense"
                  ? "px-2 py-0.5 text-[11px]"
                  : "px-3 py-1 text-sm"
              }
            \`}
          >
            {company.totalJobs} Jobs
          </span>`;

if (code.includes('totalJobs} Jobs') && !code.includes('<CompanyActions')) {
  const newHtml = `<span
            className={\`
              bg-gray-200
              text-gray-900
              rounded-full

              \${
                viewMode === "dense"
                  ? "px-2 py-0.5 text-[11px]"
                  : "px-3 py-1 text-sm"
              }
            \`}
          >
            {company.totalJobs} Jobs
          </span>
          
          <CompanyActions slug={company.slug} companyName={company.company} variant="card" />`;
  code = code.split(targetHtml).join(newHtml);
}

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Done updating companies page 2');
