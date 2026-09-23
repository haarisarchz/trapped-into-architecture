const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

code = code.replace(/onChange=\{e => setSettings\(\{\.\.\.settings, ([a-z_]+): e\.target\.value\} \/>/g, 'onChange={e => setSettings({...settings, $1: e.target.value})} />');

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed contact page syntax');
