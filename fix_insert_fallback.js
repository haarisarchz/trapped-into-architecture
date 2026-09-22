const fs = require('fs');

let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldInsert = /const \{ data, error \} = await supabase\n\s*\.from\("jobs"\)\n\s*\.insert\(\[jobPayload\]\)\n\s*\.select\(\)\n\s*\.single\(\);/;

const newInsert = `let { data, error } = await supabase
        .from("jobs")
        .insert([jobPayload])
        .select()
        .single();
      
      // Fallback if author_id column is missing
      if (error && error.message && error.message.includes("author_id")) {
        delete (jobPayload as any).author_id;
        const retry = await supabase
          .from("jobs")
          .insert([jobPayload])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }`;

if (code.match(oldInsert)) {
  code = code.replace(oldInsert, newInsert);
  fs.writeFileSync('app/admin/add-job/page.tsx', code);
}

const oldUpdate = /const \{ error \} = await supabase\n\s*\.from\("jobs"\)\n\s*\.update\(jobPayload\)\n\s*\.eq\("id", jobId\);/;

const newUpdate = `let { error } = await supabase
        .from("jobs")
        .update(jobPayload)
        .eq("id", jobId);

      // Fallback if author_id column is missing
      if (error && error.message && error.message.includes("author_id")) {
        delete (jobPayload as any).author_id;
        const retry = await supabase
          .from("jobs")
          .update(jobPayload)
          .eq("id", jobId);
        error = retry.error;
      }`;

if (code.match(oldUpdate)) {
  code = code.replace(oldUpdate, newUpdate);
  fs.writeFileSync('app/admin/add-job/page.tsx', code);
}
