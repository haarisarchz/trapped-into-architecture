const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// The bug is here: `}, [jobs, realCompanies]);`
content = content.replace('}, [jobs, realCompanies]);', '}, [jobs, realCompanies, favoritesCount]);');

// And we must ensure favoritesCount is actually injected into company objects
// Let's check how it's currently injected
if (content.includes('favoriteCount: favoritesCount[')) {
  fs.writeFileSync('app/companies/page.tsx', content);
  console.log('Fixed useMemo dependencies');
} else {
  // Wait, is it injected at all? Let's check.
  console.log('favoriteCount not injected?');
}