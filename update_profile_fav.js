const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

if (!content.includes('favoriteCompanies')) {
    content = content.replace(
        'const [savedJobs, setSavedJobs] = useState<any[]>([]);',
        'const [savedJobs, setSavedJobs] = useState<any[]>([]);\n  const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);'
    );
    
    const fetchSavedJobsCall = `      if (savedEntries && savedEntries.length > 0) {
        const ids = savedEntries.map(e => e.job_id);
        fetchSavedJobs(ids);
      }`;
      
    const addFavFetch = `      if (savedEntries && savedEntries.length > 0) {
        const ids = savedEntries.map(e => e.job_id);
        fetchSavedJobs(ids);
      }

      const { data: favEntries, error: favError } = await supabase
        .from("favorite_companies")
        .select("company_slug")
        .eq("user_id", profile.id);
        
      if (favEntries && favEntries.length > 0) {
        const slugs = favEntries.map((e: any) => e.company_slug);
        
        // 1. Fetch real companies
        const { data: realComps } = await supabase.from('companies').select('id, firm_name, slug, logo_url, city, state, organization_type').in('slug', slugs);
        const foundSlugs = new Set((realComps || []).map((c: any) => c.slug));
        const missingSlugs = slugs.filter((s: any) => !foundSlugs.has(s));
        
        // 2. Fetch ghost companies
        let ghostComps: any[] = [];
        if (missingSlugs.length > 0) {
          const { data: jobsData } = await supabase.from('jobs').select('firm_name, city, state, organization_type, image').eq('status', 'published');
          if (jobsData) {
             const uniqueGhosts = new Map();
             jobsData.forEach((job: any) => {
                if (job.firm_name) {
                  const jobSlug = job.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  if (missingSlugs.includes(jobSlug) && !uniqueGhosts.has(jobSlug)) {
                     uniqueGhosts.set(jobSlug, {
                        firm_name: job.firm_name,
                        slug: jobSlug,
                        logo_url: job.image,
                        city: job.city,
                        state: job.state,
                        organization_type: job.organization_type
                     });
                  }
                }
             });
             ghostComps = Array.from(uniqueGhosts.values());
          }
        }
        
        setFavoriteCompanies([...(realComps || []), ...ghostComps]);
      }`;
      
    content = content.replace(fetchSavedJobsCall, addFavFetch);
    
    // Replace the empty activeTab === "companies" content
    const oldFavTab = `{activeTab === "companies" && (
        <div className="border rounded-3xl p-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Favourite Companies</h2>
          <div className="text-gray-500">
            No favourite companies yet
          </div>
        </div>
      )}`;
      
    const newFavTab = `{activeTab === "companies" && (
        <div className="border rounded-3xl p-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Favourite Companies</h2>
          {favoriteCompanies.length === 0 ? (
            <div className="text-gray-500">No favourite companies yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteCompanies.map(company => (
                <Link href={\`/companies/\${company.slug}\`} key={company.slug} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-500 transition line-clamp-1">
                      {company.firm_name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{company.organization_type}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}`;
      
    content = content.replace(oldFavTab, newFavTab);
    
    fs.writeFileSync('app/profile/[username]/page.tsx', content);
}