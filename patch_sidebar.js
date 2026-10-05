const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Fix Top Spacing & Breadcrumb Gap
file = file.replace(
  '<section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">',
  '<section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">'
);
file = file.replace(
  '<nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">',
  '<nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">'
);

// 2. Fix Job Position Normalization logic
// We need to inject cleanPos before the cityJobs declaration
const filterTarget = 'const cityJobs = jobs.filter((j: any) => j.city === job.city && j.id !== job.id).slice(0, 3);';
const newFilterLogic = `let cleanPos = job.position;
  const pLower = cleanPos.toLowerCase();
  if (pLower.includes("junior architect")) cleanPos = "Junior Architect";
  else if (pLower.includes("senior architect")) cleanPos = "Senior Architect";
  else if (pLower.includes("architect")) cleanPos = "Architect";
  else if (cleanPos.includes("/") || cleanPos.includes("-")) cleanPos = cleanPos.split(/[\\/-]/)[0].trim();

  const cityJobs = jobs.filter((j: any) => j.city === job.city && j.id !== job.id).slice(0, 3);
  const positionJobs = jobs.filter((j: any) => j.position.toLowerCase().includes(cleanPos.toLowerCase()) && j.id !== job.id).slice(0, 3);`;

// Replace both cityJobs and positionJobs declarations
const filterRegex = /const cityJobs = .*?;\s*const positionJobs = .*?;/;
file = file.replace(filterRegex, newFilterLogic);

// 3. Overhaul Sidebar Sections (Order: City, Position, Recent) and tighten spacing
const sidebarRegex = /\{\/\* SAME POSITION JOBS \*\/\}[\s\S]*?\{\/\* RECENT JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;

const newSidebar = `{/* 1. JOBS IN SAME CITY */}
    {cityJobs.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Jobs in {job.city}</h2>
          <Link href={\`/jobs?city=\${encodeURIComponent(job.city)}\`} className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="space-y-2">
          {cityJobs.map((cj: any) => (
            <Link key={cj.id} href={generateJobUrl(cj)} className="block border border-gray-100 rounded-lg p-2 hover:border-gray-300 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-sm">{cj.position}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{cj.firm_name} • {cj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 2. SAME POSITION JOBS */}
    {positionJobs.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">{cleanPos} Jobs</h2>
          <Link href={\`/jobs?position=\${encodeURIComponent(cleanPos)}\`} className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="space-y-2">
          {positionJobs.map((pj: any) => (
            <Link key={pj.id} href={generateJobUrl(pj)} className="block border border-gray-100 rounded-lg p-2 hover:border-gray-300 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-sm">{pj.position}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{pj.firm_name} • {pj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 3. RECENT JOBS */}
    {recentJobs.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Recent Jobs</h2>
          <Link href="/jobs" className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="space-y-2">
          {recentJobs.map((rj: any) => (
            <Link key={rj.id} href={generateJobUrl(rj)} className="block border border-gray-100 rounded-lg p-2 hover:border-gray-300 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-sm">{rj.position}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{rj.firm_name} • {rj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}`;

file = file.replace(sidebarRegex, newSidebar);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched sidebar spacing and ordering.");
