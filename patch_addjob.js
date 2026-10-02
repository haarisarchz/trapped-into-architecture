const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Remove the debug alert
file = file.replace('alert("DEBUG: image URL from DB is: " + job.image + " | apply_link is: " + job.apply_link + " | email is: " + job.application_email);\n', '');

// Find handleSmartExtraction and inject the local storage key reading
const extractStr = 'const response = await fetch("/api/extract-job", {';
const extractReplacement = `const userGeminiKey = localStorage.getItem("admin_gemini_key");
        if (!userGeminiKey) {
          alert("Please configure your Gemini API Key in the Settings page before using AI extraction.");
          setLoadingAI(false);
          return;
        }

        const response = await fetch("/api/extract-job", {
          headers: {
            "x-user-gemini-key": userGeminiKey
          },`;

if(file.includes(extractStr) && !file.includes('"x-user-gemini-key"')) {
   file = file.replace(extractStr, extractReplacement);
   console.log("Injected API key header into extract-job fetch");
}

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Cleaned up add-job page");
