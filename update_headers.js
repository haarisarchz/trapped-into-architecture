const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const theadRegex = /<thead className="bg-white border-b">[\s\S]*?<\/thead>/;
const newThead = `<thead className="bg-white border-b">
  <tr>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('position')}>
      Position {sortField === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('firm_name')}>
      Firm {sortField === 'firm_name' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('city')}>
      City {sortField === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('posted_by')}>
      Posted By {sortField === 'posted_by' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('posted_date')}>
      Posted On {sortField === 'posted_date' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
      Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5">
      Actions
    </th>
  </tr>
</thead>`;

if (theadRegex.test(content)) {
  content = content.replace(theadRegex, newThead);
  console.log("Success");
}

const mapRegex = /<tbody>\s*\{jobs\.map\(\(job, index\) => \(\s*<tr/s;
if (mapRegex.test(content)) {
  content = content.replace(mapRegex, `<tbody>\n                {getSortedJobs(jobs).map((job, index) => (\n                  <tr`);
  console.log("Map success");
}

fs.writeFileSync('app/admin/jobs/page.tsx', content);