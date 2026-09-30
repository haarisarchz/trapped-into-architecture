const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

// 1. Remove the mistakenly injected block
const badBlock = `let favoriteCount = 0;
  try {
    const { count } = await supabase.from("favorite_companies").select("*", { count: "exact", head: true }).eq("company_slug", slug);
    if (count) favoriteCount = count;
  } catch (e) {}

  return (`;
content = content.replace(badBlock, 'return (');

// 2. Inject it at the right place (just after finding the company but before rendering)
const target = `const location = [company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ");`;
const properInjection = `let favoriteCount = 0;
    try {
      const { count } = await supabase.from("favorite_companies").select("*", { count: "exact", head: true }).eq("company_slug", slug);
      if (count) favoriteCount = count;
    } catch (e) {}
    
    const location = [company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ");`;

content = content.replace(target, properInjection);

fs.writeFileSync('app/companies/[slug]/page.tsx', content);