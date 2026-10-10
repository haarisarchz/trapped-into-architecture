const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

content = content.replace('const [itemsPerPage, setItemsPerPage] = useState(10);', 'const [itemsPerPage, setItemsPerPage] = useState(25);');

const oldOptions = `<option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>`;
const newOptions = `<option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>`;

content = content.replace(oldOptions, newOptions);

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Patched admin pagination options");
