import { generateJobUrl } from "@/utils/jobUrl";
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { CORE_METRO_CITIES, CORE_METRO_STATES } from '@/lib/channels';

const BASE_URL = 'https://trappedintoarchitecture.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/internships`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Fetch Jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, city, state, posted_date, post_expiry_date')
    .eq('status', 'published');

  if (jobs) {
    const cityCounts = new Map<string, number>();
    const stateCounts = new Map<string, number>();

    jobs.forEach((job) => {
      sitemapData.push({
        url: `${BASE_URL}${generateJobUrl(job)}`,
        lastModified: job.posted_date ? new Date(job.posted_date) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      if (job.city && job.city.trim()) {
        const cSlug = job.city.trim().toLowerCase().replace(/\s+/g, "-");
        cityCounts.set(cSlug, (cityCounts.get(cSlug) || 0) + 1);
      }
      if (job.state && job.state.trim()) {
        const sSlug = job.state.trim().toLowerCase().replace(/\s+/g, "-");
        stateCounts.set(sSlug, (stateCounts.get(sSlug) || 0) + 1);
      }
    });

    // 1. Core Metro Cities: ALWAYS included even if 0 current jobs (e.g. Kolkata)
    const addedCities = new Set<string>();
    CORE_METRO_CITIES.forEach((metro) => {
      const metroSlug = metro.replace(/\s+/g, "-");
      sitemapData.push({
        url: `${BASE_URL}/jobs/city/${encodeURIComponent(metroSlug)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
      addedCities.add(metroSlug);
    });

    // 2. Automated Rule: Add any city with >= 5 jobs
    cityCounts.forEach((count, citySlug) => {
      if (!addedCities.has(citySlug) && count >= 5) {
        sitemapData.push({
          url: `${BASE_URL}/jobs/city/${encodeURIComponent(citySlug)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        });
        addedCities.add(citySlug);
      }
    });

    // 3. States: Core states and any state with >= 5 jobs
    const addedStates = new Set<string>();
    CORE_METRO_STATES.forEach((st) => {
      const stSlug = st.replace(/\s+/g, "-");
      sitemapData.push({
        url: `${BASE_URL}/jobs/state/${encodeURIComponent(stSlug)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
      addedStates.add(stSlug);
    });

    stateCounts.forEach((count, stateSlug) => {
      if (!addedStates.has(stateSlug) && count >= 5) {
        sitemapData.push({
          url: `${BASE_URL}/jobs/state/${encodeURIComponent(stateSlug)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        });
        addedStates.add(stateSlug);
      }
    });
  }

  // Fetch Companies
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at, created_at');

  if (companies) {
    companies.forEach((company) => {
      sitemapData.push({
        url: `${BASE_URL}/companies/${company.slug}`,
        lastModified: company.updated_at || company.created_at || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  }

  // Fetch Quizzes
  try {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('slug, updated_at, created_at')
      .eq('is_published', true);

    if (quizzes && quizzes.length > 0) {
      sitemapData.push({
        url: `${BASE_URL}/quizzes`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      quizzes.forEach((quiz) => {
        if (quiz.slug) {
          sitemapData.push({
            url: `${BASE_URL}/quizzes/${quiz.slug}`,
            lastModified: quiz.updated_at || quiz.created_at || new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (err) {
    console.error('Error adding quizzes to sitemap:', err);
  }

  return sitemapData;
}