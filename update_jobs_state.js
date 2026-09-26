const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// 1. Add "state" to getSortedJobs
content = content.replace(
  `case "city":`,
  `case "id":\n          valA = a.id || 0;\n          valB = b.id || 0;\n          break;\n        case "state":\n          valA = a.state || "";\n          valB = b.state || "";\n          break;\n        case "city":`
);

// 2. Change sortField default to "id"
content = content.replace(
  `useState<string>("posted_date")`,
  `useState<string>("id")`
);

// 3. Update table header to include State column
const theadRegex = /<th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick=\{\(\) => handleSort\('city'\)\}>\s*City.*?<\/th>/s;
if (theadRegex.test(content)) {
  const match = content.match(theadRegex)[0];
  const stateHeader = `<th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('state')}>
      State {sortField === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>`;
  content = content.replace(theadRegex, match + '\n    ' + stateHeader);
  console.log("Header added");
}

// 4. Update table body to include State column
const tbodyRegex = /<td className="px-6 py-5">\s*\{job\.city\}\s*<\/td>/s;
if (tbodyRegex.test(content)) {
  const match = content.match(tbodyRegex)[0];
  const stateCell = `<td className="px-6 py-5">
                          {job.state}
                        </td>`;
  content = content.replace(tbodyRegex, match + '\n\n                        ' + stateCell);
  console.log("Cell added");
}

fs.writeFileSync('app/admin/jobs/page.tsx', content);