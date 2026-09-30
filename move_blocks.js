const fs = require('fs');
let content = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

const blocksMatch = content.match(/\{\/\* DEVICES \*\/\}[\s\S]*?No city data available<\/div>\}[\s\n]*<\/div>[\s\n]*<\/div>/);
if(blocksMatch) {
  const blocks = blocksMatch[0];
  // Remove from current pos
  content = content.replace(blocks, "");
  
  // Insert inside the lg:grid-cols-2
  // We can just find the end of that grid. The grid starts with <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  // Since it's hard to parse JSX with regex, we can just find the end of SOURCES block and inject it there.
  const sourcesEnd = content.indexOf('No source data available</div>}
                </div>
              </div>');
              
  if(sourcesEnd !== -1) {
    const insertPos = content.indexOf('</div>', sourcesEnd) + 6;
    content = content.substring(0, insertPos) + '\n' + blocks + content.substring(insertPos);
    fs.writeFileSync('app/admin/analytics/page.tsx', content);
    console.log("Moved blocks into grid");
  } else {
    console.log("Could not find SOURCES block");
  }
}