const fs = require('fs');
const file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /<nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">[\s\S]*?<\/nav>/;
file.match(regex) ? console.log("Breadcrumb found") : console.log("Breadcrumb missing");

const popularJobsRegex = /\{\/\* POPULAR JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;
file.match(popularJobsRegex) ? console.log("Popular Jobs found") : console.log("Popular Jobs missing");

const recentJobsRegex = /\{\/\* RECENT JOBS \*\/\}[\s\S]*?<\/div>\s*\)\}/;
file.match(recentJobsRegex) ? console.log("Recent Jobs found") : console.log("Recent Jobs missing");
