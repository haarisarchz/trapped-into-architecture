const fs = require('fs');

function addOldestDesktop(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the index of the second occurrence of `<option value="salaryHigh">` (which is the desktop one)
  const firstIdx = content.indexOf('<option value="salaryHigh">');
  const secondIdx = content.indexOf('<option value="salaryHigh">', firstIdx + 1);
  
  if (secondIdx !== -1) {
    content = content.substring(0, secondIdx) + '<option value="oldest">\n  Oldest Posts\n</option>\n' + content.substring(secondIdx);
    fs.writeFileSync(file, content);
    console.log("Patched desktop dropdown in " + file);
  } else {
    console.log("Could not find second dropdown in " + file);
  }
}

addOldestDesktop('app/jobs/page.tsx');
addOldestDesktop('app/internships/page.tsx');
