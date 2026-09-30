const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Import
if (!content.includes('FavoriteCompanyButton')) {
    content = content.replace('import { MapPin, Search, Filter, LayoutGrid, Rows3, List, Share2, Building2 } from "lucide-react";', 
        `import { MapPin, Search, Filter, LayoutGrid, Rows3, List, Share2, Building2 } from "lucide-react";\nimport FavoriteCompanyButton from "@/components/FavoriteCompanyButton";`);
}

// 2. Add State
if (!content.includes('favoritesCount')) {
    content = content.replace('const [jobs, setJobs] = useState<any[]>([]);', 
        `const [jobs, setJobs] = useState<any[]>([]);\n  const [favoritesCount, setFavoritesCount] = useState<any>({});`);
}

// 3. Fetch Data
if (!content.includes('favorite_companies')) {
    content = content.replace('setRealCompanies(companiesData || []);', 
        `setRealCompanies(companiesData || []);\n        \n        const { data: favData } = await supabase.from("favorite_companies").select("company_slug");\n        const counts: any = {};\n        if (favData) {\n          favData.forEach((f: any) => {\n            counts[f.company_slug] = (counts[f.company_slug] || 0) + 1;\n          });\n        }\n        setFavoritesCount(counts);`);
}

// 4. Update grouped data
if (!content.includes('favoriteCount: favoritesCount[comp.slug] || 0')) {
    content = content.replace('founded_year: comp.founded_year || null,', 
        `founded_year: comp.founded_year || null,\n          favoriteCount: favoritesCount[comp.slug || generateCompanySlug(comp.firm_name)] || 0,`);
}

if (!content.includes('favoriteCount: favoritesCount[generateCompanySlug(name)] || 0')) {
    content = content.replace('founded_year: null,', 
        `founded_year: null,\n            favoriteCount: favoritesCount[generateCompanySlug(name)] || 0,`);
}

fs.writeFileSync('app/companies/page.tsx', content);