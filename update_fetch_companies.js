const fs = require('fs');
let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

const newFetch = `  const [realCompanies, setRealCompanies] = useState<any[]>([]);

  const fetchCompanies = async () => {
    // Fetch jobs
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("*").eq("status", "published");
    if (jobsError) console.log(jobsError);
    else setJobs(jobsData || []);

    // Fetch real companies
    const { data: companiesData, error: compError } = await supabase.from("companies").select("*");
    if (compError) console.log(compError);
    else setRealCompanies(companiesData || []);

    setLoading(false);
  };`;

// Replace the old fetchCompanies logic
// First we need to find the old one
const startIndex = code.indexOf('const fetchCompanies = async () => {');
const endIndex = code.indexOf('};', startIndex) + 2;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newFetch + code.substring(endIndex);
}

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Done replacing fetchCompanies');
