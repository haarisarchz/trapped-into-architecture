const fs = require('fs');

function patchClearFilters(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /setSelectedExperience\(\[\]\);\s*setSelectedSalary\(\[\]\);/g,
    '// removed missing setters to prevent crash\n          if (typeof setExpRange === "function") setExpRange([0, 15]);\n          if (typeof setSalaryRange === "function") setSalaryRange([0, 50]);\n          if (typeof setDatePosted === "function") setDatePosted("");\n          if (typeof setExcludeExpired === "function") setExcludeExpired(false);\n          if (typeof setSearchQuery === "function") setSearchQuery("");\n          if (typeof setSelectedExperience === "function") setSelectedExperience([]);\n          if (typeof setSelectedSalary === "function") setSelectedSalary([]);'
  );
  fs.writeFileSync(file, content);
  console.log("Patched Clear Filters in " + file);
}

patchClearFilters('app/jobs/page.tsx');
patchClearFilters('app/internships/page.tsx');
