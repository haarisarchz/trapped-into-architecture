const fs = require('fs');
let content = fs.readFileSync('app/api/ga/report/route.ts', 'utf8');
if (!content.includes('export const dynamic')) {
  content = content.replace('import { BetaAnalyticsDataClient } from "@google-analytics/data";', 'import { BetaAnalyticsDataClient } from "@google-analytics/data";\n\nexport const dynamic = "force-dynamic";');
  fs.writeFileSync('app/api/ga/report/route.ts', content);
  console.log("Added force-dynamic to GA route");
} else {
  console.log("force-dynamic already present");
}