const fs = require("fs");
let code = fs.readFileSync("app/layout.tsx", "utf8");

const structuredData = `
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Trapped Into Architecture",
  "url": "https://trappedintoarchitecture.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://trappedintoarchitecture.com/jobs?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Trapped Into Architecture",
  "url": "https://trappedintoarchitecture.com",
  "logo": "https://trappedintoarchitecture.com/logo.png"
};
`;

code = code.replace(
  `export default function RootLayout({`,
  `${structuredData}\nexport default function RootLayout({`
);

code = code.replace(
  `<body className="min-h-full flex flex-col">{children}</body>`,
  `<body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>`
);

fs.writeFileSync("app/layout.tsx", code);

