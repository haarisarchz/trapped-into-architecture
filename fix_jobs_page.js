const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const anchor = `  return (
  
      <main className="min-h-screen bg-white text-black">`;

const injection = `
  const sortedJobs = getSortedJobs(jobs);
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const currentJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
  
      <main className="min-h-screen bg-white text-black">`;

content = content.replace(anchor, injection);
fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Fixed jobs page currentJobs reference");