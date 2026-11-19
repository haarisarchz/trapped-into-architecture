import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

const SEO_CONFIG: Record<string, { title: string; description: string; keywords: string[] }> = {
  "iconic-world-landmarks-guess-the-building": {
    title: "Guess the Building: Architecture Quiz with Photos & Answers (65 Landmarks)",
    description: "Can you identify 65 world-famous architectural landmarks from photos? Free visual architecture quiz with instant answers, architect details, and floor clues.",
    keywords: [
      "guess the building",
      "guess the building quiz",
      "identify the building from photo",
      "architecture landmark quiz",
      "famous buildings quiz",
      "architecture quiz with answers",
      "arch quiz",
      "architecture questions and answers"
    ]
  },
  "master-architects-who-designed-it": {
    title: "Famous Architects Quiz: Who Designed It? (65 Questions & Answers)",
    description: "Test your knowledge of legendary architects from Frank Lloyd Wright and Le Corbusier to Zaha Hadid and Norman Foster. 65 building photo questions with answers.",
    keywords: [
      "famous architects quiz",
      "who designed it architecture quiz",
      "architect quiz",
      "le corbusier quiz",
      "zaha hadid quiz",
      "architecture questions and answers",
      "architects and buildings quiz",
      "arch quiz"
    ]
  },
  "where-in-the-world-guess-the-city-country": {
    title: "World Architecture Quiz: Guess the City & Country (65 Landmark Photos)",
    description: "Where in the world are these 65 iconic architectural masterworks located? Test your architectural geography recall with building photos and answers.",
    keywords: [
      "world architecture quiz",
      "guess the city architecture",
      "where in the world architecture",
      "architecture geography quiz",
      "global landmarks quiz",
      "arch quiz"
    ]
  },
  "architectural-detective-guess-the-clues": {
    title: "Architectural Detective Trivia: Guess the Building from Clues",
    description: "Forensic architecture quiz! Read 3 structural, material, and historical clues to deduce which iconic building it is. 65 challenging trivia questions with answers.",
    keywords: [
      "architectural detective",
      "guess the building from clues",
      "architecture trivia clues",
      "architectural clues quiz",
      "tectonic trivia",
      "arch quiz questions"
    ]
  },
  "timeline-challenge-when-was-it-built": {
    title: "Architecture History Timeline Quiz: Which Year Was It Built?",
    description: "Can you place architectural history in chronological order? Free history and theory quiz challenging you to identify completion dates from 1900s to 2020s.",
    keywords: [
      "architecture timeline quiz",
      "when was it built architecture",
      "architectural history quiz",
      "chronological architecture quiz",
      "history of architecture test"
    ]
  },
  "architectural-styles-and-movements": {
    title: "Architectural Styles Quiz: What Style Is It? (Movements & Theory)",
    description: "From Brutalism and Bauhaus to Deconstructivism and High-Tech. Test your architectural theory recall with 65 building photo questions and answers.",
    keywords: [
      "architectural styles quiz",
      "what style is this building",
      "architecture movement quiz",
      "brutalism quiz",
      "modern architecture quiz",
      "architecture style quiz"
    ]
  },
  "architects-oeuvre-pair-the-masterpieces": {
    title: "Master Architect Portfolio Quiz: Pair the Buildings (Works & Studios)",
    description: "Do you know your architects' complete portfolios? Match iconic sister landmarks designed by the same studio. 65 questions with photos and answers.",
    keywords: [
      "architects oeuvre quiz",
      "pair the masterpieces architecture",
      "architect portfolio quiz",
      "match building to architect",
      "architecture studio quiz"
    ]
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const config = SEO_CONFIG[slug];

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title, description, cover_image, category")
      .eq("slug", slug)
      .maybeSingle();

    const title = config?.title || `${quiz?.title || "Architecture Quiz"} | Architecture Quiz & Practice Test`;
    const description = config?.description || quiz?.description || `Test your knowledge with the ${quiz?.title || "architecture"} quiz on Trapped Into Architecture.`;
    const keywords = config?.keywords || ["architecture quiz", "arch quiz", "architecture questions and answers"];
    const url = `https://trappedintoarchitecture.com/quizzes/${slug}`;
    const cover = quiz?.cover_image?.startsWith("http") ? quiz.cover_image : `https://trappedintoarchitecture.com${quiz?.cover_image || "/og-image.png"}`;

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${title} | Trapped Into Architecture`,
        description,
        url,
        type: "website",
        images: [
          {
            url: cover,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Trapped Into Architecture`,
        description,
        images: [cover],
      },
    };
  } catch {
    return { title: "Architecture Quiz: 65 Masterworks & Questions" };
  }
}

export default async function QuizDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = SEO_CONFIG[slug];
  const quizTitle = config?.title || "Architecture Quiz";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": quizTitle,
    "description": config?.description || "Test your architectural knowledge with this interactive quiz on Trapped Into Architecture.",
    "educationalLevel": "Intermediate",
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

  const breadcrumb = {
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": quizTitle,
        "item": `https://trappedintoarchitecture.com/quizzes/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}
