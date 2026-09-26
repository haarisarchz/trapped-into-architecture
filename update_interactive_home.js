const fs = require('fs');
let content = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const regex = /<div className="pt-6 md:pt-0">\s*<div className="text-4xl md:text-5xl font-bold mb-2">\{stats\?\.companies \|\| 0\}<\/div>\s*<div className="text-gray-400 font-medium">Companies Listed<\/div>\s*<\/div>/s;

const replacement = `<div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-2">{stats?.internships || 0}</div>
            <div className="text-gray-400 font-medium">Internships</div>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-2">{stats?.companies || 0}</div>
            <div className="text-gray-400 font-medium">Companies Listed</div>
          </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  
  // also update grid cols from md:grid-cols-3 to md:grid-cols-4
  content = content.replace(/grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800/, 'grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800');
  
  fs.writeFileSync('components/home/InteractiveHome.tsx', content);
  console.log("Success updating InteractiveHome.tsx");
} else {
  console.log("Regex not found in InteractiveHome");
}