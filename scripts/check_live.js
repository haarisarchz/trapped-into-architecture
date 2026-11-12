const https = require('https');

https.get('https://www.trappedintoarchitecture.com/institutions?_cb=' + Date.now(), (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Age:', res.headers['age']);
    console.log('Vercel ID:', res.headers['x-vercel-id']);
    
    // Find all script tags in the page
    const scriptMatches = body.match(/\/static\/chunks\/[^\"]+/g) || [];
    console.log('Total Next.js script chunks referenced:', scriptMatches.length);
    
    // Check if any of the chunks contain Split Explorer
    const targetChunks = scriptMatches.slice(0, 8);
    let checked = 0;
    targetChunks.forEach(chunkPath => {
      const url = 'https://www.trappedintoarchitecture.com/_next' + chunkPath.replace('/static', '/static');
      https.get(url, (cRes) => {
        let chunkBody = '';
        cRes.on('data', d => chunkBody += d);
        cRes.on('end', () => {
          checked++;
          if (chunkBody.includes('Split Explorer') || chunkBody.includes('COA National Directory')) {
            console.log('>>> FOUND HYBRID A IN CHUNK:', chunkPath);
          }
          if (checked === targetChunks.length) {
            console.log('Done checking main chunks');
          }
        });
      });
    });
  });
}).on('error', console.error);
