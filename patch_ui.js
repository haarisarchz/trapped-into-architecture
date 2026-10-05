const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Breadcrumb
file = file.replace(
  '<span className="text-black font-medium truncate">{job.position}</span>',
  '<span className="text-black font-medium truncate">{job.firm_name} is hiring {job.position} in {job.city}, {job.state}</span>'
);

// Sidebar blocks overhaul
// Remove POPULAR JOBS entirely
const popRegex = /\{\/\* POPULAR JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;
file = file.replace(popRegex, '');

// Format Position Jobs
const posRegex = /\{\/\* SAME POSITION JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;
const newPos = `{/* SAME POSITION JOBS */}
    {positionJobs.length > 0 && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{job.position} Jobs</h2>
          <Link href={\`/jobs?position=\${encodeURIComponent(job.position)}\`} className="text-sm text-gray-500 hover:text-black transition">View All</Link>
        </div>
        <div className="space-y-3">
          {positionJobs.map((pj: any) => (
            <Link key={pj.id} href={generateJobUrl(pj)} className="block border rounded-xl p-3 hover:border-gray-300 transition">
              <h3 className="font-semibold">{pj.position}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{pj.firm_name} • {pj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}`;
file = file.replace(posRegex, newPos);

// Format City Jobs
const cityRegex = /\{\/\* JOBS IN SAME CITY \*\/\}[\s\S]*?<\/div>\s*\)\}/;
const newCity = `{/* JOBS IN SAME CITY */}
    {cityJobs.length > 0 && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Jobs in {job.city}</h2>
          <Link href={\`/jobs?city=\${encodeURIComponent(job.city)}\`} className="text-sm text-gray-500 hover:text-black transition">View All</Link>
        </div>
        <div className="space-y-3">
          {cityJobs.map((cj: any) => (
            <Link key={cj.id} href={generateJobUrl(cj)} className="block border rounded-xl p-3 hover:border-gray-300 transition">
              <h3 className="font-semibold">{cj.position}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{cj.firm_name} • {cj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}`;
file = file.replace(cityRegex, newCity);

// Format Recent Jobs
const recentRegex = /\{\/\* RECENT JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;
const newRecent = `{/* RECENT JOBS */}
    {recentJobs.length > 0 && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Jobs</h2>
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-black transition">View All</Link>
        </div>
        <div className="space-y-3">
          {recentJobs.map((rj: any) => (
            <Link key={rj.id} href={generateJobUrl(rj)} className="block border rounded-xl p-3 hover:border-gray-300 transition">
              <h3 className="font-semibold">{rj.position}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{rj.firm_name} • {rj.city}</p>
            </Link>
          ))}
        </div>
      </div>
    )}`;
file = file.replace(recentRegex, newRecent);

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched UI.");
