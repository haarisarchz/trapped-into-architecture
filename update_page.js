const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  '.order("created_at", { ascending: false })',
  '.order("posted_date", { ascending: false })'
);

const companyLogic = `
  // Fetch real companies
  const { data: allRealCompanies } = await supabase.from('companies').select('*');
  const groupedCompanies = {};
  const idToName = {};

  (allRealCompanies || []).forEach(comp => {
    if (!comp.firm_name) return;
    groupedCompanies[comp.firm_name] = {
      firm_name: comp.firm_name,
      slug: comp.slug || comp.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      city: comp.city || '',
      logo_url: comp.logo_url || '',
      organization_type: comp.organization_type || 'Architecture Firm'
    };
    if (comp.id) idToName[comp.id] = comp.firm_name;
  });

  const { data: allPublishedJobs } = await supabase.from('jobs').select('firm_name, company_id, city, organization_type').eq('status', 'published');
  
  (allPublishedJobs || []).forEach(job => {
    let name = job.firm_name;
    if (job.company_id && idToName[job.company_id]) name = idToName[job.company_id];
    if (!name) return;
    if (!groupedCompanies[name]) {
      groupedCompanies[name] = {
        firm_name: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        city: job.city || '',
        organization_type: job.organization_type || 'Architecture Firm',
        logo_url: ''
      };
    }
  });

  const recentCompanies = Object.values(groupedCompanies).slice(0, 6);
`;

code = code.replace(/const \{ data: recentCompanies \} = await supabase[\s\S]*?\.limit\(6\);/, companyLogic);

fs.writeFileSync('app/page.tsx', code);
