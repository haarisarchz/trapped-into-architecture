import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Internships & Paid Architectural Trainee Openings",
  description: "Discover verified architecture internships, student architectural trainee positions, and interior design internships at top architectural studios across India.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/internships",
  },
  openGraph: {
    title: "Architecture Internships & Paid Architectural Trainee Openings | Trapped Into Architecture",
    description: "Discover verified architecture internships and student architectural trainee positions at top studios across India.",
    url: "https://trappedintoarchitecture.com/internships",
    type: "website",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architecture Internships & Paid Trainee Openings",
    description: "Discover verified architecture internships across top architectural firms in India.",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
};

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
