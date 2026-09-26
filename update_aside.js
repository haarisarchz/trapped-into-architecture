const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /<aside className="space-y-6">/s;
const replacement = `<aside className="space-y-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/jobs/[id]/page.tsx', content);
  console.log("Success adding sticky and scrollbar to aside");
} else {
  console.log("Regex not found");
}