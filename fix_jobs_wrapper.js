const fs = require('fs');
let code = fs.readFileSync('app/jobs/page.tsx', 'utf8');

code = code.replace(
  'const renderFilters = () => (',
  'const renderFilters = (isMobile = false) => ('
).replace(
  '<div className="hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200">',
  '<div className={isMobile ? "w-full" : "hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200"}>'
);

code = code.replace('{renderFilters()}', '{renderFilters(false)}');
code = code.replace('{renderFilters()}', '{renderFilters(true)}');

fs.writeFileSync('app/jobs/page.tsx', code);
