const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const regex = /if \(companyId === "new" \|\| companyId === "null"\) \{[\s\S]*?let authorId = \(await supabase\.auth\.getUser\(\)\)\.data\.user\?\.id;[\s\S]*?if \(!authorId\) \{[\s\S]*?const user = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);[\s\S]*?authorId = user \? user\.id : null;[\s\S]*?\}[\s\S]*?const companySlug = firmName\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\s\+\/g, "-"\)\.replace\(\/\[\^\\w-\]\+\/g, ""\);[\s\S]*?const \{ error: insertError \} = await supabase\.from\("companies"\)\.insert\(\[[\s\S]*?\{ \.\.\.companyPayload, slug: companySlug, created_by: authorId \}[\s\S]*?\]\);[\s\S]*?error = insertError;[\s\S]*?\}/;

const newBlock = `if (companyId === "new" || companyId === "null") {
          let currentAdminId = (await supabase.auth.getUser()).data.user?.id;
          if (!currentAdminId) {
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");
            currentAdminId = user ? user.id : null;
          }
          
          const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
          
          // Ghost companies should retain their original author and creation date if possible
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
        }`;

if (regex.test(content)) {
  content = content.replace(regex, newBlock);
  fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
  console.log("Successfully patched ghost company formalization!");
} else {
  console.log("Failed to match ghost company formalization block.");
}