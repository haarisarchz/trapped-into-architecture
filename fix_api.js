const fs = require('fs');
let content = fs.readFileSync('app/api/ga/report/route.ts', 'utf8');

// Fix the Promise.all array
const promiseAllRegex = /const \[overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes\] = await Promise\.all\(\[\s*overviewReq, countryReq, browserReq, pagesReq, sourcesReq\s*\]\);/;
content = content.replace(promiseAllRegex, `const [overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes] = await Promise.all([
      overviewReq, countryReq, browserReq, pagesReq, sourcesReq, cityReq, deviceReq
    ]);`);

// Fix the NextResponse.json to include cities and devices
const jsonRegex = /return NextResponse\.json\(\{\s*overview: \{[\s\S]*?sources: parseRows\(sourcesRes, \["source"\], \["sessions"\]\)\s*\}\);/;
const newJson = `return NextResponse.json({
      overview: {
        activeUsers: overviewRes[0].rows?.[0]?.metricValues?.[0]?.value || 0,
        sessions: overviewRes[0].rows?.[0]?.metricValues?.[1]?.value || 0,
        pageViews: overviewRes[0].rows?.[0]?.metricValues?.[2]?.value || 0,
      },
      countries: parseRows(countryRes, ["country"], ["users"]),
      browsers: parseRows(browserRes, ["browser"], ["users"]),
      pages: parseRows(pagesRes, ["title", "path"], ["views"]),
      sources: parseRows(sourcesRes, ["source"], ["sessions"]),
      cities: parseRows(cityRes, ["city"], ["users"]),
      devices: parseRows(deviceRes, ["deviceCategory"], ["users"])
    });`;

content = content.replace(jsonRegex, newJson);

fs.writeFileSync('app/api/ga/report/route.ts', content);
console.log("Fixed API logic");