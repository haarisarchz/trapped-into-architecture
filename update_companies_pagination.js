const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Add Pagination States
content = content.replace(
  `const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");`,
  `const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(10);`
);

// 2. Add pagination logic
content = content.replace(
  `const sortedCompanies = getSortedCompanies(companies);`,
  `const sortedCompanies = getSortedCompanies(companies);\n  \n  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);\n  const currentCompanies = sortedCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`
);

// 3. Update mapping to use currentCompanies
content = content.replace(
  `sortedCompanies.map((c, i) => (`,
  `currentCompanies.map((c, i) => (`
);

// 4. Add Pagination UI below the table
const paginationUI = `
          </div>
          
          {/* Pagination Controls */}
          {companies.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
`;

content = content.replace(
  /<\/div>\s*<\/section>/,
  paginationUI
);

// Reset page on sort
content = content.replace(
  /setSortField\(field\);\s*setSortOrder\("asc"\);/g,
  `setSortField(field);\n      setSortOrder("asc");\n      setCurrentPage(1);`
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated companies page with pagination");