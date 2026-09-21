const fs = require('fs');
let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

// imports
code = code.replace(/import \{ Search, MapPin, Building2, SlidersHorizontal, X \} from "lucide-react";/, 'import { Search, MapPin, Building2, SlidersHorizontal, X, LayoutGrid, Rows3, List } from "lucide-react";');

// state
code = code.replace(/const \[searchQuery, setSearchQuery\] = useState\(""\);/, 'const [searchQuery, setSearchQuery] = useState("");\n  const [viewMode, setViewMode] = useState("visual");');

// controls
const viewControls = `
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm font-medium text-gray-500">
                    Showing {filteredCompanies.length} compan{filteredCompanies.length === 1 ? "y" : "ies"}
                  </div>
                  <div className="flex border rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode("visual")}
                      className={\`px-3 py-2 \${viewMode === "visual" ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"}\`}
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("balanced")}
                      className={\`px-3 py-2 \${viewMode === "balanced" ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"}\`}
                      title="List View"
                    >
                      <Rows3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("dense")}
                      className={\`px-3 py-2 \${viewMode === "dense" ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"}\`}
                      title="Compact View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>`;

code = code.replace(/<div className="mb-6 text-sm font-medium text-gray-500">[\s\S]*?<\/div>/, viewControls);

// grid classes
code = code.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">/, `<div className={\`grid gap-6 \${viewMode === "visual" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}\`}>`);

// rendering styles based on viewMode
// The company card is currently:
// <div key={company.slug} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full group">
// <div className="flex justify-between items-start mb-4">...</div>
// <div className="flex-1">...</div>
// <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-gray-50">...</div>
// </div>

const cardRegex = /<div key=\{company\.slug\} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full group">/g;
code = code.replace(cardRegex, `<div key={company.slug} className={\`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex group \${viewMode === "visual" ? "flex-col h-full" : "flex-row items-center gap-6"}\`}>`);

// Inside card, flex-1 wrapper for logo vs title
const logoRegex = /<div className="flex justify-between items-start mb-4">/g;
code = code.replace(logoRegex, `<div className={\`flex justify-between items-start \${viewMode === "visual" ? "mb-4" : "mb-0 shrink-0"}\`}>`);

// Content wrapper
const contentRegex = /<div className="flex-1">/g;
code = code.replace(contentRegex, `<div className={\`flex-1 \${viewMode !== "visual" && "flex items-center justify-between gap-6"}\`}>`);

// Title/org wrapper
const titleOrgRegex = /<Link href=\{`\/companies\/\$\{company\.slug\}`\}>/g;
code = code.replace(titleOrgRegex, `<div className="flex-1">\n                        <Link href={\`/companies/\${company.slug}\`}>`);

const orgRegex = /<p className="text-sm text-gray-500 mb-4 line-clamp-1">\{company\.organizationType\}<\/p>/g;
code = code.replace(orgRegex, `<p className={\`text-sm text-gray-500 line-clamp-1 \${viewMode === "visual" ? "mb-4" : "mb-0"}\`}>{company.organizationType}</p>\n                        </div>`);

// Footer (location and jobs)
const footerRegex = /<div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-gray-50">/g;
code = code.replace(footerRegex, `<div className={\`flex items-center justify-between text-xs font-medium \${viewMode === "visual" ? "pt-4 border-t border-gray-50" : "shrink-0 gap-6"}\`}>`);

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Added view controls to companies page');
