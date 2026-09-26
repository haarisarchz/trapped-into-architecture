const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /if \(error\) throw error;\s*jobData = data && data\.length > 0 \? data\[0\] : null;\s*\} else \{\s*const \{ data, error \} = await supabase\.from\("jobs"\)\.insert\(publicJobs\)\.select\(\);\s*if \(error\) throw error;\s*jobData = data && data\.length > 0 \? data\[0\] : null;\s*\}/s;

const replacement = `if (error) throw error;
        jobData = data && data.length > 0 ? data[0] : null;
        if (data) {
           const updatedPositions = positions.map((p, i) => ({ ...p, id: data[i]?.id || p.id }));
           setPositions(updatedPositions);
           setInitialJobIds(data.map(d => d.id));
        }
      } else {
        const { data, error } = await supabase.from("jobs").insert(publicJobs).select();
        if (error) throw error;
        jobData = data && data.length > 0 ? data[0] : null;
        if (data) {
           const updatedPositions = positions.map((p, i) => ({ ...p, id: data[i]?.id || p.id }));
           setPositions(updatedPositions);
           setInitialJobIds(data.map(d => d.id));
        }
      }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success updating positions with IDs");
} else {
  console.log("Regex not found");
}
