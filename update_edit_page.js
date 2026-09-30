const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

// Replace the naive companyId === "new" block with a real DB fetch from jobs!
const blockToReplace = `if (companyId === "new" || companyId === "null") {
        setFirmName(searchParams.get("name") || "");
        setCity(searchParams.get("city") || "");
        setState(searchParams.get("state") || "");
        setLoading(false);
      } else if (companyId) {
        fetchCompany();
      }`;

const newBlock = `if (companyId === "new" || companyId === "null") {
        fetchGhostCompany(searchParams.get("name") || "");
      } else if (companyId) {
        fetchCompany();
      }`;

content = content.replace(blockToReplace, newBlock);

const fetchFunctionToInsert = `
    const fetchGhostCompany = async (nameToFetch: string) => {
      setLoading(true);
      try {
        if (!nameToFetch) {
          setLoading(false);
          return;
        }
        setFirmName(nameToFetch);
        setCity(searchParams.get("city") || "");
        setState(searchParams.get("state") || "");

        // Try to fetch extended details from the most recent job posted by this firm
        const { data, error } = await supabase
          .from("jobs")
          .select("firm_name, city, state, organization_type, neighborhood, description, website, email, phone, logo_url")
          .eq("firm_name", nameToFetch)
          .order("posted_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          if (data.organization_type) setOrganizationType(data.organization_type);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.neighborhood) setArea(data.neighborhood);
          if (data.description) setCompanyDescription(data.description);
          if (data.website) setCompanyWebsite(data.website);
          if (data.email) setCompanyEmail(data.email);
          if (data.phone) setCompanyPhone(data.phone);
          if (data.logo_url) setCompanyLogo(data.logo_url);
        }
      } catch (err: any) {
        console.error("Error fetching ghost company data:", err.message);
      } finally {
        setLoading(false);
      }
    };
`;

content = content.replace('const fetchCompany = async () => {', fetchFunctionToInsert + '\n    const fetchCompany = async () => {');

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);