const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Add Import
if (!content.includes('import Autocomplete from "@/components/Autocomplete"')) {
    content = content.replace('import { createClientComponentClient }', 'import Autocomplete from "@/components/Autocomplete";\nimport { createClientComponentClient }');
}

// 2. Add States
if (!content.includes('selectedCompanyId')) {
    content = content.replace('const [firmName, setFirmName] = useState("");', 'const [firmName, setFirmName] = useState("");\n  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);\n  const [isCompanyProfileDirty, setIsCompanyProfileDirty] = useState(false);');
}

// 3. Mark all setCompany* with dirty
const setsToWatch = ['setCompanyLogo', 'setCompanyDescription', 'setCompanyWebsite', 'setCompanyEmail', 'setCompanyPhone', 'setCompanyFacebook', 'setCompanyInstagram', 'setCompanyLinkedin', 'setCompanyTwitter', 'setCompanyWhatsapp', 'setPrincipalArchitect', 'setEmployeeSize', 'setFoundedYear', 'setOrganizationType'];
setsToWatch.forEach(setter => {
    // We only want to inject inside the onChange logic, which is hard. We can just add a global useEffect that watches them if easier.
});

// Actually, injecting a useEffect is easier to watch these states!
const watchEffect = 
  useEffect(() => {
    if (selectedCompanyId) {
      setIsCompanyProfileDirty(true);
    }
  }, [companyLogo, companyDescription, companyWebsite, companyEmail, companyPhone, companyFacebook, companyInstagram, companyLinkedin, companyTwitter, companyWhatsapp, principalArchitect, employeeSize, foundedYear, organizationType]);
;
if (!content.includes('setIsCompanyProfileDirty(true)')) {
    content = content.replace('const [autoPublishSocial, setAutoPublishSocial] = useState(true);', 'const [autoPublishSocial, setAutoPublishSocial] = useState(true);\n' + watchEffect);
}

// 4. Update the firmName input to use Autocomplete
const firmNameRegex = /<input[\s\S]*?placeholder="Enter name"[\s\S]*?id="firm-suggestions"[\s\S]*?<\/datalist>/;
const firmNameReplacement = 
    <Autocomplete
      value={firmName}
      onChange={(val) => {
        setFirmName(val);
        if (selectedCompanyId) {
            setSelectedCompanyId(null);
            setIsCompanyProfileDirty(false);
        }
      }}
      onSelect={(val, record) => {
        setFirmName(val);
        setSelectedCompanyId(record.id);
        setOrganizationType(record.organization_type || "Firm");
        setArea(record.neighborhood || "");
        setCity(record.city || "");
        setState(record.state || "");
        setCompanyLogo(record.logo_url || "");
        setCompanyDescription(record.description || "");
        setCompanyWebsite(record.website || "");
        setCompanyEmail(record.email || "");
        setCompanyPhone(record.phone || "");
        setCompanyFacebook(record.facebook || "");
        setCompanyInstagram(record.instagram || "");
        setCompanyLinkedin(record.linkedin || "");
        setPrincipalArchitect(record.principal_architect || "");
        setEmployeeSize(record.employee_size || "");
        setFoundedYear(record.founded_year?.toString() || "");
        
        // Timeout to reset dirty flag after useEffect runs
        setTimeout(() => setIsCompanyProfileDirty(false), 50);
      }}
      fetchSuggestions={async (q) => {
        const { data } = await supabase.from('companies').select('*').ilike('firm_name', \%\%\).limit(10);
        return data || [];
      }}
      extractValue={(item) => item.firm_name}
      renderItem={(item) => (
        <div>
          <div className="font-bold">{item.firm_name}</div>
          <div className="text-xs text-gray-500">{item.city ? \\, \\ : item.organization_type}</div>
        </div>
      )}
      placeholder="Enter name"
      className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
    />
;
content = content.replace(firmNameRegex, firmNameReplacement.trim());

// 5. Update Neighborhood
const areaRegex = /<input[\s\S]*?value={area}[\s\S]*?onChange={\(e\) => setArea\(e.target.value\)}[\s\S]*?\/>/;
const areaReplacement = 
    <Autocomplete
      value={area}
      onChange={(val) => setArea(val)}
      fetchSuggestions={async (q) => {
        let query = supabase.from('companies').select('neighborhood').ilike('neighborhood', \%\%\);
        if (city) query = query.eq('city', city);
        const { data } = await query.limit(20);
        return Array.from(new Set(data?.map(d => d.neighborhood).filter(Boolean))) || [];
      }}
      placeholder="e.g. Adyar"
      className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
    />
;
content = content.replace(areaRegex, areaReplacement.trim());

// 6. Update City
const cityRegex = /<input[\s\S]*?value={city}[\s\S]*?list="cities"[\s\S]*?id="cities"[\s\S]*?<\/datalist>/;
const cityReplacement = 
    <Autocomplete
      value={city}
      onChange={(val) => setCity(val)}
      fetchSuggestions={async (q) => {
        let query = supabase.from('companies').select('city').ilike('city', \%\%\);
        if (state) query = query.eq('state', state);
        const { data } = await query.limit(20);
        return Array.from(new Set(data?.map(d => d.city).filter(Boolean))) || [];
      }}
      placeholder="e.g. Chennai"
      className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
    />
;
content = content.replace(cityRegex, cityReplacement.trim());

// 7. Update State
const stateRegex = /<input[\s\S]*?value={state}[\s\S]*?list="states"[\s\S]*?id="states"[\s\S]*?<\/datalist>/;
const stateReplacement = 
    <Autocomplete
      value={state}
      onChange={(val) => setState(val)}
      fetchSuggestions={async (q) => {
        const { data } = await supabase.from('companies').select('state').ilike('state', \%\%\).limit(20);
        return Array.from(new Set(data?.map(d => d.state).filter(Boolean))) || [];
      }}
      placeholder="e.g. Tamil Nadu"
      className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
    />
;
content = content.replace(stateRegex, stateReplacement.trim());

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log('Update part 1 done');