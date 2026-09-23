const fs = require('fs');
let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Fetch profiles
const fetchProfilesInsert = `    // Fetch jobs to count them
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username");
    const profilesMap: Record<string, any> = {};
    if (profilesData) profilesData.forEach(p => profilesMap[p.id] = p);
    
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("company_id, status, firm_name, city, organization_type, author_id, posted_date");`;

code = code.replace(
  'const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("company_id, status, firm_name, city, organization_type");',
  fetchProfilesInsert
);

// 2. Add creator info to fallback
const fallbackInsert = `fallbackCompanies[job.firm_name] = {
                 id: "fallback-" + job.firm_name,
                 firm_name: job.firm_name,
                 city: job.city || "",
                 organization_type: job.organization_type || "Architecture Firm",
                 is_hidden: false,
                 totalJobs: 0,
                 activeJobs: 0,
                 created_by: job.author_id,
                 created_at: job.posted_date,
                 isFallback: true
              };`;
code = code.replace(
  /fallbackCompanies\[job\.firm_name\] = \{[\s\S]*?isFallback: true\s*\};/,
  fallbackInsert
);

// 3. Attach profiles to merged
const mergedInsert = `let merged = (companiesData || []).map((company: any) => ({
      ...company,
      totalJobs: jobCounts[company.id]?.total || 0,
      activeJobs: jobCounts[company.id]?.active || 0,
      profiles: company.created_by ? profilesMap[company.created_by] : null
    }));`;
code = code.replace(
  /let merged = \(companiesData \|\| \[\]\)\.map\(\(company: any\) => \(\{[\s\S]*?activeJobs: jobCounts\[company\.id\]\?\.active \|\| 0,\s*\}\)\);/,
  mergedInsert
);

// 4. Attach profiles to fallback
const fallbackAttach = `if (merged.length === 0) {
       merged = Object.values(fallbackCompanies).map(c => ({ ...c, profiles: c.created_by ? profilesMap[c.created_by] : null }));
    }`;
code = code.replace(
  `if (merged.length === 0) {
       merged = Object.values(fallbackCompanies);
    }`,
  fallbackAttach
);

// 5. Add TH Created On
code = code.replace(
  '<th className="px-6 py-4 font-semibold">Created By</th>',
  '<th className="px-6 py-4 font-semibold">Created By</th>\n                  <th className="px-6 py-4 font-semibold">Created On</th>'
);

// 6. Add TD Created On
const tdInsert = `<td className="px-6 py-4 text-gray-700">
                        {c.profiles?.display_name || c.profiles?.full_name || c.profiles?.username || "Admin"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                      </td>`;
code = code.replace(
  /<td className="px-6 py-4 text-gray-700">\s*\{c\.profiles\?\.display_name \|\| c\.profiles\?\.full_name \|\| c\.profiles\?\.username \|\| "Admin"\}\s*<\/td>/,
  tdInsert
);

fs.writeFileSync('app/admin/companies/page.tsx', code);
console.log('Fixed companies page');
