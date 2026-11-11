import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Council of Architecture (COA) Institutions Directory | B.Arch, M.Arch & Diploma",
  description:
    "Explore India's official Council of Architecture (COA) institution directory. Search 583 accredited colleges across B.Arch (UG), 38+ M.Arch (PG) specializations, and polytechnic diplomas with validated 2026-2027 intakes, multi-year statutory sanctions, and historical leadership records.",
  keywords: [
    "Council of Architecture",
    "COA approved colleges",
    "B.Arch colleges in India",
    "B.Arch intake 2026-2027",
    "M.Arch colleges in India",
    "Architecture diploma polytechnics",
    "NATA JEE Paper 2 colleges",
    "NIRF architecture rankings",
    "Architecture institution directory",
  ],
  openGraph: {
    title: "Council of Architecture (COA) National Directory | Trapped Into Architecture",
    description:
      "Explore 583 COA-recognized colleges across B.Arch, M.Arch (38+ specializations), and polytechnic diplomas with official 2026-27 approved intakes.",
    type: "website",
  },
};

export default function InstitutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
