const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const regexElse = /let authorId = \(await supabase\.auth\.getUser\(\)\)\.data\.user\?\.id;\s*const \{ error: updateError \} = await supabase\.from\("companies"\)\.update\(\{/;

const newElse = `let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");
            authorId = user ? user.id : null;
          }
          const { error: updateError } = await supabase.from("companies").update({`;

if (regexElse.test(content)) {
  content = content.replace(regexElse, newElse);
  fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
  console.log("Successfully patched else block with fallback!");
} else {
  console.log("Failed to match else block");
}