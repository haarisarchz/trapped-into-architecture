const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// Step 1: Remove the old Date Posted and Exclude Expired from the top
const oldTopUI = `<div className="space-y-8">
      
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
        </div>`;

content = content.replace(oldTopUI, '<div className="space-y-8">');

// Step 2: Inject the new ones at the very end of the <div className="space-y-8"> (which ends somewhere before the search input rendering or before returning from renderFilters).
// Actually, it's easier to find `{/* EXPERIENCE */}` and inject AFTER the experience block.
// Experience block ends with `</select>\n              </div>\n          </div>` or similar, then `</div>\n    </div>\n  );`
const appendTarget = `          </div>
        </div>
        
      </div>
    </div>
  );
}`;

const newBottomUI = `          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* DATE POSTED */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider">Date Posted</h3>
          <div className="space-y-2 text-sm px-2">
            {[
              { id: '24h', label: 'Within last 24 hours' },
              { id: '7d', label: 'Within last week' },
              { id: '30d', label: 'Within last month' },
              { id: 'older', label: 'Older than a month' }
            ].map(opt => (
              <label key={opt.id} className="flex items-center gap-3 w-full cursor-pointer group">
                <input
                  type="checkbox"
                  name="datePosted"
                  value={opt.id}
                  checked={datePosted === opt.id}
                  onChange={() => datePosted === opt.id ? setDatePosted("") : setDatePosted(opt.id)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-gray-700 group-hover:text-black transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* EXCLUDE EXPIRED */}
        <div className="mb-8 px-2 border-t pt-6">
          <label className="flex items-center gap-3 w-full cursor-pointer group relative">
            <input
              type="checkbox"
              checked={excludeExpired}
              onChange={(e) => setExcludeExpired(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-gray-700 font-bold text-xs uppercase tracking-wider group-hover:text-black transition-colors flex items-center">
              Exclude Expired Jobs
              <div className="group/tooltip relative cursor-help ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-[10px] text-gray-600 font-bold hover:bg-gray-300">
                ?
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-50 normal-case font-normal text-center">
                  Hide jobs whose expiry date has passed.
                  <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </span>
          </label>
        </div>

      </div>
    </div>
  );
}`;

content = content.replace(appendTarget, newBottomUI);

// Check if we correctly modified date filtering logic
const oldDateLogicRegex = /let dateMatch = true;[\s\S]*?const searchMatch =/m;
const newDateLogic = `
    let dateMatch = true;
    if (datePosted !== "" && datePosted !== "all") {
      const rawDate = job.posted_date || job.created_at || job.postedDate;
      const postedDate = rawDate ? new Date(rawDate) : null;
      const now = new Date();
      if (!postedDate) {
        dateMatch = false;
      } else {
        const diffHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        
        if (datePosted === "24h") dateMatch = diffHours <= 24;
        else if (datePosted === "7d") dateMatch = diffDays <= 7;
        else if (datePosted === "30d") dateMatch = diffDays <= 30;
        else if (datePosted === "older") dateMatch = diffDays > 30;
      }
    }
    
    const searchMatch =`;
// Replace the old one (which I might have added in the previous turn)
content = content.replace(/let dateMatch = true;[\s\S]*?const searchMatch =/gm, newDateLogic);
content = content.replace(/expiryMatch;/gm, 'expiryMatch && dateMatch;');
content = content.replace('setDatePosted("all");', 'setDatePosted("");');
content = content.replace('const [datePosted, setDatePosted] = useState("all");', 'const [datePosted, setDatePosted] = useState("");');

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Patched page.tsx filters");
