import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Quiz: 455+ Questions with Answers & Photos (7 Free Challenges)",
  description: "Play free interactive architecture quizzes with 455+ questions and answers, building photos, floor plans, and architect trivia. Test your knowledge on famous landmarks, master architects, and architectural styles with instant feedback and live rankings.",
  keywords: [
    "architecture quiz",
    "architecture quizzes",
    "arch quiz",
    "architecture quiz questions with answers",
    "architecture quiz with answers",
    "architecture quiz questions",
    "guess the building quiz",
    "famous architects quiz",
    "architecture trivia",
    "architecture questions and answers",
    "architecture with buildings and architects",
    "architectural history quiz",
    "architectural styles quiz",
    "architecture test with answers"
  ],
  alternates: {
    canonical: "https://trappedintoarchitecture.com/quizzes",
  },
  openGraph: {
    title: "Architecture Quiz: 455+ Questions with Answers & Photos | Trapped Into Architecture",
    description: "Play free interactive architecture quizzes with 455+ questions and answers, building photos, and architect trivia. Test your recall across 7 tournaments.",
    url: "https://trappedintoarchitecture.com/quizzes",
    type: "website",
    images: [
      {
        url: "https://trappedintoarchitecture.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trapped Into Architecture Quizzes & Trivia",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Architecture Quiz: 455+ Questions with Answers & Photos",
    description: "Play free interactive architecture quizzes with 455+ questions and answers, building photos, and architect trivia.",
    images: ["https://trappedintoarchitecture.com/og-image.png"],
  },
};

const quizSchema = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  "name": "Architecture Quiz: 455+ Questions with Answers & Photos",
  "description": "Interactive visual architecture quiz covering famous buildings, master architects, floor plans, world geography, and architectural styles across 7 tournament challenges.",
  "educationalLevel": "Beginner to Advanced",
  "about": {
    "@type": "Thing",
    "name": "Architecture"
  },
  "provider": {
    "@type": "Organization",
    "name": "Trapped Into Architecture",
    "url": "https://trappedintoarchitecture.com",
    "logo": "https://trappedintoarchitecture.com/icon-512.png"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://trappedintoarchitecture.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Architecture Quiz",
      "item": "https://trappedintoarchitecture.com/quizzes"
    }
  ]
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
