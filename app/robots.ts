import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login', '/signup'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'cohere-ai',
          'Applebot-Extended'
        ],
        allow: '/',
        disallow: ['/admin/', '/login', '/signup'],
      }
    ],
    sitemap: 'https://trappedintoarchitecture.com/sitemap.xml',
  };
}
