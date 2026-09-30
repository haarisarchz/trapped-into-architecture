const http = require('http');
http.get('http://localhost:3000/companies/some-slug', (res) => {
  console.log("SLUG STATUS:", res.statusCode);
});
http.get('http://localhost:3000/admin/companies/edit/new', (res) => {
  console.log("EDIT STATUS:", res.statusCode);
});