const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

// 1. Add favoriteCompanies state
if (!content.includes('const [favoriteCompanies, setFavoriteCompanies]')) {
  content = content.replace(
    'const [savedJobsData, setSavedJobsData] =\n  useState<any[]>([]);',
    'const [savedJobsData, setSavedJobsData] = useState<any[]>([]);\n  const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);'
  );
}

// 2. Fix savedJobs fetch logic to update BOTH savedJobs and savedJobsData
const oldFetch = `      // Fetch saved jobs from DB
      const { data: savedEntries } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", profile.id);
        
      if (savedEntries && savedEntries.length > 0) {
        const ids = savedEntries.map(e => e.job_id);
        fetchSavedJobs(ids);
      }`;
      
const newFetch = `      // Fetch saved jobs from DB
      const { data: savedEntries } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", profile.id);
        
      if (savedEntries && savedEntries.length > 0) {
        const ids = savedEntries.map(e => e.job_id);
        setSavedJobs(ids); // <-- THIS WAS MISSING!
        fetchSavedJobs(ids);
      } else {
        setSavedJobs([]);
        setSavedJobsData([]);
      }
      
      // Fetch favorite companies from DB
      const { data: favEntries } = await supabase
        .from("favorite_companies")
        .select("company_slug")
        .eq("user_id", profile.id);
        
      if (favEntries && favEntries.length > 0) {
        const slugs = favEntries.map(e => e.company_slug);
        
        // Fetch company data
        const { data: comps } = await supabase.from("companies").select("*").in("slug", slugs);
        
        // Fallback for ghost companies
        const realSlugs = (comps || []).map(c => c.slug);
        const missingSlugs = slugs.filter(s => !realSlugs.includes(s));
        
        let ghostComps: any[] = [];
        if (missingSlugs.length > 0) {
            const { data: jobs } = await supabase.from("jobs").select("firm_name, area, image").not("firm_name", "is", null);
            if (jobs) {
                const uniqueFirms = Array.from(new Map(jobs.map(j => [j.firm_name, j])).values());
                ghostComps = uniqueFirms.filter(f => {
                    const s = f.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return missingSlugs.includes(s);
                }).map(f => ({
                    firm_name: f.firm_name,
                    slug: f.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    city: f.area,
                    logo_url: f.image
                }));
            }
        }
        
        setFavoriteCompanies([...(comps || []), ...ghostComps]);
      }`;

if (content.includes('.from("saved_jobs")')) {
  content = content.replace(oldFetch, newFetch);
}

// 3. Update the favourite companies render block
const oldCompaniesTab = `{/* FAVOURITE COMPANIES */}
    {activeTab === "companies" && (
      <div className="border rounded-3xl p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Favourite Companies</h2>
        <div className="text-gray-500">
          No favourite companies yet
        </div>
      </div>
    )}`;
    
const newCompaniesTab = `{/* FAVOURITE COMPANIES */}
    {activeTab === "companies" && (
      <div className="border rounded-3xl p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Favourite Companies</h2>
        
        {favoriteCompanies.length === 0 ? (
          <p className="text-gray-500">No favourite companies yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteCompanies.map(comp => (
              <Link key={comp.slug} href={\`/companies/\${comp.slug}\`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {comp.logo_url ? <img src={comp.logo_url} alt={comp.firm_name} className="w-full h-full object-cover" /> : <div className="text-gray-400">🏢</div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{comp.firm_name}</h3>
                  <p className="text-sm text-gray-500">{comp.city || 'Location not specified'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )}`;

// Because spacing might be different, let's use a robust replace for the tab content
const companiesRegex = /\{\/\* FAVOURITE COMPANIES \*\/\}\s*\{activeTab === "companies" && \(\s*<div className="border rounded-3xl p-8 bg-gray-50">\s*<h2 className="text-2xl font-bold mb-6">Favourite Companies<\/h2>\s*<div className="text-gray-500">\s*No favourite companies yet\s*<\/div>\s*<\/div>\s*\)\}/;

content = content.replace(companiesRegex, newCompaniesTab);

// 4. In saved jobs render block, we need to ensure the condition uses savedJobsData to be safe
content = content.replace('{savedJobs.length === 0 ? (', '{savedJobsData.length === 0 ? (');

fs.writeFileSync('app/profile/[username]/page.tsx', content);
console.log('Profile page updated');