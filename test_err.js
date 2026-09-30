const http = require('http');
http.get('http://localhost:3000/admin/companies/edit/new', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    if (data.includes('Error:') || data.includes('Something went wrong') || data.includes('Unhandled Runtime Error')) {
      const idx = data.indexOf('Unhandled Runtime Error') !== -1 ? data.indexOf('Unhandled Runtime Error') : data.indexOf('Something went wrong');
      console.log("Found error text:", data.substring(idx - 100, idx + 500));
    } else {
      console.log("No error found in HTML string. Length: " + data.length);
      const fs = require('fs');
      fs.writeFileSync('edit_page_html.html', data);
    }
  });
});