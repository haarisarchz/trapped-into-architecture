const fs = require('fs');

let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

// The original broken regex replaced `if (loading) return <div>...` with `if (loading) { const renderFilters = ...`
// Or something similar.
// Wait, I already ran a fix earlier that replaced `if (loading) { const renderFilters` with `if (loading) return <div>...</div>;\nconst renderFilters`!
// Let me check what is CURRENTLY in the file!
console.log('Current state of if (loading):');
const lines = code.split('\n');
lines.forEach((l, i) => { if(l.includes('if (loading)')) console.log(i, l); });
