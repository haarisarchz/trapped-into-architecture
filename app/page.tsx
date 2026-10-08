// @ts-nocheck
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

export const revalidate = 0;

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
  
  // Fetch real companies
  const { data: allRealCompanies } = await supabase.from('companies').select('*');
  const groupedCompanies: any = {};
  const idToName: any = {};

  (allRealCompanies || []).forEach((comp: any) => {
    if (!comp.firm_name) return;
    groupedCompanies[comp.firm_name] = {
      firm_name: comp.firm_name,
      slug: comp.slug || comp.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      city: comp.city || '',
      logo_url: comp.logo_url || '',
      organization_type: comp.organization_type || 'Architecture Firm',
      created_at: comp.created_at ? new Date(comp.created_at).getTime() : 0,
      job_count: 0
    };
    if (comp.id) idToName[comp.id] = comp.firm_name;
  });

  const { data: allPublishedJobs } = await supabase.from('jobs').select('firm_name, company_id, city, organization_type, posted_date').eq('status', 'published');
  
  (allPublishedJobs || []).forEach((job: any) => {
    let name = job.firm_name;
    if (job.company_id && idToName[job.company_id]) name = idToName[job.company_id];
    if (!name) return;
    
    const jobDate = job.posted_date ? new Date(job.posted_date).getTime() : 0;
    
    if (!groupedCompanies[name]) {
      groupedCompanies[name] = {
        firm_name: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        city: job.city || '',
        organization_type: job.organization_type || 'Architecture Firm',
        logo_url: '',
        created_at: jobDate,
        job_count: 1
      };
    } else {
      groupedCompanies[name].job_count += 1;
      if (groupedCompanies[name].created_at === 0 || jobDate > groupedCompanies[name].created_at) {
         groupedCompanies[name].created_at = jobDate;
      }
    }
  });

  const companiesArray = Object.values(groupedCompanies) as any[];
  
  // Latest: Sorted by created_at (descending)
  const recentCompanies = [...companiesArray].sort((a, b) => b.created_at - a.created_at).slice(0, 10);
  
  // Most Jobs Posted: Sorted by job_count (descending), then by created_at (descending)
  const mostJobsCompanies = [...companiesArray].sort((a, b) => {
    if (b.job_count !== a.job_count) {
      return b.job_count - a.job_count;
    }
    return b.created_at - a.created_at;
  }).slice(0, 10);

  const popularCompanies = [...mostJobsCompanies]; // Fallback for popular


  // Fetch Recent Jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("posted_date", { ascending: false })
    .limit(8);

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

  const { data: jobsData } = await supabase
    .from("jobs")
    .select("employment_type, position, status");

  let jobsCount = 0;
  let internshipsCount = 0;

  if (jobsData) {
    jobsData.forEach(job => {
      const isIntern = job.employment_type === 'Internship' || (job.position && job.position.toLowerCase().includes('intern'));
      if (isIntern) {
        internshipsCount++;
      } else {
        jobsCount++;
      }
    });
  }

  const { count: companiesCount } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true });

  const stats = {
    users: usersCount || 0,
    jobs: jobsCount || 0,
    internships: internshipsCount || 0,
    companies: Object.keys(groupedCompanies).length || 0,
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
        popularJobs={recentJobs ? [...recentJobs].reverse() : []}
        recentCompanies={recentCompanies || []} 
        popularCompanies={recentCompanies ? [...recentCompanies].reverse() : []}
        mostJobsCompanies={recentCompanies || []}
        stats={stats}
        siteSettings={siteSettings} 
      />

      <Footer />
    </>
  );
}


