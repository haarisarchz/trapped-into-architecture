import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import InteractiveHome from "@/components/home/InteractiveHome";

export const metadata: Metadata = {
  title: "Trapped Into Architecture | Find Architecture Jobs Faster",
  description: "Discover architecture firms, internships, remote jobs, and career resources in one place.",
  openGraph: {
    title: "Trapped Into Architecture | Find Architecture Jobs Faster",
    description: "Discover architecture firms, internships, remote jobs, and career resources in one place.",
    type: "website",
  }
};

export default async function Home() {
  // Fetch Top Cities
  const { data: topCitiesData } = await supabase
    .from("jobs")
    .select("city")
    .eq("status", "published");
    
  const cityCounts = topCitiesData?.reduce((acc: any, curr) => {
    if (curr.city) acc[curr.city] = (acc[curr.city] || 0) + 1;
    return acc;
  }, {});
  
  const topCities = Object.entries(cityCounts || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6)
    .map(([city]) => city);

  // Fetch Top Positions
  const { data: topPositionsData } = await supabase
    .from("jobs")
    .select("position")
    .eq("status", "published");

  const positionCounts = topPositionsData?.reduce((acc: any, curr) => {
    if (curr.position) acc[curr.position] = (acc[curr.position] || 0) + 1;
    return acc;
  }, {});

  const topPositions = Object.entries(positionCounts || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6)
    .map(([position]) => position);

  // Fetch Companies
  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("firm_name, slug, city, logo_url")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Recent Jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Site Settings
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  // Fetch Statistics
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: jobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: companiesCount } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true });

  const stats = {
    users: usersCount || 0,
    jobs: jobsCount || 0,
    companies: companiesCount || 0,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Trapped Into Architecture",
    url: "https://trappedintoarchitecture.com"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <InteractiveHome 
        recentJobs={recentJobs || []} 
        recentCompanies={recentCompanies || []} 
        stats={stats}
        siteSettings={siteSettings} 
      />

      <Footer />
    </>
  );
}
