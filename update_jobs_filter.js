const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const newFunc = `  const parseExperienceForMatch = (rawExp: any) => {
      if (!rawExp) return [];
      const str = Array.isArray(rawExp) ? rawExp.join(" ") : String(rawExp);
      const lower = str.toLowerCase();
      let matched = new Set<string>();
      if (lower.includes("fresher") || lower.includes("0 year") || lower.includes("0-1")) matched.add("Fresher");
      if (lower.includes("0-1") || lower.includes("0 to 1") || lower.includes("0 - 1")) matched.add("0-1 Years");
      if (lower.includes("1-2") || lower.includes("1 to 2") || lower.includes("1 - 2") || lower.match(/1\\s*year/)) matched.add("1-2 Years");
      if (lower.includes("2-4") || lower.includes("2 to 4") || lower.includes("2 - 4") || lower.match(/[23]\\s*year/)) matched.add("2-4 Years");
      if (lower.includes("4-6") || lower.includes("4 to 6") || lower.includes("4 - 6") || lower.match(/[45]\\s*year/)) matched.add("4-6 Years");
      if (lower.includes("6-10") || lower.includes("6 to 10") || lower.includes("6 - 10") || lower.match(/[6789]\\s*year/)) matched.add("6-10 Years");
      if (lower.includes("10+") || lower.includes("10 +") || lower.match(/1[0-9]\\s*year/)) matched.add("10+ Years");
      
      if (matched.size === 0) {
        const valid = ["Fresher", "0-1 Years", "1-2 Years", "2-4 Years", "4-6 Years", "6-10 Years", "10+ Years", "Not disclosed"];
        const strParts = str.split(",").map(s => s.trim());
        const validParts = strParts.filter(p => valid.includes(p));
        return validParts;
      }
      return Array.from(matched);
  };`;

// Inject the parser function before `const filteredJobs = ...`
if (!content.includes('parseExperienceForMatch')) {
  content = content.replace('const filteredJobs = jobs.filter((job) => {', newFunc + '\n\n  const filteredJobs = jobs.filter((job) => {');
}

// Replace the experienceMatch block
const oldMatch = `const experienceMatch =
        selectedExperience.length === 0 ||
        job.experience?.some(
          (exp: string) =>
            selectedExperience.includes(exp)
        );`;
        
const newMatch = `const experienceMatch =
        selectedExperience.length === 0 ||
        parseExperienceForMatch(job.experience).some(
          (exp: string) =>
            selectedExperience.includes(exp)
        );`;

// Let's use a safe regex for the match logic
const matchRegex = /const experienceMatch =\s*selectedExperience\.length === 0 \|\|\s*job\.experience\?\.some\(\s*\(\w*:\s*string\)\s*=>\s*selectedExperience\.includes\(\w*\)\s*\);?/g;

if (matchRegex.test(content)) {
  content = content.replace(matchRegex, newMatch);
  fs.writeFileSync('app/jobs/page.tsx', content);
  console.log("Updated jobs page filter logic");
} else {
  // If regex fails, fallback to simple string replace without whitespace assumptions
  console.log("Regex for filter match failed, attempting manual replace");
  content = content.replace(oldMatch, newMatch);
  fs.writeFileSync('app/jobs/page.tsx', content);
}