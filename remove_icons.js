const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove imports
  code = code.replace(/Facebook,\s*Instagram,\s*Linkedin,\s*Twitter,\s*/g, '');
  code = code.replace(/Facebook,\s*Instagram,\s*Twitter,\s*Linkedin\s*}\s*from/g, '} from');
  
  // Replace Lucide components with text or basic SVGs
  code = code.replace(/<Facebook[^>]*>/g, '<span className="font-bold">FB</span>');
  code = code.replace(/<Instagram[^>]*>/g, '<span className="font-bold">IG</span>');
  code = code.replace(/<Twitter[^>]*>/g, '<span className="font-bold">X</span>');
  code = code.replace(/<Linkedin[^>]*>/g, '<span className="font-bold">IN</span>');
  
  fs.writeFileSync(file, code);
}

patchFile('components/Footer.tsx');
patchFile('app/contact/page.tsx');
