const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// Replace the entire risky fetch block with a safe version
const old1 = `      if (compError) throw new Error(compError.message);

      setJobs(jobsData || []);
      setRealCompanies(companiesData || []);
        
        const { data: favData } = await supabase.from("favorite_companies").select("company_slug");
        const counts: any = {};
        if (favData) {
          favData.forEach((f: any) => {
            counts[f.company_slug] = (counts[f.company_slug] || 0) + 1;
          });
        }
        setFavoritesCount(counts);`;

const new1 = `      // Non-fatal: log warning but don't crash page
      if (compError && compError.code !== "PGRST116") {
        console.warn("Companies fetch warning:", compError.message);
      }

      setJobs(jobsData || []);
      setRealCompanies(companiesData || []);

      // Isolated: if favorite_companies table doesn't exist yet, silently skip
      try {
        const { data: favData, error: favError } = await supabase
          .from("favorite_companies")
          .select("company_slug");
        if (!favError && favData) {
          const counts: any = {};
          favData.forEach((f: any) => {
            counts[f.company_slug] = (counts[f.company_slug] || 0) + 1;
          });
          setFavoritesCount(counts);
        }
      } catch {
        // Table not ready yet — page still works, favorites show 0
      }`;

if (content.includes(old1)) {
    content = content.replace(old1, new1);
    fs.writeFileSync('app/companies/page.tsx', content);
    console.log('REPLACED OK');
} else {
    // Try normalized version
    const normalized = content.replace(/\r\n/g, '\n');
    const old1n = old1.replace(/\r\n/g, '\n');
    if (normalized.includes(old1n)) {
        const result = normalized.replace(old1n, new1);
        fs.writeFileSync('app/companies/page.tsx', result);
        console.log('REPLACED OK (normalized)');
    } else {
        console.log('NOT FOUND - printing surrounding lines');
        const lines = content.split('\n');
        for (let i = 68; i <= 84; i++) {
            console.log(i + ':', JSON.stringify(lines[i]));
        }
    }
}