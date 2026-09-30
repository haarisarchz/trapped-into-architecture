const fs = require('fs');
const content = fs.readFileSync('app/jobs/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('supabase')) {
    console.log(i, lines[i]);
  }
}