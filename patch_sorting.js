const fs = require('fs');
let file = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Update the default state
file = file.replace(
  'const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");',
  'const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date_added");'
);

file = file.replace(
  'if (sortBy !== "name") params.set("sort", sortBy);',
  'if (sortBy !== "date_added") params.set("sort", sortBy);'
);

// 2. Replace the sorting block
const sortRegex = /\/\/ Sort\s*if \(sortBy === "name"\) \{\s*data\.sort\(\(a: any, b: any\) => a\.company\.localeCompare\(b\.company\)\);\s*\} else if \(sortBy === "jobs"\) \{\s*data\.sort\(\(a: any, b: any\) => b\.totalJobs - a\.totalJobs\);\s*\}/g;

const newSort = `// Sort
    if (sortBy === "name_asc") {
      data.sort((a: any, b: any) => a.company.localeCompare(b.company));
    } else if (sortBy === "name_desc") {
      data.sort((a: any, b: any) => b.company.localeCompare(a.company));
    } else if (sortBy === "jobs") {
      data.sort((a: any, b: any) => b.totalJobs - a.totalJobs);
    } else if (sortBy === "date_added") {
      data.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
    } else if (sortBy === "year_founded") {
      data.sort((a: any, b: any) => {
        const yearA = parseInt(a.founded_year) || 0;
        const yearB = parseInt(b.founded_year) || 0;
        return yearB - yearA;
      });
    }`;

file = file.replace(sortRegex, newSort);

fs.writeFileSync('app/companies/page.tsx', file);
console.log("Patched companies sorting!");
