const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

// 1. Replace the Applied Jobs Tab Button
content = content.replace(
  /onClick=\{\(\) =>\s*setActiveTab\("applied"\)\s*\}.*?className=\{\`px-6 py-3 rounded-2xl font-semibold transition\s*\$\{\s*activeTab === "applied"\s*\?\s*"bg-black text-white"\s*:\s*"bg-gray-200 text-black"\s*\}\`\}.*?>\s*Applied Jobs\s*<\/button>/s,
  `onClick={() => setActiveTab("companies")}
        className={\`px-6 py-3 rounded-2xl font-semibold transition
        \${
          activeTab === "companies"
            ? "bg-black text-white"
            : "bg-gray-200 text-black"
        }\`}
      >
        Favourite Companies
      </button>`
);

// 2. Replace the APPLIED JOBS Content Block
content = content.replace(
  /\{\/\* APPLIED JOBS \*\/\}\s*\{activeTab === "applied" && \(\s*<div className="border rounded-3xl p-8 bg-gray-50 text-gray-500">\s*No applications yet\s*<\/div>\s*\)\}/s,
  `{/* FAVOURITE COMPANIES */}
    {activeTab === "companies" && (
      <div className="border rounded-3xl p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Favourite Companies</h2>
        <div className="text-gray-500">
          No favourite companies yet
        </div>
      </div>
    )}`
);

fs.writeFileSync('app/profile/[username]/page.tsx', content);
console.log("Successfully replaced Applied Jobs with Favourite Companies!");