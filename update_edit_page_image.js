const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

if (!content.includes('import ImageUploader')) {
  content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport ImageUploader from "@/components/ImageUploader";');
}

// Remove handleImageUpload
content = content.replace(/const handleImageUpload = async \([\s\S]*?setUploadingImage\(false\);\s*\};\s*/g, '');
content = content.replace(/const \[uploadingImage, setUploadingImage\] = useState\(false\);/, '');

// Replace Logo input
content = content.replace(/<label className="block mb-1\.5 text-sm font-medium">\{organizationType\} Logo<\/label>[\s\S]*?<\/div>\s*\)\}/g, 
  `<label className="block mb-3 text-sm font-medium">{organizationType} Logo</label>
                <ImageUploader value={companyLogo} onChange={(url) => setCompanyLogo(url)} label="Upload Logo" />`);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated edit page with ImageUploader");