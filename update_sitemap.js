const fs = require('fs');
let code = fs.readFileSync('app/sitemap.ts', 'utf8');
code = code.replace(/\r\n/g, '\n');

const oldSnippet = `  // Fetch Jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at, posted_date')
    .eq('status', 'published');

  if (jobs) {
    jobs.forEach((job) => {
      sitemapData.push({
        url: \`\${BASE_URL}\${generateJobUrl(job)}\`,
        lastModified: job.updated_at || job.posted_date || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  }`;

const newSnippet = `  // Fetch Jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, city, state, updated_at, posted_date')
    .eq('status', 'published');

  if (jobs) {
    const citiesSet = new Set();
    const statesSet = new Set();

    jobs.forEach((job) => {
      sitemapData.push({
        url: \`\${BASE_URL}\${generateJobUrl(job)}\`,
        lastModified: job.updated_at || job.posted_date || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });

      if (job.city && job.city.trim()) {
        citiesSet.add(job.city.trim().toLowerCase().replace(/\\s+/g, "-"));
      }
      if (job.state && job.state.trim()) {
        statesSet.add(job.state.trim().toLowerCase().replace(/\\s+/g, "-"));
      }
    });

    // Add City programmatic landing pages
    citiesSet.forEach((citySlug) => {
      sitemapData.push({
        url: \`\${BASE_URL}/jobs/city/\${encodeURIComponent(citySlug)}\`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
    });

    // Add State programmatic landing pages
    statesSet.forEach((stateSlug) => {
      sitemapData.push({
        url: \`\${BASE_URL}/jobs/state/\${encodeURIComponent(stateSlug)}\`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  }`;

code = code.replace(oldSnippet, newSnippet);
fs.writeFileSync('app/sitemap.ts', code);
console.log('Successfully updated sitemap.ts');
