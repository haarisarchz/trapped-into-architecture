const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldFetch = \      const response = await fetch("/api/extract-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: smartText,
        }),
      });

      const result = await response.json();

      const ai = JSON.parse(result.result);\;

const newFetch = \      let formData = new FormData();
      formData.append("mode", uploadMode);
      if (uploadMode === "text") {
        if (!smartText) throw new Error("Please paste text to extract.");
        formData.append("text", smartText);
      } else if (uploadMode === "image") {
        if (!smartImage) throw new Error("Please upload an image to extract.");
        formData.append("image", smartImage);
      } else {
        throw new Error("Mode not supported yet.");
      }

      const response = await fetch("/api/extract-job", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to extract");

      const ai = typeof result.result === "string" ? JSON.parse(result.result) : result;\;

code = code.replace(oldFetch, newFetch);

// Also fix mapping
code = code.replace(/setFirmName\(ai.firm_name \|\| ""\);/g, 'setFirmName(ai.company || "");');
code = code.replace(/setCompanyDescription\(ai.company_description \|\| ""\);/g, 'setCompanyDescription(ai.description || "");');
code = code.replace(/setapplication_email\(ai.application_email \|\| ""\);/g, 'setapplication_email(ai.applicationEmail || "");');
code = code.replace(/setLastDateToApply\(ai.last_date_to_apply \|\| ""\);/g, 'setLastDateToApply(ai.deadline || "");');

fs.writeFileSync('app/admin/add-job/page.tsx', code);
