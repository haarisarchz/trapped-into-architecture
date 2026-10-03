const fs = require('fs');
let file = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');

// 1. Add formatDuration
file = file.replace(
  'const ProgressBar =',
  'const formatDuration = (seconds: any) => {\n  const s = Number(seconds);\n  if (!s) return "0s";\n  const m = Math.floor(s / 60);\n  const rem = Math.floor(s % 60);\n  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;\n};\n\nconst ProgressBar ='
);

// 2. Change grid cols and add the new card
const oldCards = `            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">`;
const newCards = `            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">`;
file = file.replace(oldCards, newCards);

const oldPageViews = `              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Page Views</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.pageViews}</p>
              </div>
            </div>`;
const newPageViews = `              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Page Views</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.pageViews}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Session</h3>
                <p className="text-3xl font-bold text-gray-900">{formatDuration(data.overview.avgSessionDuration)}</p>
              </div>
            </div>`;
file = file.replace(oldPageViews, newPageViews);

// 3. Change Top Pages rendering
const oldTopPages = `<span className="font-medium truncate max-w-[70%]" title={item.path}>{item.path}</span>`;
const newTopPages = `<span className="font-medium truncate max-w-[70%]" title={item.title && item.title !== "(not set)" ? item.title : item.path}>{item.title && item.title !== "(not set)" ? item.title.replace(" | Trapped Into Architecture", "") : item.path}</span>`;
file = file.replace(oldTopPages, newTopPages);

fs.writeFileSync('app/admin/analytics/page.tsx', file);
console.log("Patched analytics page layout!");
