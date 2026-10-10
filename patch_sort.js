const fs = require('fs');

function patchSort(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add "oldest" logic to .sort()
  content = content.replace(
    '        return dateB !== dateA ? dateB - dateA : createdB - createdA;',
    '        if (sortBy === "oldest") {\n          return dateA !== dateB ? dateA - dateB : createdA - createdB;\n        }\n\n        return dateB !== dateA ? dateB - dateA : createdB - createdA;'
  );

  // Add <option value="oldest"> to all dropdowns if not already perfectly matched
  // Actually let's just make sure <option value="oldest">Oldest Posts</option> is available.
  // We already saw <option value="oldest">Older Posts</option> exists in jobs!
  
  fs.writeFileSync(file, content);
  console.log("Patched sort in " + file);
}

patchSort('app/jobs/page.tsx');
patchSort('app/internships/page.tsx');
