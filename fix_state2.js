const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  'const [city, setCity] =',
  'const [country, setCountry] = useState("India");\n  const [city, setCity] ='
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Fixed state definition");