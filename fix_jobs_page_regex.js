const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const injection = `
  const sortedJobs = getSortedJobs(jobs);
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const currentJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

return (`;

content = content.replace(/^return \(\s*<main className="min-h-screen bg-white text-black">/m, injection + '\n      <main className="min-h-screen bg-white text-black">');

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Fixed currentJobs missing definition");