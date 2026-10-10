const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const faultyEnd = `          </div>
        </div>
      </div>
    );`;

const fixedEnd = `          </div>
        </div>
        </div>
        </div>
      </div>
    );`;

content = content.replace(faultyEnd, fixedEnd);
fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Fixed missing divs");
