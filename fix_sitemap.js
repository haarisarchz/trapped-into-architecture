const fs = require("fs");
let code = fs.readFileSync("app/sitemap.ts", "utf8");

code = code.replace(
  `    {
      url: \`\${BASE_URL}/companies\`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },`,
  `    {
      url: \`\${BASE_URL}/companies\`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: \`\${BASE_URL}/internships\`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },`
);

fs.writeFileSync("app/sitemap.ts", code);

