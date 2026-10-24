import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Quizzes, Practice Tests & Trivia | Trapped Into Architecture",
  description: "Test your architectural knowledge with interactive quizzes on architectural history, building construction, sustainability, codes, and design theory.",
  alternates: {
    canonical: "https://trappedintoarchitecture.com/quizzes",
  },
  openGraph: {
    title: "Architecture Quizzes, Practice Tests & Trivia | Trapped Into Architecture",
    description: "Test your architectural knowledge with interactive quizzes on architectural history, building construction, and design theory.",
    url: "https://trappedintoarchitecture.com/quizzes",
    type: "website",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architecture Quizzes & Trivia",
    description: "Test your architectural knowledge with interactive quizzes and practice tests.",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
