const fs = require('fs');

let code = fs.readFileSync('components/Jobcard.tsx', 'utf8');

if (!code.includes('import SaveButton')) {
  code = code.replace(
    /import ShareButtons from "@\/components\/ShareButtons";/,
    'import ShareButtons from "@/components/ShareButtons";\nimport SaveButton from "@/components/SaveButton";'
  );
  fs.writeFileSync('components/Jobcard.tsx', code);
}
