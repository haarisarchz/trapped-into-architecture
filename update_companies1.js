const fs = require('fs');

let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

if (!code.includes('showFavoritesOnly')) {
  code = code.replace(
    /const \[activeJobsOnly, setActiveJobsOnly\] = useState\(false\);/, 
    'const [activeJobsOnly, setActiveJobsOnly] = useState(false);\nconst [showFavoritesOnly, setShowFavoritesOnly] = useState(false);\nconst [currentUser, setCurrentUser] = useState<any>(null);\nuseEffect(() => {\n  if(typeof window !== "undefined") {\n    const str = localStorage.getItem("currentUser");\n    if(str) setCurrentUser(JSON.parse(str));\n  }\n}, []);'
  );
}

if (!code.includes('import CompanyActions')) {
  code = code.replace(
    /import \{ useRouter \} from \"next\/navigation\";/, 
    'import { useRouter } from "next/navigation";\nimport CompanyActions from "@/components/CompanyActions";'
  );
}

// 3. Update the filter logic to include favorite companies
const filterStartStr = 'if (activeJobsOnly) {';
if (code.includes(filterStartStr) && !code.includes('if (showFavoritesOnly) {')) {
  const filterLogic = `
  if (showFavoritesOnly) {
    const favs = currentUser?.favoriteCompanies || [];
    data = data.filter((company: any) => favs.includes(company.slug));
  }

  if (activeJobsOnly) {`;
  code = code.replace(filterStartStr, filterLogic);
}

// 4. Update the sidebar UI to include the Favorite Companies checkbox
const activeJobsHtml = `<label className="flex items-center gap-3 text-sm cursor-pointer">

      <input

        type="checkbox"

        checked={activeJobsOnly}

        onChange={(e) => setActiveJobsOnly(e.target.checked)}`;
        
if (code.includes('setActiveJobsOnly(e.target.checked)') && !code.includes('setShowFavoritesOnly')) {
  const newSidebarHtml = `
  <div className="mb-6">
    <h3 className="font-semibold mb-3">Favorites</h3>
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={showFavoritesOnly}
        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
      />
      Favorite Companies
    </label>
  </div>
  
  <div className="mb-6">
    <h3 className="font-semibold mb-3">Status</h3>
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={activeJobsOnly}
        onChange={(e) => setActiveJobsOnly(e.target.checked)}
`;
  code = code.replace(/<div className=\"mb-6\">\s*<h3 className=\"font-semibold mb-3\">\s*Status\s*<\/h3>\s*<label className=\"flex items-center gap-3 text-sm cursor-pointer\">\s*<input\s*type=\"checkbox\"\s*checked=\{activeJobsOnly\}\s*onChange=\{\(e\) => setActiveJobsOnly\(e\.target\.checked\)\}/, newSidebarHtml);
}

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Done updating companies page 1');
