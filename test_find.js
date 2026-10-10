const fs = require('fs');
let file = 'components/home/InteractiveHome.tsx';
let content = fs.readFileSync(file, 'utf8');

// Restore Explore Companies to White
const newCompanies = `<div className="w-full bg-white">
        <div className="w-full max-w-7xl mx-auto border-t-[3px] border-black my-0"></div>
      </div>

      {/* 4. COMPANIES SECTION (Black Background) */}
      <section className="py-12 px-6 lg:px-12 bg-black w-full text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Explore Companies</h2>
            
            <div className="flex bg-gray-900 p-1 rounded-full w-fit border border-gray-800">
              <button onClick={() => setCompanyTab("latest")} className={\`px-4 py-2 rounded-full text-sm font-medium transition \${companyTab === "latest" ? "bg-gray-700 shadow text-white" : "text-gray-400 hover:text-white"}\`}>Latest</button>
              <button onClick={() => setCompanyTab("popular")} className={\`px-4 py-2 rounded-full text-sm font-medium transition \${companyTab === "popular" ? "bg-gray-700 shadow text-white" : "text-gray-400 hover:text-white"}\`}>Popular</button>
              <button onClick={() => setCompanyTab("most-jobs")} className={\`px-4 py-2 rounded-full text-sm font-medium transition \${companyTab === "most-jobs" ? "bg-gray-700 shadow text-white" : "text-gray-400 hover:text-white"}\`}>Most Jobs Posted</button>
            </div>
          </div>

          {displayCompanies.length === 0 ? (
            <div className="bg-gray-900 p-12 rounded-3xl border border-gray-800 text-center text-gray-400">
              No companies listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {displayCompanies.map((company) => (
                <Link 
                  href={\`/companies/\${company.slug}\`}
                  key={company.slug}
                  className="bg-gray-900 hover:bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition group border border-gray-800 hover:border-gray-700 aspect-square shadow-sm"
                >
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-3 overflow-hidden shadow-sm">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-gray-300 w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-100 text-sm line-clamp-2">{company.firm_name}</h3>
                  {company.city && <p className="text-xs text-gray-500 mt-1">{company.city}</p>}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/companies" className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all">
              View All Companies <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>`;

// Target string we expect to replace
if(content.includes('bg-black w-full text-white"')) {
    console.log("Black company section found");
}
