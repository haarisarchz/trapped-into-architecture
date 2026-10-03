const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const targetMap = '        setPositions(validSiblings.map(s => {';
const replaceMap = '        try {\\n          setPositions(validSiblings.map(s => {';

const targetMapEnd = '           };\\n        }));';
const replaceMapEnd = '           };\\n        }));\\n        } catch(e) { console.error("Error parsing positions:", e); }';

if (file.includes(targetMap) && file.includes(targetMapEnd)) {
    file = file.replace(targetMap, replaceMap);
    file = file.replace(targetMapEnd, replaceMapEnd);
    fs.writeFileSync('app/admin/add-job/page.tsx', file);
    console.log("Added try-catch to positions mapping!");
} else {
    console.log("Could not find targets.");
}
