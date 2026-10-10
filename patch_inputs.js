const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace inputs/selects/textareas that have className="..." but no text-black
  content = content.replace(/(<(?:input|select|textarea)[^>]+className="[^"]+)"/g, (match, p1) => {
    let newClass = p1;
    if (!newClass.includes('text-black')) {
      newClass += ' text-black';
    }
    if (!newClass.includes('bg-')) {
      newClass += ' bg-white';
    }
    return newClass + '"';
  });

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}

patchFile('app/admin/add-job/page.tsx');
patchFile('components/ApiServerManager.tsx');
