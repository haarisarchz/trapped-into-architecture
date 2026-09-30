const https = require('https');
https.get('https://www.trappedintoarchitecture.com/jobs', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.includes('No jobs found') ? 'No jobs found on UI' : 'Jobs exist on UI');
  });
});