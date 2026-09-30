const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

content = content.replace('}})', '})');
content = content.replace('}}', '})}'); // Wait, let's just do it cleanly

// Revert last bit
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('}})}')) {
        lines[i] = lines[i].replace('}})}', '})}');
    }
}
fs.writeFileSync('app/companies/page.tsx', lines.join('\n'));