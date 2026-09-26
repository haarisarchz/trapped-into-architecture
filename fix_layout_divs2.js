const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /            <\/div>\n\n            \n            \{\/\* JOB DESCRIPTION CARD/g;
const replacement = `\n            {/* JOB DESCRIPTION CARD`;
// wait, that's not precise. Let's match the whole block.

const exactBlock = `            </div>
  
            
            {/* JOB DESCRIPTION CARD (Full Width Bottom Box) */}
            {hasDescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {cleanDescription}
                </div>
              </div>
            )}
            
            {/* SIDEBAR */}`;

const replaceBlock = `
              {/* JOB DESCRIPTION CARD (Full Width Bottom Box) */}
              {hasDescription && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {cleanDescription}
                  </div>
                </div>
              )}
            </div>
            
            {/* SIDEBAR */}`;

if (content.includes(exactBlock)) {
  content = content.replace(exactBlock, replaceBlock);
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Success exact block replace");
} else {
  // Let's do it procedurally
  let lines = content.split('\n');
  let jobDescIdx = -1;
  let sidebarIdx = -1;
  for (let i = 0; i < lines.length; i++) {
     if (lines[i].includes('JOB DESCRIPTION CARD')) jobDescIdx = i;
     if (lines[i].includes('SIDEBAR')) sidebarIdx = i;
  }
  
  if (jobDescIdx !== -1 && sidebarIdx !== -1) {
     // Find the closest closing div BEFORE jobDescIdx
     let divIdx = -1;
     for (let i = jobDescIdx - 1; i >= 0; i--) {
        if (lines[i].includes('</div>')) {
           divIdx = i;
           break;
        }
     }
     if (divIdx !== -1) {
        // move the </div> to just before SIDEBAR
        lines.splice(divIdx, 1);
        lines.splice(sidebarIdx - 1, 0, '            </div>');
        fs.writeFileSync('app/jobs/[id]/page.tsx', lines.join('\n'));
        console.log("Success procedural replace");
     }
  }
}