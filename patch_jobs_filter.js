const fs = require('fs');

let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// 1. Add datePosted state
if (!content.includes('const [datePosted, setDatePosted]')) {
  content = content.replace('const [excludeExpired, setExcludeExpired] =', 'const [datePosted, setDatePosted] = useState("all");\n  const [excludeExpired, setExcludeExpired] =');
}

// 2. Add filter logic for datePosted
const filterTarget = `const expiryMatch =
      !excludeExpired ||
      !job.post_expiry_date ||
      new Date(job.post_expiry_date) >=
        new Date();`;
        
const dateFilterLogic = `
    let dateMatch = true;
    if (datePosted !== "all") {
      const postedDate = job.posted_date ? new Date(job.posted_date) : null;
      const now = new Date();
      if (!postedDate) {
        dateMatch = false; // if no posted date, it can't match these filters
      } else {
        const diffHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        
        if (datePosted === "24h") dateMatch = diffHours <= 24;
        else if (datePosted === "7d") dateMatch = diffDays <= 7;
        else if (datePosted === "30d") dateMatch = diffDays <= 30;
        else if (datePosted === "older") dateMatch = diffDays > 30;
      }
    }
`;

// Replace first instance (or both, it appears twice in the file because it's duplicated in the "Showing X jobs" counter and the actual map)
content = content.replace(/const expiryMatch =[\s\S]*?new Date\(\);/g, (match) => {
  return match + "\n" + dateFilterLogic;
});

// Update the return statement inside filter
content = content.replace(/return\s*stateMatch\s*&&\s*cityMatch\s*&&\s*positionMatch\s*&&\s*qualificationMatch\s*&&\s*skillsMatch\s*&&\s*searchMatch\s*&&\s*expiryMatch;/g, 'return stateMatch && cityMatch && positionMatch && qualificationMatch && skillsMatch && searchMatch && expiryMatch && dateMatch;');

// 3. Add the UI for Exclude Expired and Date Posted inside renderFilters
const clearFiltersTarget = `setSelectedExperience([]);
setSelectedSalary([]);
      }}`;
content = content.replace(clearFiltersTarget, `setSelectedExperience([]);
setSelectedSalary([]);
setDatePosted("all");
setExcludeExpired(false);
      }}`);

const uiInject = `
    <div className="space-y-8">
    
      {/* EXCLUDE EXPIRED */}
      <div>
        <label className="flex items-center gap-3 w-full cursor-pointer group mb-2">
          <input
            type="checkbox"
            checked={excludeExpired}
            onChange={(e) => setExcludeExpired(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-gray-700 font-semibold group-hover:text-black transition-colors">Exclude Expired Jobs</span>
        </label>
        <p className="text-xs text-gray-500 ml-7">Hides jobs whose expiry date has passed.</p>
      </div>
      
      {/* DATE POSTED */}
      <div>
        <h3 className="font-semibold mb-3">Date Posted</h3>
        <div className="space-y-2 text-sm">
          {[
            { id: 'all', label: 'All Time' },
            { id: '24h', label: 'Within last 24 hours' },
            { id: '7d', label: 'Within last week' },
            { id: '30d', label: 'Within last month' },
            { id: 'older', label: 'Older than a month' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-3 w-full cursor-pointer group">
              <input
                type="radio"
                name="datePosted"
                value={opt.id}
                checked={datePosted === opt.id}
                onChange={() => setDatePosted(opt.id)}
                className="w-4 h-4 rounded-full border-gray-300 text-black focus:ring-black"
              />
              <span className="text-gray-700 group-hover:text-black transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
`;

content = content.replace('<div className="space-y-8">', uiInject);

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Patched app/jobs/page.tsx filter logic");
