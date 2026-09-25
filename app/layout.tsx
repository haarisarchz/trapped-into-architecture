import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}


