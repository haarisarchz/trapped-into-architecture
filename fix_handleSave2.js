const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const regexInsert = /const companySlug = firmName\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\s\+\/g, "-"\)\.replace\(\/\[\^\\w-\]\+\/g, ""\);\s*const \{ error: insertError \} = await supabase\.from\("companies"\)\.insert\(\[\s*\{\s*\.\.\.companyPayload,\s*slug: companySlug,\s*created_by: authorId\s*\}\s*\]\);/;

const newInsert = `const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
        const origCb = searchParams.get("cb") || authorId;
        const origCa = searchParams.get("ca") || new Date().toISOString();
        const { error: insertError } = await supabase.from("companies").insert([
          { 
            ...companyPayload, 
            slug: companySlug, 
            created_by: origCb,
            created_at: origCa,
            updated_by: authorId,
            updated_at: new Date().toISOString()
          }
        ]);`;

if (regexInsert.test(content)) {
  content = content.replace(regexInsert, newInsert);
  
  // also fix the else block
  const regexElse = /let authorId = \(await supabase\.auth\.getUser\(\)\)\.data\.user\?\.id;\s*const \{ error: updateError \} = await supabase\.from\("companies"\)\.update\(\{/g;
  
  const newElse = `let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");
            authorId = user ? user.id : null;
          }
          const { error: updateError } = await supabase.from("companies").update({`;
          
  content = content.replace(regexElse, newElse);

  fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
  console.log("Successfully updated both blocks!");
} else {
  console.log("Failed to match regexInsert");
}