const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// 1. Add Pagination States
content = content.replace(
  `const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");`,
  `const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(10);`
);

// 2. Add sorted array caching & pagination logic
content = content.replace(
  `const getSortedJobs = (jobsList: any[]) => {`,
  `const sortedJobs = getSortedJobs(jobs);\n  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);\n  const currentJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);\n\n  function getSortedJobs(jobsList: any[]) {`
);
// Wait, I need to make sure getSortedJobs doesn't get messed up if it's an arrow function const.