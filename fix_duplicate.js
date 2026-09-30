const fs = require('fs');

let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const shareComponentRegex = /import \{ Share, Check, Copy \} from "lucide-react";\nimport \{ generateJobUrl \} from "@\/utils\/jobUrl";/s;

const shareComponentReplace = `import { Share, Check, Copy } from "lucide-react";`;

if (content.match(shareComponentRegex)) {
  content = content.replace(shareComponentRegex, shareComponentReplace);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Removed duplicate generateJobUrl import");
} else {
  console.log("Could not find duplicate import");
}