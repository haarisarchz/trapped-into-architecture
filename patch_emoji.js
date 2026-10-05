const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

// Replace corrupted emoji
file = file.replace(/dY"\?/g, 'Location:');

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched emoji");
