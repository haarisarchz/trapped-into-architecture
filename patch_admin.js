const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// We want to handle the response of the social fetch and alert the user if it failed.
const oldFetch = `        if (status === "published" && autoPublishSocial) {
          fetch("/api/publish/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ job_id: jobData.id })
          }).catch(err => console.error("Social publish request failed", err));
        }`;

const newFetch = `        if (status === "published" && autoPublishSocial) {
          fetch("/api/publish/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ job_id: jobData.id })
          })
          .then(res => res.json())
          .then(data => {
             if (data && data.results) {
                const fails = data.results.filter((r: any) => r.value?.status === "failed");
                if (fails.length > 0) {
                   const errs = fails.map((f: any) => f.value.platform + ": " + f.value.error).join("\\n");
                   alert("Social Auto-Publish encountered errors:\\n" + errs + "\\n\\nPlease check your Meta/Twitter API tokens in Vercel.");
                } else {
                   console.log("Social publish success", data);
                }
             }
          })
          .catch(err => console.error("Social publish request failed", err));
        }`;

file = file.replace(oldFetch, newFetch);
fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched add-job page to show social API errors");
