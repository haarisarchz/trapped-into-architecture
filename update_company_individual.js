const fs = require('fs');

let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

if (!code.includes('import CompanyActions')) {
  code = code.replace(
    /import \{ Briefcase \}/,
    'import CompanyActions from "@/components/CompanyActions";\nimport { Briefcase }'
  );
  // fallback if not matched
  if (!code.includes('import CompanyActions')) {
    code = code.replace(/import Link from \"next\/link\";/, 'import Link from "next/link";\nimport CompanyActions from "@/components/CompanyActions";');
  }
}

const targetHtml = `<span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                  {company.organization_type || "Firm"}
                </span>
              </div>
            </div>`;

if (code.includes(targetHtml)) {
  const newHtml = `<span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                  {company.organization_type || "Firm"}
                </span>
              </div>
              
              <div className="md:ml-auto shrink-0 pt-2 md:pt-0">
                <CompanyActions slug={slug} companyName={company.firm_name} variant="page" />
              </div>
            </div>`;
  code = code.split(targetHtml).join(newHtml);
}

fs.writeFileSync('app/companies/[slug]/page.tsx', code);
console.log('Done updating individual company page');
