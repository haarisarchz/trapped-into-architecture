const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// 1. Add Pagination State
if (!content.includes('const [currentPage, setCurrentPage]')) {
  content = content.replace('const [jobs, setJobs] = useState<any[]>([]);', 'const [jobs, setJobs] = useState<any[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(25);');
}

// 2. Extract filtering logic
const filterRegex = /jobs\.filter\(\(job: any\) => \{([\s\S]*?)\}\)\.length/m;
const filterMatch = content.match(filterRegex);
let filterBody = filterMatch ? filterMatch[1] : null;

if (filterBody && !content.includes('const filteredJobs = useMemo')) {
  // Reset page when filters change
  // Actually, simplest is to just define it directly in the render
  const memoBlock = `
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job: any) => {
${filterBody}
    });
  }, [jobs, selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery, excludeExpired, expRange, salaryRange, salaryUnit, datePosted]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Reset to page 1 if filtered results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs.length]);
`;
  content = content.replace(/return \(\s*<div className="flex h-screen bg-gray-50 flex-col font-sans">/, memoBlock + '\n  return (\n    <div className="flex h-screen bg-gray-50 flex-col font-sans">');
}

// 3. Replace the duplicate filter blocks
content = content.replace(/jobs\.filter\(\(job: any\) => \{[\s\S]*?\}\)\.length/g, 'filteredJobs.length');
content = content.replace(/jobs\.filter\(\(job: any\) => \{[\s\S]*?\}\)\s*\.map/g, 'paginatedJobs.map');

// 4. Inject Pagination UI at the bottom of the grid
const paginationUI = `
          {/* Pagination Controls */}
          {filteredJobs.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
                >
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                
                <span className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <button 
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
`;
// Replace the end of the jobs list container
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<Footer \/>/, paginationUI + '\n<Footer />');

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Patched app/jobs/page.tsx");
