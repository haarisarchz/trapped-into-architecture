const https = require('https');

https.get('https://www.trappedintoarchitecture.com/institutions?view=map', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Vercel ID:', res.headers['x-vercel-id']);
    console.log('Cache Status:', res.headers['x-vercel-cache']);
    
    // Check if the HTML contains the metadata or bundle references
    const hasMapKeyword = body.includes('Interactive Map') || body.includes('Interactive Architecture Map') || body.includes('viewMode');
    console.log('Contains Map in HTML:', hasMapKeyword);

    // Check SEO metadata keyword in head
    const hasMetaKeywords = body.includes('Interactive architecture map India');
    console.log('Contains new SEO keywords in <head>:', hasMetaKeywords);
  });
}).on('error', console.error);
