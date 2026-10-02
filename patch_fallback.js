const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldLogic = `const userGeminiKey = localStorage.getItem("admin_gemini_key");
        if (!userGeminiKey) {
          alert("Please configure your Gemini API Key in the Settings page before using AI extraction.");
          setLoadingAI(false);
          return;
        }

        const response = await fetch("/api/extract-job", {
          headers: {
            "x-user-gemini-key": userGeminiKey
          },`;

const newLogic = `const userGeminiKey = localStorage.getItem("admin_gemini_key");
        
        const headers: any = {};
        if (userGeminiKey) {
          headers["x-user-gemini-key"] = userGeminiKey;
        }

        const response = await fetch("/api/extract-job", {
          headers,`;

if (file.includes('if (!userGeminiKey) {')) {
  file = file.replace(oldLogic, newLogic);
  fs.writeFileSync('app/admin/add-job/page.tsx', file);
  console.log("Removed strict local storage block");
} else {
  console.log("Could not find the block");
}
