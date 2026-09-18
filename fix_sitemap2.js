const fs = require("fs");
let code = fs.readFileSync("app/sitemap.ts", "utf8");

code = code.replace(
  "priority: 0.8,",
  "priority: 0.8,\n    },\n    {\n      url: `${BASE_URL}/internships`,\n      lastModified: new Date(),\n      changeFrequency: \"daily\",\n      priority: 0.8,"
);

fs.writeFileSync("app/sitemap.ts", code);

