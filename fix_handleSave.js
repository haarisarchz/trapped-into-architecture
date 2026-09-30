const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const targetSaveBlock = `        let error;
        
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
          error = insertError;
        } else {
          
            let authorId = (await supabase.auth.getUser()).data.user?.id;
            const { error: updateError } = await supabase.from("companies").update({
               ...companyPayload,
               updated_by: authorId || null,
               updated_at: new Date().toISOString()
            }).eq("id", companyId);
          error = updateError;
        }`;

const newSaveBlock = `        let error;
        
        if (companyId === "new" || companyId === "null") {
          let currentAdminId = (await supabase.auth.getUser()).data.user?.id;
          if (!currentAdminId) {
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");
            currentAdminId = user ? user.id : null;
          }
          
          const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
          
          const origCb = searchParams.get("cb") || currentAdminId;
          const origCa = searchParams.get("ca") || new Date().toISOString();

          const { error: insertError } = await supabase.from("companies").insert([
            { 
              ...companyPayload, 
              slug: companySlug, 
              created_by: origCb,
              created_at: origCa,
              updated_by: currentAdminId,
              updated_at: new Date().toISOString()
            }
          ]);
          error = insertError;
        } else {
            let authorId = (await supabase.auth.getUser()).data.user?.id;
            if (!authorId) {
              const user = JSON.parse(localStorage.getItem("currentUser") || "null");
              authorId = user ? user.id : null;
            }
            const { error: updateError } = await supabase.from("companies").update({
               ...companyPayload,
               updated_by: authorId || null,
               updated_at: new Date().toISOString()
            }).eq("id", companyId);
          error = updateError;
        }`;

if (content.includes(targetSaveBlock)) {
  content = content.replace(targetSaveBlock, newSaveBlock);
  fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
  console.log("Successfully updated handleSave");
} else {
  console.log("Could not find the target save block");
}