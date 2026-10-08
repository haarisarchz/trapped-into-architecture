import os
import re

def patch_file(filepath, is_company=False):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject the helper function and state variables right after `const [showFilters, setShowFilters] = useState(false);`
    # or inside the component.
    
    helper_code = """
  const getAggregatedList = (items, key, additionalFilter = () => true) => {
    const counts = {};
    const latestDate = {};
    items.filter(additionalFilter).forEach(item => {
      let val = item[key];
      if (!val || typeof val !== 'string') return;
      val = val.trim();
      if (val === '') return;
      counts[val] = (counts[val] || 0) + 1;
      const itemDate = new Date(item.posted_date || item.created_at || 0).getTime();
      if (!latestDate[val] || itemDate > latestDate[val]) {
        latestDate[val] = itemDate;
      }
    });
    return Object.keys(counts).map(val => ({
      name: val,
      count: counts[val],
      latest: latestDate[val]
    })).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.latest - a.latest;
    });
  };

  const [showAllStates, setShowAllStates] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
"""
    
    if is_company:
        helper_code += """
  const stateStats = getAggregatedList(companies, 'state');
  const displayedStates = showAllStates ? stateStats : stateStats.slice(0, 10);
  const cityStats = getAggregatedList(companies, 'city', c => selectedStates.length === 0 || selectedStates.includes(c.state));
  const displayedCities = showAllCities ? cityStats : cityStats.slice(0, 10);
"""
        content = re.sub(r'const states = useMemo\([^;]+;\s*const cities = useMemo\([^;]+;', helper_code, content)
    else:
        helper_code += """
  const stateStats = getAggregatedList(jobs, 'state');
  const displayedStates = showAllStates ? stateStats : stateStats.slice(0, 10);
  const cityStats = getAggregatedList(jobs, 'city', job => selectedStates.length === 0 || selectedStates.includes(job.state));
  const displayedCities = showAllCities ? cityStats : cityStats.slice(0, 10);
"""
        content = re.sub(r'const uniqueStates = \[\s*\.\.\.new Set\([\s\S]*?\];\s*const uniqueCities = \[\s*\.\.\.new Set\([\s\S]*?\];', helper_code, content)

    # 2. Patch the JSX for STATE
    state_jsx_replacement = """<h3 className="font-semibold mb-3">
        State ({stateStats.length})
      </h3>
      <div className="space-y-2 text-sm">
        {displayedStates.map((stateObj) => (
          <label key={stateObj.name} className="flex items-center justify-between gap-2 w-full pr-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedStates.includes(stateObj.name)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedStates([...selectedStates, stateObj.name]);
                  else setSelectedStates(selectedStates.filter((s) => s !== stateObj.name));
                }}
              />
              <span className="truncate">{stateObj.name}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">({stateObj.count})</span>
          </label>
        ))}
        {stateStats.length > 10 && (
          <button type="button" onClick={() => setShowAllStates(!showAllStates)} className="text-blue-500 hover:underline text-xs mt-2 block">
            {showAllStates ? "Show Less" : "Show More"}
          </button>
        )}
      </div>"""

    if is_company:
        content = re.sub(r'<h3 className="font-semibold mb-3">\s*State\s*</h3>\s*<div className="space-y-2 text-sm">\s*\{states\.map\(\(state: any\) => \([\s\S]*?\}\s*</label>\s*\)\)\}\s*</div>', state_jsx_replacement, content)
    else:
        content = re.sub(r'<h3 className="font-semibold mb-3">\s*State\s*</h3>\s*<div className="space-y-2 text-sm">\s*\{uniqueStates\.map\(\(state\) => \([\s\S]*?\}\s*</label>\s*\)\)\}\s*</div>', state_jsx_replacement, content)

    # 3. Patch the JSX for CITY
    city_jsx_replacement = """<h3 className="font-semibold mb-3">
        City ({cityStats.length})
      </h3>
      <div className="space-y-2 text-sm">
        {displayedCities.map((cityObj) => (
          <label key={cityObj.name} className="flex items-center justify-between gap-2 w-full pr-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCities.includes(cityObj.name)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCities([...selectedCities, cityObj.name]);
                  else setSelectedCities(selectedCities.filter((c) => c !== cityObj.name));
                }}
              />
              <span className="truncate">{cityObj.name}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">({cityObj.count})</span>
          </label>
        ))}
        {cityStats.length > 10 && (
          <button 
            type="button" 
            onClick={() => {
              if (selectedStates.length === 0 && !showAllCities) {
                alert("Please select a state to view more specific cities.");
                return;
              }
              setShowAllCities(!showAllCities);
            }} 
            className="text-blue-500 hover:underline text-xs mt-2 block"
          >
            {showAllCities ? "Show Less" : (selectedStates.length === 0 ? "Select state to see more" : "Show More")}
          </button>
        )}
      </div>"""

    if is_company:
        content = re.sub(r'<h3 className="font-semibold mb-3">\s*City\s*</h3>\s*<div className="space-y-2 text-sm">\s*\{cities\.map\(\(city: any\) => \([\s\S]*?\}\s*</label>\s*\)\)\}\s*</div>', city_jsx_replacement, content)
    else:
        content = re.sub(r'<h3 className="font-semibold mb-3">\s*City\s*</h3>\s*<div className="space-y-2 text-sm">\s*\{uniqueCities\.map\(\(city\) => \([\s\S]*?\}\s*</label>\s*\)\)\}\s*</div>', city_jsx_replacement, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('app/jobs/page.tsx', False)
patch_file('app/internships/page.tsx', False)
patch_file('app/companies/page.tsx', True)
