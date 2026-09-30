const fs = require('fs');
let content = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// 1. Update logo upload logic to use Base64
const uploadRegex = /const handleLogoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?catch \(err: any\) \{\s*console\.error\(err\);\s*alert\("Failed to upload logo"\);\s*setUploadingLogo\(false\);\s*\}\s*\};/s;

const newUploadLogic = `const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const { error } = await supabase.from('site_settings').update({ logo_url: base64String }).eq('id', 'global');
        if (error) {
          alert("Failed to save logo: " + error.message);
        } else {
          setSettings({ ...settings, logo_url: base64String });
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      alert("Failed to process logo");
      setUploadingLogo(false);
    }
  };`;

if (content.match(uploadRegex)) {
  content = content.replace(uploadRegex, newUploadLogic);
} else {
  console.log("Upload regex not found");
}

// 2. Update input accept and text
content = content.replace(
  /<input type="file" className="hidden" accept="image\/\*" onChange=\{handleLogoUpload\} disabled=\{uploadingLogo\} \/>/g,
  '<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />'
);
content = content.replace(
  /Max size 2MB\. Recommended format: PNG or SVG with transparent background\./g,
  'Max size 2MB. Recommended formats: PNG, JPG, JPEG, or SVG.'
);

fs.writeFileSync('app/admin/contact/page.tsx', content);
console.log("Updated admin contact upload logic");