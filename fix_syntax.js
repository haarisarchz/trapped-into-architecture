const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const lastIndex = code.lastIndexOf('</main>');
if (lastIndex !== -1) {
  // Try to find the second to last </main>
  const secondLast = code.lastIndexOf('</main>', lastIndex - 1);
  if (secondLast !== -1) {
    code = code.substring(0, secondLast) + '\n        </main>\n  );\n}\n';
  }
}

fs.writeFileSync('components/home/InteractiveHome.tsx', code);
