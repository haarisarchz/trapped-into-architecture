const fs = require('fs');

const jobsCode = fs.readFileSync('app/jobs/page.tsx', 'utf8');
const pageCode = fs.readFileSync('app/page.tsx', 'utf8');

console.log('--- JOBS PAGE QUERY ---');
const jMatch = jobsCode.match(/let query = supabase\s*\.from\('jobs'\)[\s\S]*?await query;/);
if (jMatch) {
  console.log(jMatch[0]);
} else {
  // Let's just print the general fetching block
  console.log(jobsCode.substring(jobsCode.indexOf('fetchJobs'), jobsCode.indexOf('fetchJobs') + 1000));
}

console.log('\n--- HOME PAGE QUERY ---');
const pMatch = pageCode.match(/const \{ data: recentJobs.*?limit\(6\);/s);
if (pMatch) console.log(pMatch[0]);

console.log('\n--- COMPANIES QUERY ---');
console.log(pageCode.match(/const \{ data: recentCompanies.*?limit\(6\);/s)[0]);

