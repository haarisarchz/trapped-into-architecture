const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

// Replace the insert block to use original created_at and created_by if present, and to set updated_at / updated_by
// Note: we'll set updated_by in both insert and update. We will assume they will create the updated_by column.
content = content.replace(
  `          const { error: insertError } = await supabase.from("companies").insert([
            { ...companyPayload, slug: companySlug, created_by: authorId }
          ]);`,
  `          const originalCreatedBy = searchParams.get("cb");
          const originalCreatedAt = searchParams.get("ca");
          
          const insertPayload: any = { 
            ...companyPayload, 
            slug: companySlug, 
            created_by: originalCreatedBy || authorId,
            updated_by: authorId,
            updated_at: new Date().toISOString()
          };
          if (originalCreatedAt) {
            insertPayload.created_at = originalCreatedAt;
          }

          const { error: insertError } = await supabase.from("companies").insert([insertPayload]);`
);

content = content.replace(
  `const { error: updateError } = await supabase.from("companies").update(companyPayload).eq("id", companyId);`,
  `
          let authorId = (await supabase.auth.getUser()).data.user?.id;
          const { error: updateError } = await supabase.from("companies").update({
             ...companyPayload,
             updated_by: authorId || null,
             updated_at: new Date().toISOString()
          }).eq("id", companyId);`
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated edit page payload");