const fs = require('fs');
let content = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

const blocksMatch = content.match(/\{\/\* DEVICES \*\/\}[\s\S]*?No city data available<\/div>\}[\s\n]*<\/div>[\s\n]*<\/div>/);
if(blocksMatch) {
  const blocks = blocksMatch[0];
  content = content.replace(blocks, "");
  
  const sourcesEnd = content.indexOf('No source data available</div>}\n                </div>\n              </div>');
  
  if(sourcesEnd !== -1) {
    const insertPos = content.indexOf('</div>', sourcesEnd) + 6;
    content = content.substring(0, insertPos) + '\n' + blocks + content.substring(insertPos);
    fs.writeFileSync('app/admin/analytics/page.tsx', content);
    console.log("Moved blocks into grid");
  } else {
    // fallback search
    const fb = content.indexOf('No source data available');
    if (fb !== -1) {
       const insertPos = content.indexOf('</div>', content.indexOf('</div>', content.indexOf('</div>', fb) + 1) + 1) + 6;
       content = content.substring(0, insertPos) + '\n' + blocks + content.substring(insertPos);
       fs.writeFileSync('app/admin/analytics/page.tsx', content);
       console.log("Moved blocks into grid via fallback");
    } else {
       console.log("Could not find SOURCES block");
    }
  }
}