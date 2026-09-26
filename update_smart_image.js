const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const replacement = `  onClick={async () => {
    try {
      setLoadingAI("loading");

      if (uploadMode === "image" && smartImage) {
        try {
          const extMatch = smartImage.name.match(/\\.[0-9a-z]+$/i);
          const ext = extMatch ? extMatch[0].toLowerCase() : '';
          const fileName = \`smart-upload-\${Date.now()}\${ext}\`;
          const { data, error } = await supabase.storage.from("job-images").upload(fileName, smartImage);
          if (!error) {
             const { data: { publicUrl } } = supabase.storage.from("job-images").getPublicUrl(fileName);
             setImageUrl(publicUrl);
          } else {
             console.error("Smart image upload failed", error);
          }
        } catch (e) {
          console.error("Storage error:", e);
        }
      }

      let formData = new FormData();`;

const target = `  onClick={async () => {
    try {
      setLoadingAI("loading");

      let formData = new FormData();`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success");
} else {
  console.log("Not found, trying regex...");
  const regex = /onClick=\{async \(\) => \{\s*try \{\s*setLoadingAI\("loading"\);\s*let formData = new FormData\(\);/s;
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('app/admin/add-job/page.tsx', content);
    console.log("Success with regex");
  } else {
    console.log("Completely not found.");
  }
}