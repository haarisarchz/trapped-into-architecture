const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const jobsFetch = `  // Fetch Recent Jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
`;

if (!code.includes('recentJobs')) {
  code = code.replace(/  \/\/ Fetch Statistics/, jobsFetch + '\n  // Fetch Statistics');
  
  // Replace InteractiveHome props
  code = code.replace(
    /<InteractiveHome[\s\S]*?\/>/, 
    `<InteractiveHome 
        recentJobs={recentJobs || []} 
        recentCompanies={recentCompanies || []} 
        stats={stats} 
      />`
  );
  
  fs.writeFileSync('app/page.tsx', code);
  console.log('Updated app/page.tsx');
}
