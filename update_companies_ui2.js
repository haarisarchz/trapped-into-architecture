const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Remove Mobile Search Header
const mbSearchStr = `{/* Mobile Search & Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search companies or locations..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold"
            >
              <SlidersHorizontal size={20} />
              Filters {(selectedCategories.length + selectedStates.length + selectedCities.length) > 0 && \`(\${(selectedCategories.length + selectedStates.length + selectedCities.length)})\`}
            </button>
          </div>`;
content = content.replace(mbSearchStr, '');

// 2. Remove Desktop Search
const dtSearchStr = `{/* Desktop Search (hidden on mobile) */}
              <div className="hidden lg:block mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>`;
content = content.replace(dtSearchStr, '');

// 3. Replace Controls
const controlsRegex = /\{\/\* View Controls & Sort \*\/\}\s*<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">[\s\S]*?<\/div>\s*<\/div>/;

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
                  <option value="name_asc">Name A to Z (Ascending)</option>
                  <option value="name_desc">Name Z to A (Descending)</option>
                  <option value="date_added">Added Date</option>
                  <option value="jobs">Number of jobs posted</option>
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
            </div>`;

content = content.replace(controlsRegex, newControls);

fs.writeFileSync('app/companies/page.tsx', content);
console.log("Updated UI perfectly");