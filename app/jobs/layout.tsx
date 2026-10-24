import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Jobs & Architect Vacancies across India",
  description: "Browse verified architecture jobs, junior & senior architect openings, and interior design vacancies across Chennai, Bangalore, Mumbai, Delhi, and pan-India.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/jobs",
  },
  openGraph: {
    title: "Architecture Jobs & Architect Vacancies across India | Trapped Into Architecture",
    description: "Browse verified architecture jobs, junior & senior architect openings, and interior design vacancies across India.",
    url: "https://trappedintoarchitecture.com/jobs",
    type: "website",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architecture Jobs & Architect Vacancies in India",
    description: "Browse verified architecture jobs and openings across India. Filter by city, salary, and experience.",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
