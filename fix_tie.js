const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// I will just use `job.id` as a fallback tie-breaker for time!
// If job.id is numeric, it works. If it's a UUID, well, it's just stable.
// Let's modify getSortedCompanies to tie-break on `id`.

const oldTie = `      if (valA < valB) return sortOrder === "asc" ? -1 : 1;\n      if (valA > valB) return sortOrder === "asc" ? 1 : -1;\n      return 0;`;
const newTie = `      if (valA < valB) return sortOrder === "asc" ? -1 : 1;\n      if (valA > valB) return sortOrder === "asc" ? 1 : -1;\n      if (sortField === "created_at" && a.id && b.id) {\n        // Fallback to internal ID for precise tie-breaking\n        return a.id > b.id ? (sortOrder === "asc" ? 1 : -1) : -1;\n      }\n      return 0;`;

content = content.replace(oldTie, newTie);
fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Added tie breaker");