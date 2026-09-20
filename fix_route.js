const fs = require('fs');

let api = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');
api = api.replace(/\\\`/g, '\`').replace(/\\\$/g, '\$');
fs.writeFileSync('app/api/publish/social/route.ts', api);

console.log('Fixed route.ts syntax errors');
