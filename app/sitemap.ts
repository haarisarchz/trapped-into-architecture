import { generateJobUrl } from "@/utils/jobUrl";
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

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
    const citiesSet = new Set<string>();
    const statesSet = new Set<string>();

    jobs.forEach((job) => {
      sitemapData.push({
        url: `${BASE_URL}${generateJobUrl(job)}`,
        lastModified: job.posted_date ? new Date(job.posted_date) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      if (job.city && job.city.trim()) {
        citiesSet.add(job.city.trim().toLowerCase().replace(/\s+/g, "-"));
      }
      if (job.state && job.state.trim()) {
        statesSet.add(job.state.trim().toLowerCase().replace(/\s+/g, "-"));
      }
    });

    // Add City programmatic landing pages
    citiesSet.forEach((citySlug) => {
      sitemapData.push({
        url: `${BASE_URL}/jobs/city/${encodeURIComponent(citySlug)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
    });

    // Add State programmatic landing pages
    statesSet.forEach((stateSlug) => {
      sitemapData.push({
        url: `${BASE_URL}/jobs/state/${encodeURIComponent(stateSlug)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
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
