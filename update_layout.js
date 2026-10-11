const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

const oldSnippet = `export const metadata: Metadata = {
  metadataBase: new URL("https://trappedintoarchitecture.com"),
  title: {
    default: "Trapped Into Architecture",
    template: "%s | Trapped Into Architecture",
  },
  description: "Find architecture jobs, firms, and internships faster. The dedicated platform for architects.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trappedintoarchitecture.com",
    siteName: "Trapped Into Architecture",
  },
  twitter: {
    card: "summary_large_image",
  },
};`;

const newSnippet = `export const metadata: Metadata = {
  metadataBase: new URL("https://trappedintoarchitecture.com"),
  title: {
    default: "Trapped Into Architecture | Architecture Jobs, Internships and Top Design Firms",
    template: "%s | Trapped Into Architecture",
  },
  description: "Find verified architecture jobs, internships, junior and senior architect vacancies, and top architectural firms across Chennai, Bangalore, Mumbai, and India.",
  keywords: [
    "Architecture jobs",
    "Architect jobs in Chennai",
    "Architect jobs in Bangalore",
    "Architect jobs in Mumbai",
    "Architect jobs in Delhi",
    "Architecture firms in Chennai",
    "Junior Architect jobs",
    "Senior Architect jobs",
    "Architectural internships",
    "Interior design jobs",
    "Architecture vacancy"
  ],
  authors: [{ name: "Trapped Into Architecture" }],
  creator: "Trapped Into Architecture",
  publisher: "Trapped Into Architecture",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://trappedintoarchitecture.com",
    siteName: "Trapped Into Architecture",
    title: "Trapped Into Architecture | Architecture Jobs, Internships and Top Design Firms",
    description: "Find verified architecture jobs, internships, and top architectural firms across India.",
    images: ["https://trappedintoarchitecture.com/og-image.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Trapped Into Architecture | Architecture Jobs and Internships",
    description: "Find verified architecture jobs, internships, and top architectural firms across India.",
    images: ["https://trappedintoarchitecture.com/og-image.png"]
  },
};`;

code = code.replace(oldSnippet, newSnippet);
fs.writeFileSync('app/layout.tsx', code);
console.log('Successfully updated app/layout.tsx');
