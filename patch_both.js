const fs = require('fs');

function patchFile(file, itemLabel) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Extract chain
  const chainStartTag = 'const filtered = jobs';
  const chainEndTag = '.map((job, index) => (';
  const startIdx = content.indexOf(chainStartTag);
  const endIdx = content.indexOf(chainEndTag, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    console.error("Chain not found in " + file);
    return;
  }
  const chain = content.substring(startIdx + 'const filtered = '.length, endIdx).trim();

  // 2. Build Memo Block
  const memoBlock = `
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(24);

  const filteredJobs = React.useMemo(() => {
    return ${chain};
  }, [jobs, selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery, excludeExpired, expRange, salaryRange, salaryUnit, datePosted, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs.length]);
`;

  // 3. Inject Memo Block
  content = content.replace(/return\s*\(\s*<main className="min-h-screen bg-gray-100 text-black">/, memoBlock + '\n  return (\n    <main className="min-h-screen bg-gray-100 text-black">');

  // 4. Fix "Showing {jobs.filter..." text
  const filterTag = 'Showing {jobs.filter((job: any) => {';
  const filterEndStr = '}).length} ' + itemLabel + '</span>';
  const filterStartIdx = content.indexOf(filterTag);
  const filterEndIdx = content.indexOf(filterEndStr, filterStartIdx);
  if (filterStartIdx !== -1 && filterEndIdx !== -1) {
    content = content.substring(0, filterStartIdx) + 'Showing {filteredJobs.length} ' + itemLabel + '</span>' + content.substring(filterEndIdx + filterEndStr.length);
  }

  // 5. Replace IIFE Mapping block
  const iifeRegex = /\{\(\(\) => \{\s*const filtered = jobs[\s\S]*?return filtered\.length > 0 \? filtered : <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">[\s\S]*?<\/div>; \}\)\(\)\}/m;

  const newMapping = `
{paginatedJobs.length > 0 ? (
  paginatedJobs.map((job: any, index: number) => (
    <JobCard
      key={index}
      id={job.id}
      viewMode={viewMode}
      firm_name={job.firm_name || job.firmName}
      organization_type={job.organization_type || job.organizationType}
      area={job.area}
      city={job.city}
      state={job.state}
      position={job.position}
      experience={job.experience}
      qualifications={job.qualifications}
      skills={job.skills}
      employment_type={job.employment_type || job.employmentType}
      work_mode={job.work_mode || job.workMode}
      salary_min={job.salary_min || job.salaryMin}
      salary_max={job.salary_max || job.salaryMax}
      currency={job.currency}
      post_expiry_date={job.post_expiry_date || job.postExpiryDate}
      posted_date={job.posted_date || job.created_at || job.createdAt}
      save_count={job.save_count || job.saveCount || 0}
      image={job.image}
    />
  ))
) : (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
    <p className="text-xl font-semibold">No ${itemLabel} available at the moment.</p>
    <p className="mt-2 text-sm">Try adjusting your filters or search query.</p>
  </div>
)}
`;

  content = content.replace(iifeRegex, newMapping);

  // 6. Inject Pagination UI OUTSIDE the grid
  const paginationUI = `
    </div> {/* closes job grid */}
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
            <option value={24}>24</option>
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
  `;

  content = content.replace('</div> {/* closes job grid */}', paginationUI);

  // 7. Fix React Imports
  if (content.includes('import { useState, useEffect }')) {
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, useMemo } from "react";');
  } else if (content.includes('import { useState, useEffect, Suspense }')) {
    content = content.replace('import { useState, useEffect, Suspense } from "react";', 'import { useState, useEffect, Suspense, useMemo } from "react";');
  }
  
  content = content.replace(/React\.useMemo/g, 'useMemo');
  content = content.replace(/React\.useState/g, 'useState');
  content = content.replace(/React\.useEffect/g, 'useEffect');

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}

patchFile('app/jobs/page.tsx', 'jobs');
patchFile('app/internships/page.tsx', 'internships');
