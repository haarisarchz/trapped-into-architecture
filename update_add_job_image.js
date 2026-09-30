const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Add import
if (!content.includes('import ImageUploader')) {
  content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport ImageUploader from "@/components/ImageUploader";');
}

// Replace Job Image input
const oldJobImage = `<label className="block mb-1.5 text-sm font-medium">Upload Job Image <span className="text-red-500 text-xl font-bold">*</span></label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  {uploadingImage && (<div className="mt-3 flex items-center gap-2 text-blue-600"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p>Uploading image...</p></div>)}
                  {uploadSuccess && (<div className="mt-3 flex items-center gap-2 text-green-600"><span className="text-xl">✓</span><p>Image uploaded successfully</p></div>)}
                  {imageUrl && (<div className="mt-5"><img src={imageUrl} alt="Job Preview" className="w-full h-auto max-h-64 object-cover rounded-xl border shadow-sm" /></div>)}`;

const newJobImage = `<label className="block mb-3 text-sm font-medium">Upload Job Image <span className="text-red-500 text-xl font-bold">*</span></label>
                  <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url)} label="Upload Job Image" />`;

// Handle uploadingImage references in submit validation
content = content.replace(`if (uploadingImage) {
        alert("Please wait until image upload finishes");
        setIsPublishing(false);
        return;
      }`, '');

content = content.replace(`disabled={uploadingImage || isPublishing}`, `disabled={isPublishing}`);
content = content.replace(`uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        :`, `isPublishing
        ? "bg-gray-400 text-white cursor-not-allowed"
        :`);
content = content.replace(`{isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}`, `{isPublishing ? "Publishing..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}`);

// Replace Company Logo input
const oldCompanyLogo = `<label className="block mb-1.5 text-sm font-medium">{organizationType} Logo</label>
                    <input type="file" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    {companyLogo && (<div className="mt-2"><img src={companyLogo} alt="Company Logo" className="w-20 h-20 object-contain rounded border shadow-sm bg-white" /></div>)}`;

const newCompanyLogo = `<label className="block mb-3 text-sm font-medium">{organizationType} Logo</label>
                    <ImageUploader value={companyLogo} onChange={(url) => setCompanyLogo(url)} label="Upload Logo" />`;


content = content.replace(oldJobImage, newJobImage);
content = content.replace(oldCompanyLogo, newCompanyLogo);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job page with ImageUploader");