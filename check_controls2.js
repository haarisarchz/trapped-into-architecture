const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

const dtSearch = content.indexOf('{/* Desktop Search');
console.log("DESKTOP SEARCH:\n", content.substring(dtSearch, dtSearch + 500));

const vcSort = content.indexOf('{/* View Controls');
console.log("VIEW CONTROLS:\n", content.substring(vcSort, vcSort + 800));