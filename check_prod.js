const https = require('https');
https.get('https://www.trappedintoarchitecture.com/admin', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('<a') && data.includes('View Website')) {
       console.log('DEPLOYED: Link found.');
    } else {
       console.log('NOT SURE. HTML contains:', data.substring(0, 200));
       console.log('View Website index:', data.indexOf('View Website'));
       const idx = data.indexOf('View Website');
       if (idx !== -1) {
           console.log(data.substring(idx - 100, idx + 100));
       }
    }
  });
});
