const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const targetStr = `              </div>

            </div>

            <div>

              {/* POSITIONS & DESCRIPTIONS */}`;

const replacement = `              </div>

            </div>
            </div>

            <div>

              {/* POSITIONS & DESCRIPTIONS */}`;

c = c.replace(targetStr, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed basic details div');