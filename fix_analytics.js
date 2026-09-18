const fs = require("fs");
let code = fs.readFileSync("app/admin/analytics/page.tsx", "utf8");

code = code.replace(
  `        const res = await fetch("/api/ga/report");
        const json = await res.json();
        if (json.error) {`,
  `        const res = await fetch("/api/ga/report");
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error("Failed to load analytics: " + text.slice(0, 50));
        }
        if (json.error) {`
);

fs.writeFileSync("app/admin/analytics/page.tsx", code);

