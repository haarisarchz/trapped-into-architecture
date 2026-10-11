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
        {/* Google Analytics Tracking Script */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  try {
                    var userStr = localStorage.getItem('currentUser');
                    if (userStr) {
                      var user = JSON.parse(userStr);
                      var role = user.role ? user.role.toLowerCase().replace(/[\s_]+/g, "") : '';
                      if (role === 'admin' || role === 'superadmin' || role === 'ceo') {
                        window['ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}'] = true;
                      }
                    }
                  } catch(e) {}
                `
              }}
            />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
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


