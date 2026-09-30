const fs = require('fs');
let content = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

// I inserted the blocks previously but I had the raw format data.city.map...
// Since the API now uses parseRows, it returns array of objects like { city: "London", users: 5 }
const oldBlocks = content.match(/\{\/\* DEVICES \*\/\}[\s\S]*?No city data available<\/div>\}[\s\n]*<\/div>[\s\n]*<\/div>/);
if (oldBlocks) {
  content = content.replace(oldBlocks[0], "");
}

// I will re-insert them right below TRAFFIC SOURCES / COUNTRIES in the same lg:grid-cols-2 grid
const gridContent = `
              {/* DEVICES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Devices</h3>
                <div className="space-y-4">
                  {!data.devices || data.devices.length === 0 ? <p className="text-gray-400 text-sm">No data available.</p> : null}
                  {data.devices && data.devices.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium capitalize">{item.deviceCategory}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.devices.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CITIES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Top Cities</h3>
                <div className="space-y-4">
                  {!data.cities || data.cities.length === 0 ? <p className="text-gray-400 text-sm">No data available.</p> : null}
                  {data.cities && data.cities.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.city}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.cities.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>
`;

// Find where to insert it. We'll insert it at the end of the <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// So right before the closing </div> of that grid.
const searchTarget = `                </div>
              </div>

            </div>
          </div>`;
          
const fixIdx = content.indexOf('                </div>\n              </div>\n\n            </div>');
if(fixIdx !== -1) {
  content = content.substring(0, fixIdx + 56) + gridContent + content.substring(fixIdx + 56);
  fs.writeFileSync('app/admin/analytics/page.tsx', content);
  console.log("Updated frontend blocks perfectly");
} else {
  // Let's just find "COUNTRIES" block and insert it right after that block's closing div.
  const countriesIndex = content.indexOf('{/* COUNTRIES */}');
  const endOfCountriesDiv = content.indexOf('</div>\n              </div>', countriesIndex);
  if(endOfCountriesDiv !== -1) {
    const insertPos = content.indexOf('</div>', endOfCountriesDiv + 6) + 7;
    content = content.substring(0, insertPos) + '\n' + gridContent + content.substring(insertPos);
    fs.writeFileSync('app/admin/analytics/page.tsx', content);
    console.log("Updated frontend blocks via fallback");
  } else {
    console.log("Could not find insert point");
  }
}