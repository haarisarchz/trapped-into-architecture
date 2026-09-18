const fs = require("fs");
let code = fs.readFileSync("app/jobs/[id]/page.tsx", "utf8");

code = code.replace(
  "  return (\n    <>\n      <script\n        type=\"application/ld+json\"\n        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}\n      />\n    <main className=\"p-10\">",
  "  return (\n    <main className=\"p-10\">"
);

code = code.replace(
  "    </main>\n  );\n}\n\n  return (\n\n    <main className=\"min-h-screen bg-gray-100\">\n      <Navbar />",
  "    </main>\n  );\n}\n\n  return (\n    <>\n      <script\n        type=\"application/ld+json\"\n        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}\n      />\n    <main className=\"min-h-screen bg-gray-100\">\n      <Navbar />"
);

fs.writeFileSync("app/jobs/[id]/page.tsx", code);

