const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

// The insert block currently looks like:
// const { error: insertError } = await supabase.from("companies").insert([
//   { ...companyPayload, slug: companySlug, created_by: authorId }
// ]);

content = content.replace(
  `const { error: insertError } = await supabase.from("companies").insert([
            { ...companyPayload, slug: companySlug, created_by: authorId }
          ]);`,
  `
          const originalCb = searchParams.get("cb");
          const originalCa = searchParams.get("ca");

          const finalCreatedBy = originalCb && originalCb !== "null" ? originalCb : authorId;
          const insertPayload: any = { 
            ...companyPayload, 
            slug: companySlug, 
            created_by: finalCreatedBy,
            updated_by: authorId || null,
            updated_at: new Date().toISOString()
          };
          
          if (originalCa && originalCa !== "null") {
            insertPayload.created_at = originalCa;
          }

          const { error: insertError } = await supabase.from("companies").insert([insertPayload]);
  `
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Fixed ghost company insert payload");