const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

let divOpen = (c.match(/<div(\s|>)/g) || []).length;
let divClose = (c.match(/<\/div>/g) || []).length;
console.log(`Open: ${divOpen}, Close: ${divClose}, Difference: ${divOpen - divClose}`);

// Fix the file
let diff = divOpen - divClose;
if (diff > 0) {
  let append = '</div>\n'.repeat(diff);
  c = c.replace('</section>', append + '</section>');
  fs.writeFileSync('app/admin/add-job/page.tsx', c);
  console.log('Fixed exactly ' + diff + ' missing divs');
}