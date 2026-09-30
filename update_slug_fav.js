const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

if (!content.includes('initialFavorites=')) {
    content = content.replace(
        'let errorState = null;',
        `let errorState = null;\n  let favoriteCount = 0;`
    );
    
    // Add the query for favoriteCount
    const queryTarget = `if (companyError && companyError.code !== "PGRST116") {`;
    const newQuery = `
    const { count, error: countError } = await supabase
      .from('favorite_companies')
      .select('*', { count: 'exact', head: true })
      .eq('company_slug', slug);
    if (!countError && count !== null) {
      favoriteCount = count;
    }

    if (companyError && companyError.code !== "PGRST116") {`;
    
    content = content.replace(queryTarget, newQuery);
    
    content = content.replace(
        `<CompanyActions slug={slug} companyName={company.firm_name} variant="page" />`,
        `<CompanyActions slug={slug} companyName={company.firm_name} initialFavorites={favoriteCount} variant="page" />`
    );
    
    fs.writeFileSync('app/companies/[slug]/page.tsx', content);
}