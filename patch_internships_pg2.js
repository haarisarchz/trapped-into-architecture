const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

// 1. Add Pagination State
if (!content.includes('const [currentPage, setCurrentPage]')) {
  content = content.replace('const [jobs, setJobs] = useState<any[]>([]);', 'const [jobs, setJobs] = useState<any[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(25);');
}

// 2. Extract filtering logic
const filterRegex = /jobs\.filter\(\(job: any\) => \{([\s\S]*?)\}\)\.length/m;
const filterMatch = content.match(filterRegex);
let filterBody = filterMatch ? filterMatch[1] : null;

if (filterBody && !content.includes('const filteredJobs = React.useMemo')) {
  const memoBlock = `
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job: any) => {
${filterBody}
    });
  }, [jobs, selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Reset to page 1 if filtered results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs.length]);
`;
  content = content.replace(/return \(\s*<main className="min-h-screen bg-gray-100 text-black">/, memoBlock + '\n  return (\n    <main className="min-h-screen bg-gray-100 text-black">');
}

// 3. Replace the duplicate filter blocks
content = content.replace(/jobs\.filter\(\(job: any\) => \{[\s\S]*?\}\)\.length/g, 'filteredJobs.length');
const iifeRegex = /\{\(\(\) => \{\s*const filtered = jobs[\s\S]*?return filtered\.length > 0 \? filtered : <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">[\s\S]*?<\/div>; \}\)\(\)\}/m;

const newMapping = `
{paginatedJobs.length > 0 ? (
  paginatedJobs.map((job: any, index: number) => (
    <JobCard
      key={index}
      id={job.id}
      viewMode={viewMode}
      firm_name={job.firmName}
      organization_type={job.organizationType}
      area={job.area}
      city={job.city}
      state={job.state}
      position={job.position}
      experience={job.experience}
      qualifications={job.qualifications}
      skills={job.skills}
      employment_type={job.employmentType}
      work_mode={job.workMode}
      salary_min={job.salaryMin}
      salary_max={job.salaryMax}
      currency={job.currency}
      post_expiry_date={job.postExpiryDate}
      posted_date={job.postedDate || job.createdAt}
      save_count={job.saveCount || 0}
      image={job.image}
    />
  ))
) : (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
    <p className="text-xl font-semibold">No internships available at the moment.</p>
    <p className="mt-2 text-sm">Try adjusting your filters or search query.</p>
  </div>
)}
`;

content = content.replace(iifeRegex, newMapping);


// 4. Inject Pagination UI
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
content = content.replace(/<\/div>\s*\{\/\* closes job grid \*\/\}\s*<\/div>\s*\{\/\* closes flex-1 \*\/\}\s*<\/div>\s*\{\/\* closes flex gap-8 \*\/\}\s*<\/section>\s*\{\/\* MOBILE FILTER DRAWER \*\/\}/m, paginationUI + '\n</section>\n{/* MOBILE FILTER DRAWER */}');

fs.writeFileSync('app/internships/page.tsx', content);
console.log("Patched app/internships/page.tsx correctly");
