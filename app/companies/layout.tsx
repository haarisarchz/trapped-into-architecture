import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Architecture Firms & Interior Design Studios Directory | Trapped Into Architecture",
  description: "Browse top architecture firms, design practices, and studios across India. Explore active job openings, office locations, and firm hiring profiles.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/companies",
  },
  openGraph: {
    title: "Top Architecture Firms & Interior Design Studios Directory",
    description: "Browse top architecture firms and interior design studios across India. Check active vacancies and firm profiles.",
    url: "https://trappedintoarchitecture.com/companies",
    type: "website",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Architecture Firms & Interior Design Studios Directory",
    description: "Browse top architecture firms and interior design studios across India.",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
