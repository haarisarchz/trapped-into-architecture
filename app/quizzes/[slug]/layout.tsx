import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("title, description, cover_image, category")
      .eq("slug", slug)
      .maybeSingle();

    if (!quiz) {
      return { title: "Architecture Quiz" };
    }

    const title = `${quiz.title} | Architecture Quiz & Practice Test`;
    const description = quiz.description || `Test your knowledge with the ${quiz.title} architectural quiz on Trapped Into Architecture.`;
    const url = `https://trappedintoarchitecture.com/quizzes/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${quiz.title} | Trapped Into Architecture`,
        description,
        url,
        images: quiz.cover_image ? [quiz.cover_image] : ["https://trappedintoarchitecture.com/og-image.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: `${quiz.title} | Trapped Into Architecture`,
        description,
        images: quiz.cover_image ? [quiz.cover_image] : ["https://trappedintoarchitecture.com/og-image.png"],
      },
    };
  } catch {
    return { title: "Architecture Quiz" };
  }
}

export default function QuizDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
