const fs = require('fs');

let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const oldCompaniesQuery = /const \{ data: companiesData, error: companiesError \} = await supabase\s*\.from\("companies"\)\s*\.select\("\*, profiles\(display_name, full_name, username\)"\);/;

const newCompaniesQuery = `    const { data: companiesData, error: companiesError } = await supabase
      .from("companies")
      .select("*");
      // Intentionally removed profiles relationship to prevent schema crash before migration`;

if (code.match(oldCompaniesQuery)) {
  code = code.replace(oldCompaniesQuery, newCompaniesQuery);
  fs.writeFileSync('app/admin/companies/page.tsx', code);
}
