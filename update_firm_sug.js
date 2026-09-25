const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const fetchSug = 'fetchSuggestions={async (q) => {\n' +
'      const { data: cData } = await supabase.from(\"companies\").select(\"*\").ilike(\"firm_name\", \%\%\).limit(10);\n' +
'      const { data: jData } = await supabase.from(\"jobs\").select(\"firm_name, city, state, organization_type, neighborhood, description, website, email, phone, logo_url\").ilike(\"firm_name\", \%\%\).limit(10);\n' +
'      const combined = [...(cData || []), ...(jData || [])];\n' +
'      const unique = Array.from(new Map(combined.map(item => [item.firm_name, item])).values());\n' +
'      return unique;\n' +
'    }}';

c = c.replace(/fetchSuggestions=\{async \(q\) => \{[\s\S]*?return data \|\| \[\];\s*\}\}/, fetchSug);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done firm suggestions');