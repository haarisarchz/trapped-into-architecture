const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Remove Mobile Search Header
const mbSearchStart = content.indexOf('{/* Mobile Search & Filter Toggle */}');
const mbSearchEnd = content.indexOf('{/* Filters Sidebar */}');
if (mbSearchStart !== -1 && mbSearchEnd !== -1) {
  // Wait, let's just slice it out safely
  // Actually, the structure is:
  // {/* Mobile Search & Filter Toggle */}
  // <div ...> ... </div>
  // <div className="flex flex-col lg:flex-row gap-8">
  //   {/* Filters Sidebar */}
  const actualEnd = content.indexOf('<div className="flex flex-col lg:flex-row gap-8">');
  content = content.substring(0, mbSearchStart) + content.substring(actualEnd);
  console.log("Removed old mobile header");
}

// 2. Remove Desktop Search from Sidebar
const dtSearchStart = content.indexOf('{/* Desktop Search (hidden on mobile) */}');
const catFilterStart = content.indexOf('{/* Category Filter */}');
if (dtSearchStart !== -1 && catFilterStart !== -1) {
  content = content.substring(0, dtSearchStart) + content.substring(catFilterStart);
  console.log("Removed old desktop search");
}

// 3. Replace Controls
const viewControlsStart = content.indexOf('{/* View Controls & Sort */}');
const resultsStart = content.indexOf('{/* Results */}');

if (viewControlsStart !== -1 && resultsStart !== -1) {
  const newControls = `{/* MOBILE CONTROLS */}
            <div className="lg:hidden mb-4 space-y-3">
              {/* ROW 1 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-40 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_added">Added Date</option>
                  <option value="jobs">Most Jobs</option>
                  <option value="year_founded">Year Founded</option>
                </select>
              </div>
              {/* ROW 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">View</span>
                  <div className="flex border rounded-xl overflow-hidden">
                    <button onClick={() => setViewMode("visual")} className={\`px-3 py-2 \${viewMode === "visual" ? "bg-black text-white" : "bg-white"}\`}><LayoutGrid size={16} /></button>
                    <button onClick={() => setViewMode("detailed")} className={\`px-3 py-2 \${viewMode === "detailed" ? "bg-black text-white" : "bg-white"}\`}><Rows3 size={16} /></button>
                    <button onClick={() => setViewMode("compact")} className={\`px-3 py-2 \${viewMode === "compact" ? "bg-black text-white" : "bg-white"}\`}><List size={16} /></button>
                  </div>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="border rounded-xl px-4 py-2 flex items-center gap-2 bg-white text-sm font-medium">
                  Filter
                </button>
              </div>
            </div>

            {/* VIEW + SORT BAR (DESKTOP) */}
            <div className="hidden lg:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              {/* VIEW BY */}
              <div className="flex items-center gap-4">
                <p className="font-medium whitespace-nowrap">View By :</p>
                <div className="flex border rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode("visual")} className={\`px-4 py-3 \${viewMode === "visual" ? "bg-black text-white" : "bg-white text-black"}\`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode("detailed")} className={\`px-4 py-3 \${viewMode === "detailed" ? "bg-black text-white" : "bg-white text-black"}\`}><Rows3 size={18} /></button>
                  <button onClick={() => setViewMode("compact")} className={\`px-4 py-3 transition \${viewMode === "compact" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}\`}><List size={18} /></button>
                </div>
              </div>

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />

              {/* SORT BY */}
              <div className="flex items-center gap-4">
                <p className="font-medium whitespace-nowrap">Sort By :</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="name_asc">Name A to Z (Ascending)</option>
                  <option value="name_desc">Name Z to A (Descending)</option>
                  <option value="date_added">Added Date</option>
                  <option value="jobs">Number of jobs posted</option>
                  <option value="year_founded">Year Founded</option>
                </select>
              </div>
            </div>

            {/* Showing count indicator */}
            <div className="text-gray-500 font-medium text-sm mb-4">
              Showing <span className="text-black font-bold">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'company' : 'companies'}
            </div>\n\n            `;

  content = content.substring(0, viewControlsStart) + newControls + content.substring(resultsStart);
  console.log("Replaced controls");
} else {
  console.log("Failed to match controls");
}

fs.writeFileSync('app/companies/page.tsx', content);
console.log("Done");