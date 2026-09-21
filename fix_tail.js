const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

// The file should end with:
//     </main>
//   );
// }

const correctEnd = '    </main>\n  );\n}\n';

// Find the last occurrence of </main>
const lastMain = code.lastIndexOf('</main>');
if (lastMain !== -1) {
  code = code.substring(0, lastMain) + correctEnd;
  fs.writeFileSync('components/home/InteractiveHome.tsx', code);
  console.log('Fixed!');
}
