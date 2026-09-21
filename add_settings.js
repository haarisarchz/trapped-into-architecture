const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const settingsFetch = `  // Fetch Site Settings
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();
`;

if (!code.includes('siteSettings')) {
  code = code.replace(/  \/\/ Fetch Statistics/, settingsFetch + '\n  // Fetch Statistics');
  
  // Replace InteractiveHome props
  code = code.replace(
    /stats=\{stats\}/, 
    `stats={stats}
        siteSettings={siteSettings}`
  );
  
  fs.writeFileSync('app/page.tsx', code);
  console.log('Updated app/page.tsx with settings');
}
