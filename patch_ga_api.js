const fs = require('fs');
let file = fs.readFileSync('app/api/ga/report/route.ts', 'utf8');

// Add averageSessionDuration to overview
file = file.replace(
  'metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],',
  'metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "averageSessionDuration" }],'
);

file = file.replace(
  'pageViews: overviewRes[0].rows?.[0]?.metricValues?.[2]?.value || 0,\n      },',
  'pageViews: overviewRes[0].rows?.[0]?.metricValues?.[2]?.value || 0,\n        avgSessionDuration: overviewRes[0].rows?.[0]?.metricValues?.[3]?.value || 0,\n      },'
);

// Add filter to Top Pages
const pagesReqOld = `    const pagesReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });`;
const pagesReqNew = `    const pagesReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              matchType: "BEGINS_WITH",
              value: "/admin"
            }
          }
        }
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 15,
    });`;

file = file.replace(pagesReqOld, pagesReqNew);

fs.writeFileSync('app/api/ga/report/route.ts', file);
console.log("Patched GA report API");
