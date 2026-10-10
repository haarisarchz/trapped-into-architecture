const fs = require('fs');

function patchFile(file, label) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix Rows per page text
  content = content.replace('<span>Rows per page:</span>', '<span>' + label + ' per page:</span>');

  // Fix Sidebar Sticky & Scroll
  if (file.includes('jobs/page.tsx')) {
    // For jobs, we have renderFilters
    content = content.replace(
      /className=\{isMobile \? "w-full" : "hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200"\}/g,
      'className={isMobile ? "w-full" : "hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md border border-gray-200 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"}'
    );
    // Remove black line for EXCLUDE EXPIRED
    content = content.replace(
      '<div className="mb-8 px-2 border-t pt-6">',
      '<div className="mb-8 px-2">'
    );
  } else if (file.includes('internships/page.tsx')) {
    content = content.replace(
      '<div className="hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200">',
      '<div className="hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md border border-gray-200 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">'
    );
  } else if (file.includes('companies/page.tsx')) {
    if (!file.includes('admin/')) {
        content = content.replace(
          '<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">',
          '<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">'
        );
    }
  }

  fs.writeFileSync(file, content);
  console.log("Patched UI for " + file);
}

patchFile('app/jobs/page.tsx', 'Jobs');
patchFile('app/internships/page.tsx', 'Internships');
patchFile('app/companies/page.tsx', 'Companies');
patchFile('app/admin/jobs/page.tsx', 'Jobs');
patchFile('app/admin/companies/page.tsx', 'Companies');
