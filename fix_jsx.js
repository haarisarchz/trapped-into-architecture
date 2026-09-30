const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// I replaced `{[...].filter()}` with `EXPERIENCE_OPTIONS`.
// I need to change `EXPERIENCE_OPTIONS\n      .map(` to `{EXPERIENCE_OPTIONS.map(`
// Wait, the original code had:
// {[
//   ...new Set(...)
// ]
// .filter(Boolean)
// .map((experience: string, index) => ( ... ))}
// Wait, if the outer `{` was consumed by my replace, I need to add it back. Let's see what it looks like.

content = content.replace(/EXPERIENCE_OPTIONS\s*\.map\(/, '{EXPERIENCE_OPTIONS.map(');
// Also the ending might need to be fixed if it was consumed. Wait, the original ending was `))} `. 
// The error says: `./app/jobs/page.tsx:315:9 Unexpected token. Did you mean `{'}'}` or `&rbrace;`? 315 |       ))} `
// This means there's an extra `}` or missing `{`.
// Since I added `{` at the top, `))}` should now be perfectly matched!

fs.writeFileSync('app/jobs/page.tsx', content);