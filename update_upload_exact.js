const fs = require('fs');
let content = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const uploadRegex = /const handleLogoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?setUploadingLogo\(false\);\s*\}\s*\};/s;

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
        // Also automatically save it to database to mirror previous behavior
        const { error } = await supabase.from('site_settings').update({ logo_url: base64String }).eq('id', 'global');
        if (error) {
          alert("Failed to save logo automatically: " + error.message);
        }
        setSettings(prev => ({ ...prev, logo_url: base64String }));
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      alert("Error uploading logo: " + error.message);
      setUploadingLogo(false);
    }
  };`;

if (content.match(uploadRegex)) {
  content = content.replace(uploadRegex, newUploadLogic);
  fs.writeFileSync('app/admin/contact/page.tsx', content);
  console.log("Updated handleLogoUpload");
} else {
  console.log("Could not find handleLogoUpload");
}