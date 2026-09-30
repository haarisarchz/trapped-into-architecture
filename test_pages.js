const http = require('http');

http.get('http://localhost:3000/companies/some-slug', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    if (data.includes('Error:')) {
      console.log("ERROR FOUND IN RESPONSE:", data.substring(data.indexOf('Error:'), data.indexOf('Error:') + 500));
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});

http.get('http://localhost:3000/admin/companies/edit/new', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("ADMIN EDIT STATUS:", res.statusCode);
    if (data.includes('Error:')) {
      console.log("ERROR FOUND IN ADMIN RESPONSE:", data.substring(data.indexOf('Error:'), data.indexOf('Error:') + 500));
    }
  });
}).on('error', (e) => {
  console.error(`Got admin error: ${e.message}`);
});