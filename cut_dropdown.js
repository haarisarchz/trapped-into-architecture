const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const startIndex = content.indexOf('{/* SELECT METHOD */}');
const endIndex = content.indexOf('{/* EMAIL */}');

if (startIndex !== -1 && endIndex !== -1) {
    const chunkToRemove = content.substring(startIndex, endIndex);
    content = content.replace(chunkToRemove, '');
    fs.writeFileSync('components/Navbar.tsx', content);
    console.log("Successfully cut out the dropdown block");
} else {
    console.log("Could not find start or end index");
}