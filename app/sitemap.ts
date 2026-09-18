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
  ];

  // Fetch Jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at, posted_date')
    .eq('status', 'published');

  if (jobs) {
    jobs.forEach((job) => {
      sitemapData.push({
        url: `${BASE_URL}/jobs/${job.id}`,
        lastModified: job.updated_at || job.posted_date || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
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

  return sitemapData;
}
