const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const oldSave = `      let error;
      const user = JSON.parse(localStorage.getItem("currentUser") || "null");
      
      if (companyId === "new" || companyId === "null") {
        const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
        const { error: insertError } = await supabase.from("companies").insert([
          { ...companyPayload, slug: companySlug, created_by: user ? user.id : null }
        ]);
        error = insertError;`;

const newSave = `      let error;
      
      if (companyId === "new" || companyId === "null") {
        let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const user = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = user ? user.id : null;
        }
        
        const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
        const { error: insertError } = await supabase.from("companies").insert([
          { ...companyPayload, slug: companySlug, created_by: authorId }
        ]);
        error = insertError;`;

content = content.replace(oldSave, newSave);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated handleSave with RLS authorId fix");