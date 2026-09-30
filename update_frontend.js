const fs = require('fs');
let content = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

const selectRegex = /<select[\s\S]*?<\/select>/;
const newSelect = `<select 
              value={days} 
              onChange={(e) => setDays(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 shadow-sm font-medium"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last 365 Days</option>
            </select>`;
content = content.replace(selectRegex, newSelect);

const newBlocks = `
          {/* DEVICES */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Device Category</h3>
            <div className="space-y-4">
              {data.device && data.device.length > 0 ? data.device.map((row: any, i: number) => {
                const max = parseInt(data.device[0].metricValues[0].value);
                const val = parseInt(row.metricValues[0].value);
                const name = row.dimensionValues[0].value;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{name}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                    <ProgressBar value={val} max={max} />
                  </div>
                );
              }) : <div className="text-sm text-gray-500">No device data available</div>}
            </div>
          </div>

          {/* CITIES */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Top Cities</h3>
            <div className="space-y-4">
              {data.city && data.city.length > 0 ? data.city.map((row: any, i: number) => {
                const max = parseInt(data.city[0].metricValues[0].value);
                const val = parseInt(row.metricValues[0].value);
                const name = row.dimensionValues[0].value;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate pr-2">{name}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                    <ProgressBar value={val} max={max} />
                  </div>
                );
              }) : <div className="text-sm text-gray-500">No city data available</div>}
            </div>
          </div>
`;

// Insert the new blocks before the last closing tags
const insertIndex = content.lastIndexOf('</section>');
if(insertIndex !== -1) {
  content = content.substring(0, insertIndex) + newBlocks + content.substring(insertIndex);
  fs.writeFileSync('app/admin/analytics/page.tsx', content);
  console.log("Updated analytics frontend");
} else {
  console.log("Could not find insert point");
}