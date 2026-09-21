const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

if (!code.includes('internshipsCount')) {
  code = code.replace(
    'const { count: jobsCount } = await supabase',
    'const { count: internshipsCount } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "published").ilike("employment_type", "%Internship%");\n  const { count: jobsCount } = await supabase'
  );

  code = code.replace(
    'jobs: jobsCount || 0,',
    'jobs: jobsCount || 0,\n    internships: internshipsCount || 0,'
  );

  // Update recentCompanies to include open job counts
  code = code.replace(
    /const \{ data: recentCompanies \} = await supabase[\s\S]*?\.limit\(6\);/,
    `const { data: recentCompaniesData } = await supabase
      .from("companies")
      .select("firm_name, slug, city, logo_url")
      .order("created_at", { ascending: false })
      .limit(4);

    // Fetch job counts for these companies
    const recentCompanies = await Promise.all((recentCompaniesData || []).map(async (company) => {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("company", company.firm_name)
        .eq("status", "published");
      return { ...company, open_jobs: count || 0 };
    }));`
  );

  fs.writeFileSync('app/page.tsx', code);
  console.log('Updated app/page.tsx');
}
