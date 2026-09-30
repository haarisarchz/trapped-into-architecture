const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
content = content.replace(
    'return (',
    'let favoriteCount = 0;\n  try {\n    const { count } = await supabase.from("favorite_companies").select("*", { count: "exact", head: true }).eq("company_slug", slug);\n    if (count) favoriteCount = count;\n  } catch (e) {}\n\n  return ('
);
fs.writeFileSync('app/companies/[slug]/page.tsx', content);