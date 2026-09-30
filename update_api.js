const fs = require('fs');
let content = fs.readFileSync('app/api/ga/report/route.ts', 'utf8');

const regex = /const \[overviewRes, countryRes, browserRes, pagesRes, sourcesRes\] = await Promise\.all\(\[/s;

// Add devices and cities request
const newReqs = `
    // 6. By City
    const cityReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // 7. By Device
    const deviceReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // Execute all in parallel
    const [overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes] = await Promise.all([`;

content = content.replace(regex, newReqs);

const resultsRegex = /country: countryRes\.length \? countryRes\[0\]\.rows : \[\],[\s\S]*?\};/;
const newResults = `country: countryRes.length ? countryRes[0].rows : [],
      browser: browserRes.length ? browserRes[0].rows : [],
      pages: pagesRes.length ? pagesRes[0].rows : [],
      sources: sourcesRes.length ? sourcesRes[0].rows : [],
      city: cityRes.length ? cityRes[0].rows : [],
      device: deviceRes.length ? deviceRes[0].rows : []
    };`;

content = content.replace(/country: countryRes\.length \? countryRes\[0\]\.rows : \[\],[\s\S]*?\};/, newResults);

// Handle days logic
const daysRegex = /const startDate = `\$\{days\}daysAgo`;/;
const newDaysLogic = `
    let startDate = \`\$\{days\}daysAgo\`;
    if (days === '1h') {
      startDate = 'today'; // Fallback for standard report. Note: GA4 standard reports have latency.
    } else if (days === '1') {
      startDate = '1daysAgo';
    }
`;
content = content.replace(daysRegex, newDaysLogic);

fs.writeFileSync('app/api/ga/report/route.ts', content);
console.log("Updated API route with device and city");