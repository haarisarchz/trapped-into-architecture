const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const oldSidebar = `<aside className="space-y-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">

  {/* 1. JOBS IN SAME CITY */}
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
              <p className="text-gray-500 text-xs mt-0.5">{cj.firm_name}  {cj.city}</p>
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
              <p className="text-gray-500 text-xs mt-0.5">{pj.firm_name}  {pj.city}</p>
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
              <p className="text-gray-500 text-xs mt-0.5">{rj.firm_name}  {rj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

  </aside>`;

// Using regex to replace the aside safely because the character '' might be mangled in different readings
const regex = /<aside className="space-y-6[\s\S]*?<\/aside>/;

const newSidebar = `<aside className="space-y-4 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">

  {/* 1. JOBS IN SAME CITY */}
    {cityJobs.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Jobs in {job.city}</h2>
          <Link href={\`/jobs?city=\${encodeURIComponent(job.city)}\`} className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="flex flex-col">
          {cityJobs.map((cj: any) => (
            <Link key={cj.id} href={generateJobUrl(cj)} className="py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
              <h3 className="font-bold text-sm text-gray-900">{cj.firm_name}</h3>
              <p className="text-gray-500 text-xs mt-1">{cj.position} {cj.city ? \`| \${cj.city}\` : ''}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 2. SAME POSITION JOBS */}
    {positionJobs.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">{cleanPos} Jobs</h2>
          <Link href={\`/jobs?position=\${encodeURIComponent(cleanPos)}\`} className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="flex flex-col">
          {positionJobs.map((pj: any) => (
            <Link key={pj.id} href={generateJobUrl(pj)} className="py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
              <h3 className="font-bold text-sm text-gray-900">{pj.firm_name}</h3>
              <p className="text-gray-500 text-xs mt-1">{pj.position} {pj.city ? \`| \${pj.city}\` : ''}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* 3. RECENT JOBS */}
    {recentJobs.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Recent Jobs</h2>
          <Link href="/jobs" className="text-xs text-blue-600 hover:underline transition">View All</Link>
        </div>
        <div className="flex flex-col">
          {recentJobs.map((rj: any) => (
            <Link key={rj.id} href={generateJobUrl(rj)} className="py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
              <h3 className="font-bold text-sm text-gray-900">{rj.firm_name}</h3>
              <p className="text-gray-500 text-xs mt-1">{rj.position} {rj.city ? \`| \${rj.city}\` : ''}</p>
            </Link>
          ))}
        </div>
      </div>
    )}

  </aside>`;

file = file.replace(regex, newSidebar);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched sidebar UI again.");
